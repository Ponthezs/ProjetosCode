from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import Base
from models.category import Category
from models.account import Account
from models.owner import Owner

class FixedExpense(Base):
    __tablename__ = 'fixed_expenses'

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    due_day = Column(Integer, nullable=False, default=1)  # Dia do mês
    is_active = Column(Boolean, default=True)
    auto_generate = Column(Boolean, default=True)
    
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=True)
    owner_id = Column(Integer, ForeignKey('owners.id'), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("Category")
    account = relationship("Account")
    owner = relationship("Owner")

    def __repr__(self):
        return f"<FixedExpense(id={self.id}, desc='{self.description}', amount={self.amount})>"
