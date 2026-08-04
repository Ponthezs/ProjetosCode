import uuid
from typing import List, Optional, Dict, Any
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session
from models.transaction import Transaction
from models.split import TransactionSplit
from repositories.transaction_repo import TransactionRepository
from repositories.account_repo import AccountRepository
from utils.logger import logger

class TransactionService:
    def __init__(self, db: Session):
        self.db = db
        self.trans_repo = TransactionRepository(db)
        self.acc_repo = AccountRepository(db)

    def create_transaction(
        self,
        description: str,
        amount: float,
        transaction_date: date,
        type_: str = "Despesa",
        payment_method: str = "Cartão de Crédito",
        status: str = "Pago",
        category_id: Optional[int] = None,
        subcategory_id: Optional[int] = None,
        account_id: Optional[int] = None,
        card_id: Optional[int] = None,
        owner_id: Optional[int] = None,
        tags: str = "",
        notes: str = "",
        installments: int = 1,
        splits: Optional[List[Dict[str, Any]]] = None,
        source: str = "Manual"
    ) -> List[Transaction]:
        created_transactions = []
        installment_group = str(uuid.uuid4()) if installments > 1 else None

        installment_amount = amount / installments if installments > 1 else amount

        for i in range(installments):
            # Calcular data para parcelas subsequentes (+1 mes a cada parcela)
            current_date = transaction_date + relativedelta(months=i)
            desc = f"{description} ({i+1}/{installments})" if installments > 1 else description

            trans = Transaction(
                description=desc,
                amount=round(installment_amount, 2),
                transaction_date=current_date,
                type=type_,
                payment_method=payment_method,
                status=status,
                category_id=category_id,
                subcategory_id=subcategory_id,
                account_id=account_id,
                card_id=card_id,
                owner_id=owner_id,
                installment_number=i + 1,
                total_installments=installments,
                installment_group_id=installment_group,
                tags=tags,
                notes=notes,
                source=source
            )
            saved_trans = self.trans_repo.add(trans)

            # Salvar divisão de despesas se informada
            if splits:
                adjusted_splits = []
                for s in splits:
                    adjusted_splits.append({
                        'owner_id': s['owner_id'],
                        'amount': round(s['amount'] / installments, 2) if installments > 1 else s['amount'],
                        'percentage': s.get('percentage', 0.0)
                    })
                self.trans_repo.save_splits(saved_trans.id, adjusted_splits)

            # Atualizar saldo da conta associada se status for Pago
            if status == "Pago" and account_id:
                if type_ in ["Receita", "Reembolso"]:
                    self.acc_repo.update_balance(account_id, installment_amount)
                elif type_ in ["Despesa", "Investimento"]:
                    self.acc_repo.update_balance(account_id, -installment_amount)

            created_transactions.append(saved_trans)

        logger.info(f"Criada(s) {len(created_transactions)} transacao(oes) para '{description}'.")
        return created_transactions

    def update_transaction(
        self,
        transaction_id: int,
        **kwargs
    ) -> Optional[Transaction]:
        trans = self.trans_repo.get_by_id(transaction_id)
        if not trans:
            return None

        # Reverter impacto no saldo antigo se a conta e valor mudaram
        if trans.status == "Pago" and trans.account_id:
            if trans.type in ["Receita", "Reembolso"]:
                self.acc_repo.update_balance(trans.account_id, -trans.amount)
            elif trans.type in ["Despesa", "Investimento"]:
                self.acc_repo.update_balance(trans.account_id, trans.amount)

        # Aplicar atualizações
        for key, value in kwargs.items():
            if hasattr(trans, key) and key != "splits":
                setattr(trans, key, value)

        updated_trans = self.trans_repo.update(trans)

        # Atualizar splits se fornecido
        if "splits" in kwargs and kwargs["splits"] is not None:
            self.trans_repo.save_splits(updated_trans.id, kwargs["splits"])

        # Aplicar novo impacto no saldo se pago
        if updated_trans.status == "Pago" and updated_trans.account_id:
            if updated_trans.type in ["Receita", "Reembolso"]:
                self.acc_repo.update_balance(updated_trans.account_id, updated_trans.amount)
            elif updated_trans.type in ["Despesa", "Investimento"]:
                self.acc_repo.update_balance(updated_trans.account_id, -updated_trans.amount)

        return updated_trans

    def delete_transaction(self, transaction_id: int) -> bool:
        trans = self.trans_repo.get_by_id(transaction_id)
        if trans and trans.status == "Pago" and trans.account_id:
            if trans.type in ["Receita", "Reembolso"]:
                self.acc_repo.update_balance(trans.account_id, -trans.amount)
            elif trans.type in ["Despesa", "Investimento"]:
                self.acc_repo.update_balance(trans.account_id, trans.amount)
        return self.trans_repo.delete(transaction_id)
