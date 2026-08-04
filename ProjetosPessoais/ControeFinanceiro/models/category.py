from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import Base

class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False, default="Despesa")
    icon = Column(String(10), default="📁")
    color = Column(String(20), default="#95A5A6")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    subcategories = relationship("Subcategory", back_populates="category", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}', type='{self.type}')>"

class Subcategory(Base):
    __tablename__ = 'subcategories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)

    category = relationship("Category", back_populates="subcategories")

    def __repr__(self):
        return f"<Subcategory(id={self.id}, name='{self.name}', category_id={self.category_id})>"
