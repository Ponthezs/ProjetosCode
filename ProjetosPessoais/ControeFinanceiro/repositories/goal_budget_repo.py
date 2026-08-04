from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from models.goal import Goal
from models.budget import Budget
from repositories.base_repository import BaseRepository

class GoalRepository(BaseRepository[Goal]):
    def __init__(self, db: Session):
        super().__init__(Goal, db)

class BudgetRepository(BaseRepository[Budget]):
    def __init__(self, db: Session):
        super().__init__(Budget, db)

    def get_budget(self, category_id: int, month: int, year: int) -> Optional[Budget]:
        return self.db.query(Budget).filter(
            Budget.category_id == category_id,
            Budget.month == month,
            Budget.year == year
        ).first()

    def get_all_for_month(self, month: int, year: int) -> List[Budget]:
        return self.db.query(Budget).options(joinedload(Budget.category)).filter(
            Budget.month == month,
            Budget.year == year
        ).all()
