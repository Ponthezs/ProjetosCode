from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import Base

class Refund(Base):
    __tablename__ = 'refunds'

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String(255), nullable=False)
    total_amount = Column(Float, nullable=False)
    refund_date = Column(Date, nullable=False)
    status = Column(String(30), default="Pendente")  # Pendente, Recebido, Cancelado
    debtor_name = Column(String(100), nullable=False)  # Quem deve reembolsar (ex: Empresa X, Amigo Y)
    notes = Column(Text, default="")
    
    transaction_id = Column(Integer, ForeignKey('transactions.id'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    transaction = relationship("Transaction")

    def __repr__(self):
        return f"<Refund(id={self.id}, debtor='{self.debtor_name}', amount={self.total_amount}, status='{self.status}')>"
