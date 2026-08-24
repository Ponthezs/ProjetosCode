from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    Column, String, Float, Boolean, DateTime, Integer, Text, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def utc_now():
    return datetime.now(timezone.utc)

class GameDealModel(Base):
    __tablename__ = "game_deals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    deal_key = Column(String(255), unique=True, index=True, nullable=False)  # Unique identifier e.g. store + item_id
    title = Column(String(255), nullable=False, index=True)
    store = Column(String(50), nullable=False, index=True)
    normal_price = Column(Float, default=0.0)
    sale_price = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    currency = Column(String(10), default="BRL")
    url = Column(Text, nullable=False)
    image_url = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_free = Column(Boolean, default=False, index=True)
    active = Column(Boolean, default=True, index=True)
    last_seen = Column(DateTime, default=utc_now, onupdate=utc_now)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    published_entries = relationship("PublishedDealModel", back_populates="game_deal", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "deal_key": self.deal_key,
            "title": self.title,
            "store": self.store,
            "normal_price": self.normal_price,
            "sale_price": self.sale_price,
            "discount": self.discount,
            "currency": self.currency,
            "url": self.url,
            "image_url": self.image_url,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "is_free": self.is_free,
            "active": self.active,
            "last_seen": self.last_seen.isoformat() if self.last_seen else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class PublishedDealModel(Base):
    __tablename__ = "published_deals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    game_deal_id = Column(Integer, ForeignKey("game_deals.id", ondelete="CASCADE"), nullable=False)
    guild_id = Column(String(50), nullable=False, index=True)
    channel_id = Column(String(50), nullable=False, index=True)
    discord_message_id = Column(String(50), nullable=True)
    deal_type = Column(String(50), nullable=False)  # FREE, DEALS, BIG_DEALS, EXTREME, NEW_OFFER, EXPIRED
    published_at = Column(DateTime, default=utc_now)

    game_deal = relationship("GameDealModel", back_populates="published_entries")

    __table_args__ = (
        UniqueConstraint('game_deal_id', 'guild_id', 'deal_type', name='_game_guild_dealtype_uc'),
    )

class GuildConfigModel(Base):
    __tablename__ = "guild_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    guild_id = Column(String(50), unique=True, index=True, nullable=False)
    channel_free_games = Column(String(50), nullable=True)
    channel_deals = Column(String(50), nullable=True)
    channel_big_deals = Column(String(50), nullable=True)
    channel_new_offers = Column(String(50), nullable=True)
    channel_expired = Column(String(50), nullable=True)
    min_discount = Column(Float, default=50.0)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    def to_dict(self):
        return {
            "guild_id": self.guild_id,
            "channel_free_games": self.channel_free_games,
            "channel_deals": self.channel_deals,
            "channel_big_deals": self.channel_big_deals,
            "channel_new_offers": self.channel_new_offers,
            "channel_expired": self.channel_expired,
            "min_discount": self.min_discount,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class StoreStatusModel(Base):
    __tablename__ = "store_statuses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    store_name = Column(String(50), unique=True, index=True, nullable=False)
    last_run = Column(DateTime, default=utc_now)
    status = Column(String(20), default="OK")  # OK, ERROR
    items_found = Column(Integer, default=0)
    free_games_found = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "store_name": self.store_name,
            "last_run": self.last_run.isoformat() if self.last_run else None,
            "status": self.status,
            "items_found": self.items_found,
            "free_games_found": self.free_games_found,
            "error_message": self.error_message,
        }
