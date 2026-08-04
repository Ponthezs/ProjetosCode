from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database.base import Base

class Account(Base):
    __tablename__ = 'accounts'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    account_type = Column(String(50), nullable=False, default="Conta Corrente")
    initial_balance = Column(Float, default=0.0)
    current_balance = Column(Float, default=0.0)
    icon = Column(String(10), default="🏦")
    color = Column(String(20), default="#3498DB")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Account(id={self.id}, name='{self.name}', balance={self.current_balance})>"
