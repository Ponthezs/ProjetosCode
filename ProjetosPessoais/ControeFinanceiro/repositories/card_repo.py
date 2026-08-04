from typing import List, Optional
from sqlalchemy.orm import Session
from models.card import Card
from repositories.base_repository import BaseRepository

class CardRepository(BaseRepository[Card]):
    def __init__(self, db: Session):
        super().__init__(Card, db)

    def get_by_name(self, name: str) -> Optional[Card]:
        return self.db.query(Card).filter(Card.name.ilike(name.strip())).first()
