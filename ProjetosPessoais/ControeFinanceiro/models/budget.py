from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import Base
from models.category import Category

class Budget(Base):
    __tablename__ = 'budgets'

    id = Column(Integer, primary_key=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)
    month = Column(Integer, nullable=False)  # 1 to 12
    year = Column(Integer, nullable=False)
    limit_amount = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("Category")

    def __repr__(self):
        return f"<Budget(category_id={self.category_id}, month={self.month}/{self.year}, limit={self.limit_amount})>"
