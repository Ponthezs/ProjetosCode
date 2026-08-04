from typing import List
from datetime import date
from sqlalchemy.orm import Session
from models.fixed_expense import FixedExpense
from models.subscription import Subscription
from models.refund import Refund
from repositories.recurring_repo import FixedExpenseRepository, SubscriptionRepository, RefundRepository
from services.transaction_service import TransactionService
from utils.logger import logger

class RecurringService:
    def __init__(self, db: Session):
        self.db = db
        self.fixed_repo = FixedExpenseRepository(db)
        self.sub_repo = SubscriptionRepository(db)
        self.refund_repo = RefundRepository(db)
        self.trans_service = TransactionService(db)

    def process_monthly_recurring(self, month: int, year: int) -> int:
        """Gera automaticamente lançamentos de gastos fixos no mês correspondente se ativado."""
        active_fixed = self.fixed_repo.get_active()
        generated_count = 0

        for item in active_fixed:
            if item.auto_generate:
                due_date = date(year, month, min(item.due_day, 28))
                
                # Criar lançamento
                self.trans_service.create_transaction(
                    description=f"[Fixo] {item.description}",
                    amount=item.amount,
                    transaction_date=due_date,
                    type_="Despesa",
                    payment_method="Boleto",
                    status="Pendente",
                    category_id=item.category_id,
                    account_id=item.account_id,
                    owner_id=item.owner_id,
                    source="GastosFixos"
                )
                generated_count += 1

        logger.info(f"Gerados {generated_count} gastos fixos recorrentes para {month}/{year}.")
        return generated_count
