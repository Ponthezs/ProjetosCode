from typing import List, Optional, Dict, Any
from datetime import date
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, extract
from models.transaction import Transaction
from models.split import TransactionSplit
from repositories.base_repository import BaseRepository

class TransactionRepository(BaseRepository[Transaction]):
    def __init__(self, db: Session):
        super().__init__(Transaction, db)

    def get_filtered(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        type_: Optional[str] = None,
        category_id: Optional[int] = None,
        subcategory_id: Optional[int] = None,
        account_id: Optional[int] = None,
        card_id: Optional[int] = None,
        owner_id: Optional[int] = None,
        status: Optional[str] = None,
        tag: Optional[str] = None,
        search_query: Optional[str] = None
    ) -> List[Transaction]:
        query = self.db.query(Transaction).options(
            joinedload(Transaction.category),
            joinedload(Transaction.subcategory),
            joinedload(Transaction.account),
            joinedload(Transaction.card),
            joinedload(Transaction.owner),
            joinedload(Transaction.splits)
        )

        if start_date:
            query = query.filter(Transaction.transaction_date >= start_date)
        if end_date:
            query = query.filter(Transaction.transaction_date <= end_date)
        if type_ and type_ != "Todos":
            query = query.filter(Transaction.type == type_)
        if category_id:
            query = query.filter(Transaction.category_id == category_id)
        if subcategory_id:
            query = query.filter(Transaction.subcategory_id == subcategory_id)
        if account_id:
            query = query.filter(Transaction.account_id == account_id)
        if card_id:
            query = query.filter(Transaction.card_id == card_id)
        if owner_id:
            query = query.filter(
                or_(
                    Transaction.owner_id == owner_id,
                    Transaction.splits.any(TransactionSplit.owner_id == owner_id)
                )
            )
        if status and status != "Todos":
            query = query.filter(Transaction.status == status)
        if tag:
            query = query.filter(Transaction.tags.like(f"%{tag}%"))
        if search_query and search_query.strip():
            sq = f"%{search_query.strip()}%"
            query = query.filter(
                or_(
                    Transaction.description.like(sq),
                    Transaction.notes.like(sq),
                    Transaction.tags.like(sq)
                )
            )

        return query.order_by(Transaction.transaction_date.desc(), Transaction.id.desc()).all()

    def get_by_fingerprint(self, fingerprint: str) -> Optional[Transaction]:
        return self.db.query(Transaction).filter(Transaction.hash_fingerprint == fingerprint).first()

    def save_splits(self, transaction_id: int, splits_data: List[Dict[str, Any]]):
        # Remove antigos splits da transacao
        self.db.query(TransactionSplit).filter(TransactionSplit.transaction_id == transaction_id).delete()
        
        # Insere novos
        for item in splits_data:
            split = TransactionSplit(
                transaction_id=transaction_id,
                owner_id=item['owner_id'],
                amount=item['amount'],
                percentage=item.get('percentage', 0.0)
            )
            self.db.add(split)
        self.db.commit()
