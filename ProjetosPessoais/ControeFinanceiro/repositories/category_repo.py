from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from models.category import Category, Subcategory
from models.owner import Owner
from models.tag import Tag
from models.transaction import Transaction
from repositories.base_repository import BaseRepository

class CategoryRepository(BaseRepository[Category]):
    def __init__(self, db: Session):
        super().__init__(Category, db)

    def get_all_with_subcategories(self) -> List[Category]:
        return self.db.query(Category).options(joinedload(Category.subcategories)).all()

    def get_by_name(self, name: str) -> Optional[Category]:
        return self.db.query(Category).filter(Category.name.ilike(name.strip())).first()

    def get_subcategory_by_name(self, name: str, category_id: int) -> Optional[Subcategory]:
        return self.db.query(Subcategory).filter(
            Subcategory.name.ilike(name.strip()),
            Subcategory.category_id == category_id
        ).first()

    def add_subcategory(self, name: str, category_id: int) -> Subcategory:
        sub = Subcategory(name=name, category_id=category_id)
        self.db.add(sub)
        self.db.commit()
        self.db.refresh(sub)
        return sub

    def merge_categories(self, source_id: int, target_id: int) -> bool:
        """Mescla uma categoria com outra, migrando todas as movimentações e subcategorias."""
        if source_id == target_id:
            return False
        
        # Migrar transações
        self.db.query(Transaction).filter(Transaction.category_id == source_id).update(
            {Transaction.category_id: target_id}, synchronize_session=False
        )
        # Migrar subcategorias
        self.db.query(Subcategory).filter(Subcategory.category_id == source_id).update(
            {Subcategory.category_id: target_id}, synchronize_session=False
        )
        # Deletar categoria de origem
        self.delete(source_id)
        self.db.commit()
        return True

class OwnerRepository(BaseRepository[Owner]):
    def __init__(self, db: Session):
        super().__init__(Owner, db)

    def get_by_name(self, name: str) -> Optional[Owner]:
        return self.db.query(Owner).filter(Owner.name.ilike(name.strip())).first()

class TagRepository(BaseRepository[Tag]):
    def __init__(self, db: Session):
        super().__init__(Tag, db)

    def get_by_name(self, name: str) -> Optional[Tag]:
        return self.db.query(Tag).filter(Tag.name.ilike(name.strip())).first()
