import logging
from typing import List, Optional
import httpx
from stores.base_store import BaseStore, DealDTO

logger = logging.getLogger(__name__)

CHEAPSHARK_DEALS_URL = "https://www.cheapshark.com/api/1.0/deals"

# Map CheapShark store IDs to human names
CHEAPSHARK_STORE_MAP = {
    "1": "Steam",
    "7": "GOG",
    "8": "EA Store",
    "13": "Ubisoft Store",
    "25": "Epic Games Store",
    "11": "PlayStation Store",
    "15": "Xbox Store"
}

class CheapSharkStore(BaseStore):
    def __init__(self, store_id_num: str, store_name: str):
        self.store_id_num = store_id_num
        self.store_id = f"cheapshark_{store_id_num}"
        self.store_name = store_name

    async def fetch_deals(self) -> List[DealDTO]:
        return await self._fetch_cheapshark(only_free=False)

    async def fetch_free_games(self) -> List[DealDTO]:
        return await self._fetch_cheapshark(only_free=True)

    async def _fetch_cheapshark(self, only_free: bool = False) -> List[DealDTO]:
        deals = []
        try:
            params = {
                "storeID": self.store_id_num,
                "sortBy": "Savings",
                "pageSize": 30
            }
            if only_free:
                params["upperPrice"] = "0"

            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(CHEAPSHARK_DEALS_URL, params=params)
                if response.status_code != 200:
                    logger.error(f"CheapShark API status {response.status_code} for store {self.store_name}")
                    return []

                items = response.json()
                for item in items:
                    try:
                        title = item.get("title")
                        deal_id = item.get("dealID")
                        if not title or not deal_id:
                            continue

                        orig_price = float(item.get("normalPrice", "0"))
                        sale_price = float(item.get("salePrice", "0"))
                        savings = float(item.get("savings", "0"))

                        is_free = (sale_price == 0.0 and orig_price > 0.0) or (savings >= 99.9)

                        if only_free and not is_free:
                            continue
                        if not only_free and is_free:
                            continue

                        image_url = item.get("thumb")
                        deal_url = f"https://www.cheapshark.com/redirect?dealID={deal_id}"
                        deal_key = f"cs_{self.store_id_num}_{deal_id}"

                        dto = DealDTO(
                            deal_key=deal_key,
                            title=title,
                            store=self.store_name,
                            normal_price=orig_price,
                            sale_price=sale_price,
                            discount=round(savings, 1) if not is_free else 100.0,
                            currency="US$",
                            url=deal_url,
                            image_url=image_url,
                            is_free=is_free
                        )
                        deals.append(dto)
                    except Exception as e:
                        logger.error(f"Error parsing CheapShark item: {e}")
                        continue
        except Exception as e:
            logger.error(f"Error fetching CheapShark for {self.store_name}: {e}")

        return deals
