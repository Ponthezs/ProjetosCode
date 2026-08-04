from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import Base
from models.owner import Owner

class TransactionSplit(Base):
    __tablename__ = 'transaction_splits'

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(Integer, ForeignKey('transactions.id'), nullable=False)
    owner_id = Column(Integer, ForeignKey('owners.id'), nullable=False)
    amount = Column(Float, nullable=False)
    percentage = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    transaction = relationship("Transaction", back_populates="splits")
    owner = relationship("Owner")

    def __repr__(self):
        return f"<TransactionSplit(id={self.id}, owner_id={self.owner_id}, amount={self.amount})>"
