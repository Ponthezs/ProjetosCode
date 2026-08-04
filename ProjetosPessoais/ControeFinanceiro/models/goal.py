from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.sql import func
from database.base import Base

class Goal(Base):
    __tablename__ = 'goals'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(150), nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(Date, nullable=True)
    category_type = Column(String(50), default="Economia")  # Economia, Investimento, Viagem, Reserva
    color = Column(String(20), default="#2ECC71")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @property
    def progress_percentage(self) -> float:
        if self.target_amount <= 0:
            return 100.0
        return min(100.0, (self.current_amount / self.target_amount) * 100.0)

    def __repr__(self):
        return f"<Goal(id={self.id}, title='{self.title}', progress={self.progress_percentage:.1f}%)>"
