import pytest
import pytest_asyncio
from database.database import init_db, DatabaseManager, async_engine
from database.models import Base, GameDealModel

@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

@pytest.mark.asyncio
async def test_upsert_and_deduplication():
    deal_payload = {
        "deal_key": "test_game_1",
        "title": "Control Test Edition",
        "store": "Epic Games Store",
        "normal_price": 199.90,
        "sale_price": 0.0,
        "discount": 100.0,
        "currency": "BRL",
        "url": "https://store.epicgames.com",
        "is_free": True
    }

    deal_obj, is_new = await DatabaseManager.upsert_deal(deal_payload)
    assert is_new is True
    assert deal_obj.title == "Control Test Edition"
    assert deal_obj.is_free is True

    # Re-upsert identical key
    deal_payload_updated = deal_payload.copy()
    deal_payload_updated["title"] = "Control Test Edition (Updated)"
    deal_obj2, is_new2 = await DatabaseManager.upsert_deal(deal_payload_updated)

    assert is_new2 is False
    assert deal_obj2.id == deal_obj.id
    assert deal_obj2.title == "Control Test Edition (Updated)"

@pytest.mark.asyncio
async def test_guild_config_and_publishing_records():
    guild_id = "999888777"
    conf = await DatabaseManager.update_guild_config(
        guild_id=guild_id,
        channel_free_games="111222333",
        min_discount=60.0
    )
    assert conf.channel_free_games == "111222333"
    assert conf.min_discount == 60.0

    published = await DatabaseManager.is_deal_published(game_deal_id=1, guild_id=guild_id, deal_type="FREE")
    assert published is False

    await DatabaseManager.record_published_deal(
        game_deal_id=1,
        guild_id=guild_id,
        channel_id="111222333",
        discord_message_id="555666777",
        deal_type="FREE"
    )

    published_after = await DatabaseManager.is_deal_published(game_deal_id=1, guild_id=guild_id, deal_type="FREE")
    assert published_after is True
