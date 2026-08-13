from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import Base
import uuid
from models.account import Account
from models.card import Card
from models.category import Category, Subcategory
from models.owner import Owner
from models.split import TransactionSplit

class Transaction(Base):
    __tablename__ = 'transactions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True)
    description = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_date = Column(Date, nullable=False)
    
    # Classificação
    type = Column(String(50), nullable=False, default="Despesa")  # Despesa, Receita, Transferência, PIX, etc.
    payment_method = Column(String(50), default="Cartão de Crédito")
    status = Column(String(20), default="Pago")  # Pago, Pendente, Cancelado
    
    # Chaves Estrangeiras
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    subcategory_id = Column(Integer, ForeignKey('subcategories.id'), nullable=True)
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=True)
    card_id = Column(Integer, ForeignKey('cards.id'), nullable=True)
    owner_id = Column(Integer, ForeignKey('owners.id'), nullable=True)
    
    # Parcelamento
    installment_number = Column(Integer, default=1)
    total_installments = Column(Integer, default=1)
    installment_group_id = Column(String(36), nullable=True)
    
    # Metadados & Auditoria
    tags = Column(String(255), default="")  # Armazenado como string separada por vírgula
    notes = Column(Text, default="")
    hash_fingerprint = Column(String(64), nullable=True, index=True)  # Deduplicação na importação CSV
    source = Column(String(50), default="Manual")  # Manual ou CSV
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    category = relationship("Category")
    subcategory = relationship("Subcategory")
    account = relationship("Account")
    card = relationship("Card")
    owner = relationship("Owner")
    splits = relationship("TransactionSplit", back_populates="transaction", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Transaction(id={self.id}, desc='{self.description}', amount={self.amount}, date={self.transaction_date})>"
