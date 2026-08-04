from typing import List, Optional
from sqlalchemy.orm import Session
from models.account import Account
from repositories.base_repository import BaseRepository

class AccountRepository(BaseRepository[Account]):
    def __init__(self, db: Session):
        super().__init__(Account, db)

    def get_by_name(self, name: str) -> Optional[Account]:
        return self.db.query(Account).filter(Account.name.ilike(name.strip())).first()

    def update_balance(self, account_id: int, amount_change: float):
        account = self.get_by_id(account_id)
        if account:
            account.current_balance += amount_change
            self.db.commit()
