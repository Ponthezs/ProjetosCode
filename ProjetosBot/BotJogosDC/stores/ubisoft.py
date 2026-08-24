import logging
from typing import List
from stores.base_store import BaseStore, DealDTO
from stores.cheapshark import CheapSharkStore

logger = logging.getLogger(__name__)

class UbisoftStore(BaseStore):
    store_id = "ubisoft"
    store_name = "Ubisoft Store"

    def __init__(self):
        self._cs_fallback = CheapSharkStore(store_id_num="13", store_name=self.store_name)

    async def fetch_deals(self) -> List[DealDTO]:
        return await self._cs_fallback.fetch_deals()

    async def fetch_free_games(self) -> List[DealDTO]:
        return await self._cs_fallback.fetch_free_games()
