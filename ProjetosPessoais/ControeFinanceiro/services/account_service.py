from typing import List, Optional
from sqlalchemy.orm import Session
from models.account import Account
from models.card import Card
from repositories.account_repo import AccountRepository
from repositories.card_repo import CardRepository

class AccountService:
    def __init__(self, db: Session):
        self.db = db
        self.acc_repo = AccountRepository(db)
        self.card_repo = CardRepository(db)

    def get_all_accounts(self) -> List[Account]:
        return self.acc_repo.get_all()

    def create_account(self, name: str, account_type: str, initial_balance: float, icon: str, color: str) -> Account:
        acc = Account(
            name=name,
            account_type=account_type,
            initial_balance=initial_balance,
            current_balance=initial_balance,
            icon=icon,
            color=color
        )
        return self.acc_repo.add(acc)

    def get_all_cards(self) -> List[Card]:
        return self.card_repo.get_all()

    def create_card(self, name: str, brand: str, credit_limit: float, closing_day: int, due_day: int, color: str) -> Card:
        card = Card(
            name=name,
            brand=brand,
            credit_limit=credit_limit,
            closing_day=closing_day,
            due_day=due_day,
            color=color
        )
        return self.card_repo.add(card)

    def get_total_balance(self) -> float:
        accounts = self.get_all_accounts()
        return sum(acc.current_balance for acc in accounts)
