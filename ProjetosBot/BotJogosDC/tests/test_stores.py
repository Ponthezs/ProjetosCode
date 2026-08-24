import pytest
from stores.base_store import DealDTO, BaseStore
from stores.epic import EpicStore
from stores.steam import SteamStore
from stores.gog import GOGStore
from stores.cheapshark import CheapSharkStore

class DummyStore(BaseStore):
    store_id = "dummy"
    store_name = "Dummy Store"
    async def fetch_deals(self): return []
    async def fetch_free_games(self): return []

def test_discount_calculation():
    dummy = DummyStore()
    assert dummy.calculate_discount(100.0, 50.0) == 50.0
    assert dummy.calculate_discount(200.0, 50.0) == 75.0
    assert dummy.calculate_discount(100.0, 0.0) == 100.0
    assert dummy.calculate_discount(0.0, 50.0) == 0.0

@pytest.mark.asyncio
async def test_epic_store_fetch():
    store = EpicStore()
    deals = await store.fetch_free_games()
    assert isinstance(deals, list)
    for item in deals:
        assert isinstance(item, DealDTO)
        assert item.store == "Epic Games Store"
        assert item.is_free is True

@pytest.mark.asyncio
async def test_steam_store_fetch():
    store = SteamStore()
    deals = await store.fetch_deals()
    assert isinstance(deals, list)
    for item in deals:
        assert isinstance(item, DealDTO)
        assert item.store == "Steam"

@pytest.mark.asyncio
async def test_gog_store_fetch():
    store = GOGStore()
    deals = await store.fetch_deals()
    assert isinstance(deals, list)
    for item in deals:
        assert isinstance(item, DealDTO)
        assert item.store == "GOG"
