from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from models.fixed_expense import FixedExpense
from models.subscription import Subscription
from models.refund import Refund
from models.import_history import ImportHistory
from repositories.base_repository import BaseRepository

class FixedExpenseRepository(BaseRepository[FixedExpense]):
    def __init__(self, db: Session):
        super().__init__(FixedExpense, db)

    def get_active(self) -> List[FixedExpense]:
        return self.db.query(FixedExpense).options(
            joinedload(FixedExpense.category),
            joinedload(FixedExpense.account),
            joinedload(FixedExpense.owner)
        ).filter(FixedExpense.is_active == True).all()

class SubscriptionRepository(BaseRepository[Subscription]):
    def __init__(self, db: Session):
        super().__init__(Subscription, db)

    def get_all_with_relations(self) -> List[Subscription]:
        return self.db.query(Subscription).options(
            joinedload(Subscription.category),
            joinedload(Subscription.card),
            joinedload(Subscription.account)
        ).all()

class RefundRepository(BaseRepository[Refund]):
    def __init__(self, db: Session):
        super().__init__(Refund, db)

    def get_pending(self) -> List[Refund]:
        return self.db.query(Refund).filter(Refund.status == "Pendente").all()

class ImportHistoryRepository(BaseRepository[ImportHistory]):
    def __init__(self, db: Session):
        super().__init__(ImportHistory, db)

    def get_latest(self) -> List[ImportHistory]:
        return self.db.query(ImportHistory).order_by(ImportHistory.imported_at.desc()).all()
