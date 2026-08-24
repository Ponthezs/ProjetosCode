import logging
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, update, delete, func
from config.settings import settings
from database.models import Base, GameDealModel, PublishedDealModel, GuildConfigModel, StoreStatusModel

logger = logging.getLogger(__name__)

# Handle SQLite vs PostgreSQL async engine configuration
db_url = settings.DATABASE_URL
engine_kwargs = {"echo": False}
if "sqlite" in db_url:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

async_engine = create_async_engine(db_url, **engine_kwargs)
AsyncSessionLocal = async_sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    """Initialize database tables."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database initialized successfully.")

async def get_session() -> AsyncSession:
    """Async session generator for FastAPI and async callers."""
    async with AsyncSessionLocal() as session:
        yield session

class DatabaseManager:
    @staticmethod
    async def upsert_deal(deal_data: Dict[str, Any]) -> Tuple[GameDealModel, bool]:
        """
        Upserts a game deal record based on unique deal_key.
        Returns tuple of (GameDealModel instance, is_new boolean).
        """
        async with AsyncSessionLocal() as session:
            async with session.begin():
                stmt = select(GameDealModel).where(GameDealModel.deal_key == deal_data["deal_key"])
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()

                is_new = False
                now = datetime.now(timezone.utc)

                if existing:
                    # Update fields
                    existing.title = deal_data.get("title", existing.title)
                    existing.store = deal_data.get("store", existing.store)
                    existing.normal_price = deal_data.get("normal_price", existing.normal_price)
                    existing.sale_price = deal_data.get("sale_price", existing.sale_price)
                    existing.discount = deal_data.get("discount", existing.discount)
                    existing.currency = deal_data.get("currency", existing.currency)
                    existing.url = deal_data.get("url", existing.url)
                    existing.image_url = deal_data.get("image_url", existing.image_url)
                    existing.start_date = deal_data.get("start_date", existing.start_date)
                    existing.end_date = deal_data.get("end_date", existing.end_date)
                    existing.is_free = deal_data.get("is_free", existing.is_free)
                    existing.active = True
                    existing.last_seen = now
                    existing.updated_at = now
                    deal_obj = existing
                else:
                    is_new = True
                    deal_obj = GameDealModel(
                        deal_key=deal_data["deal_key"],
                        title=deal_data["title"],
                        store=deal_data["store"],
                        normal_price=deal_data.get("normal_price", 0.0),
                        sale_price=deal_data.get("sale_price", 0.0),
                        discount=deal_data.get("discount", 0.0),
                        currency=deal_data.get("currency", "BRL"),
                        url=deal_data["url"],
                        image_url=deal_data.get("image_url"),
                        start_date=deal_data.get("start_date"),
                        end_date=deal_data.get("end_date"),
                        is_free=deal_data.get("is_free", False),
                        active=True,
                        last_seen=now,
                        created_at=now,
                        updated_at=now,
                    )
                    session.add(deal_obj)
            await session.refresh(deal_obj)
            return deal_obj, is_new

    @staticmethod
    async def is_deal_published(game_deal_id: int, guild_id: str, deal_type: str) -> bool:
        """Check if a deal was already published to a specific guild for a deal category."""
        async with AsyncSessionLocal() as session:
            stmt = select(PublishedDealModel).where(
                PublishedDealModel.game_deal_id == game_deal_id,
                PublishedDealModel.guild_id == str(guild_id),
                PublishedDealModel.deal_type == deal_type
            )
            result = await session.execute(stmt)
            return result.scalar_one_or_none() is not None

    @staticmethod
    async def record_published_deal(game_deal_id: int, guild_id: str, channel_id: str, discord_message_id: str, deal_type: str):
        """Record that a deal was published to Discord."""
        async with AsyncSessionLocal() as session:
            async with session.begin():
                record = PublishedDealModel(
                    game_deal_id=game_deal_id,
                    guild_id=str(guild_id),
                    channel_id=str(channel_id),
                    discord_message_id=str(discord_message_id) if discord_message_id else None,
                    deal_type=deal_type,
                    published_at=datetime.now(timezone.utc)
                )
                session.add(record)

    @staticmethod
    async def get_active_free_games(store_filter: Optional[str] = None) -> List[GameDealModel]:
        """Fetch active free games from DB."""
        async with AsyncSessionLocal() as session:
            stmt = select(GameDealModel).where(
                GameDealModel.is_free == True,
                GameDealModel.active == True
            )
            if store_filter:
                stmt = stmt.where(GameDealModel.store.ilike(f"%{store_filter}%"))
            stmt = stmt.order_by(GameDealModel.updated_at.desc())
            result = await session.execute(stmt)
            return list(result.scalars().all())

    @staticmethod
    async def get_active_deals(
        min_discount: float = 0.0,
        store_filter: Optional[str] = None,
        limit: int = 50
    ) -> List[GameDealModel]:
        """Fetch active deals with discount >= min_discount."""
        async with AsyncSessionLocal() as session:
            stmt = select(GameDealModel).where(
                GameDealModel.active == True,
                GameDealModel.discount >= min_discount
            )
            if store_filter:
                stmt = stmt.where(GameDealModel.store.ilike(f"%{store_filter}%"))
            stmt = stmt.order_by(GameDealModel.discount.desc(), GameDealModel.updated_at.desc()).limit(limit)
            result = await session.execute(stmt)
            return list(result.scalars().all())

    @staticmethod
    async def update_store_status(store_name: str, status: str, items_found: int = 0, free_games_found: int = 0, error_message: Optional[str] = None):
        """Update or create store execution status metrics."""
        async with AsyncSessionLocal() as session:
            async with session.begin():
                stmt = select(StoreStatusModel).where(StoreStatusModel.store_name == store_name)
                result = await session.execute(stmt)
                rec = result.scalar_one_or_none()
                now = datetime.now(timezone.utc)
                if rec:
                    rec.last_run = now
                    rec.status = status
                    rec.items_found = items_found
                    rec.free_games_found = free_games_found
                    rec.error_message = error_message
                else:
                    rec = StoreStatusModel(
                        store_name=store_name,
                        last_run=now,
                        status=status,
                        items_found=items_found,
                        free_games_found=free_games_found,
                        error_message=error_message
                    )
                    session.add(rec)

    @staticmethod
    async def get_store_statuses() -> List[StoreStatusModel]:
        """Fetch current status for all stores."""
        async with AsyncSessionLocal() as session:
            stmt = select(StoreStatusModel).order_by(StoreStatusModel.store_name.asc())
            result = await session.execute(stmt)
            return list(result.scalars().all())

    @staticmethod
    async def get_guild_config(guild_id: str) -> Optional[GuildConfigModel]:
        """Fetch guild channel settings."""
        async with AsyncSessionLocal() as session:
            stmt = select(GuildConfigModel).where(GuildConfigModel.guild_id == str(guild_id))
            result = await session.execute(stmt)
            return result.scalar_one_or_none()

    @staticmethod
    async def update_guild_config(guild_id: str, **kwargs) -> GuildConfigModel:
        """Update or create guild configuration."""
        async with AsyncSessionLocal() as session:
            async with session.begin():
                stmt = select(GuildConfigModel).where(GuildConfigModel.guild_id == str(guild_id))
                result = await session.execute(stmt)
                conf = result.scalar_one_or_none()
                now = datetime.now(timezone.utc)
                if conf:
                    for key, val in kwargs.items():
                        if hasattr(conf, key) and val is not None:
                            setattr(conf, key, val)
                    conf.updated_at = now
                else:
                    conf = GuildConfigModel(
                        guild_id=str(guild_id),
                        channel_free_games=kwargs.get("channel_free_games"),
                        channel_deals=kwargs.get("channel_deals"),
                        channel_big_deals=kwargs.get("channel_big_deals"),
                        channel_new_offers=kwargs.get("channel_new_offers"),
                        channel_expired=kwargs.get("channel_expired"),
                        min_discount=kwargs.get("min_discount", 50.0),
                        updated_at=now
                    )
                    session.add(conf)
            await session.refresh(conf)
            return conf

    @staticmethod
    async def get_all_guild_configs() -> List[GuildConfigModel]:
        """Fetch all guild configurations."""
        async with AsyncSessionLocal() as session:
            stmt = select(GuildConfigModel)
            result = await session.execute(stmt)
            return list(result.scalars().all())

    @staticmethod
    async def get_dashboard_stats() -> Dict[str, Any]:
        """Aggregate stats for Web Admin Dashboard."""
        async with AsyncSessionLocal() as session:
            total_games = (await session.execute(select(func.count(GameDealModel.id)))).scalar() or 0
            active_deals = (await session.execute(select(func.count(GameDealModel.id)).where(GameDealModel.active == True, GameDealModel.discount > 0))).scalar() or 0
            free_games = (await session.execute(select(func.count(GameDealModel.id)).where(GameDealModel.active == True, GameDealModel.is_free == True))).scalar() or 0
            published_total = (await session.execute(select(func.count(PublishedDealModel.id)))).scalar() or 0
            stores = await DatabaseManager.get_store_statuses()

            return {
                "total_monitored_games": total_games,
                "active_deals_count": active_deals,
                "free_games_count": free_games,
                "published_offers_count": published_total,
                "active_stores_count": sum(1 for s in stores if s.status == "OK"),
                "total_stores_count": len(stores),
                "stores": [s.to_dict() for s in stores]
            }
