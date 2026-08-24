import logging
from typing import List
import httpx
from stores.base_store import BaseStore, DealDTO

logger = logging.getLogger(__name__)

# Official public search/deals API endpoint for PS Store BR
PS_STORE_DEALS_URL = "https://store.playstation.com/valkyrie-api/en/BR/999/container/STORE-MSF75508-MOBCOMMDEALS"

class PlayStationStore(BaseStore):
    store_id = "playstation"
    store_name = "PlayStation Store"

    async def fetch_deals(self) -> List[DealDTO]:
        return await self._fetch_ps_store(only_free=False)

    async def fetch_free_games(self) -> List[DealDTO]:
        return await self._fetch_ps_store(only_free=True)

    async def _fetch_ps_store(self, only_free: bool = False) -> List[DealDTO]:
        deals = []
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            async with httpx.AsyncClient(timeout=15.0, headers=headers) as client:
                resp = await client.get(PS_STORE_DEALS_URL)
                if resp.status_code == 200:
                    data = resp.json()
                    links = data.get("included", [])
                    for item in links:
                        try:
                            attrs = item.get("attributes", {})
                            name = attrs.get("name")
                            if not name:
                                continue

                            skus = attrs.get("skus", [])
                            orig_price = 0.0
                            sale_price = 0.0

                            if skus:
                                price_dict = skus[0].get("prices", {})
                                orig_val = price_dict.get("non-plus-user", {}).get("actual-price", {}).get("value", 0)
                                sale_val = price_dict.get("non-plus-user", {}).get("discounted-price", {}).get("value", 0)
                                orig_price = round(orig_val / 100.0, 2)
                                sale_price = round(sale_val / 100.0, 2)

                            is_free = (sale_price == 0.0 and orig_price > 0.0)

                            if only_free and not is_free:
                                continue
                            if not only_free and is_free:
                                continue

                            item_id = item.get("id")
                            deal_url = f"https://store.playstation.com/pt-br/product/{item_id}"
                            image_url = attrs.get("thumbnail-url-base")

                            discount = self.calculate_discount(orig_price, sale_price)

                            dto = DealDTO(
                                deal_key=f"psn_{item_id}",
                                title=name,
                                store=self.store_name,
                                normal_price=orig_price,
                                sale_price=sale_price,
                                discount=discount if not is_free else 100.0,
                                currency="BRL",
                                url=deal_url,
                                image_url=image_url,
                                is_free=is_free
                            )
                            deals.append(dto)
                        except Exception as e:
                            logger.error(f"Error parsing PS store item: {e}")
                            continue
        except Exception as e:
            logger.error(f"Error fetching PlayStation Store: {e}")

        return deals
