from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database.base import Base

class ImportHistory(Base):
    __tablename__ = 'import_history'

    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    file_hash = Column(String(64), nullable=True)
    imported_count = Column(Integer, default=0)
    skipped_count = Column(Integer, default=0)
    imported_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<ImportHistory(filename='{self.filename}', imported={self.imported_count}, skipped={self.skipped_count})>"
