from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import Base
from models.category import Category
from models.card import Card
from models.account import Account

class Subscription(Base):
    __tablename__ = 'subscriptions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    monthly_cost = Column(Float, nullable=False)
    billing_cycle = Column(String(20), default="Mensal")  # Mensal, Anual
    renewal_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)

    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    card_id = Column(Integer, ForeignKey('cards.id'), nullable=True)
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("Category")
    card = relationship("Card")
    account = relationship("Account")

    @property
    def annual_cost(self) -> float:
        if self.billing_cycle == "Anual":
            return self.monthly_cost
        return self.monthly_cost * 12.0

    def __repr__(self):
        return f"<Subscription(id={self.id}, name='{self.name}', cost={self.monthly_cost})>"
