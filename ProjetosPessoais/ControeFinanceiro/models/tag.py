from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database.base import Base

class Tag(Base):
    __tablename__ = 'tags'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Tag(id={self.id}, name='{self.name}')>"
