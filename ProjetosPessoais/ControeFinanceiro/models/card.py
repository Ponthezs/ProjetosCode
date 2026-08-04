from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database.base import Base

class Card(Base):
    __tablename__ = 'cards'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    brand = Column(String(50), default="Mastercard")
    credit_limit = Column(Float, default=0.0)
    closing_day = Column(Integer, nullable=False, default=1)
    due_day = Column(Integer, nullable=False, default=10)
    color = Column(String(20), default="#8A05BE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Card(id={self.id}, name='{self.name}', limit={self.credit_limit})>"
