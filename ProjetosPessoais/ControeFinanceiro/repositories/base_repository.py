from typing import Generic, TypeVar, Type, List, Optional
from sqlalchemy.orm import Session
from database.base import Base

T = TypeVar('T', bound=Base)

class BaseRepository(Generic[T]):
    def __init__(self, model_cls: Type[T], db: Session):
        self.model_cls = model_cls
        self.db = db

    def get_by_id(self, item_id: int) -> Optional[T]:
        return self.db.query(self.model_cls).filter(self.model_cls.id == item_id).first()

    def get_all(self) -> List[T]:
        return self.db.query(self.model_cls).all()

    def add(self, item: T) -> T:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update(self, item: T) -> T:
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item_id: int) -> bool:
        item = self.get_by_id(item_id)
        if item:
            self.db.delete(item)
            self.db.commit()
            return True
        return False
