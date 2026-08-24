import logging
from typing import List
import httpx
from stores.base_store import BaseStore, DealDTO

logger = logging.getLogger(__name__)

STEAM_FEATURED_URL = "https://store.steampowered.com/api/featuredcategories/?l=portuguese&cc=br"

class SteamStore(BaseStore):
    store_id = "steam"
    store_name = "Steam"

    async def fetch_deals(self) -> List[DealDTO]:
        return await self._fetch_steam_catalog(only_free=False)

    async def fetch_free_games(self) -> List[DealDTO]:
        return await self._fetch_steam_catalog(only_free=True)

    async def _fetch_steam_catalog(self, only_free: bool = False) -> List[DealDTO]:
        deals = []
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(STEAM_FEATURED_URL)
                if response.status_code != 200:
                    logger.error(f"Steam API status {response.status_code}")
                    return []

                data = response.json()
                specials = data.get("specials", {}).get("items", [])

                for item in specials:
                    try:
                        app_id = item.get("id")
                        title = item.get("name")
                        if not app_id or not title:
                            continue

                        orig_cents = item.get("original_price", 0) or 0
                        final_cents = item.get("final_price", 0) or 0
                        discount_percent = float(item.get("discount_percent", 0) or 0)

                        orig_price = round(orig_cents / 100.0, 2)
                        sale_price = round(final_cents / 100.0, 2)

                        is_free = (sale_price == 0 and (orig_cents > 0 or discount_percent == 100))

                        if only_free and not is_free:
                            continue

                        if not only_free and is_free:
                            continue

                        image_url = item.get("header_image") or item.get("large_capsule_image")
                        deal_url = f"https://store.steampowered.com/app/{app_id}/"
                        deal_key = f"steam_{app_id}"

                        dto = DealDTO(
                            deal_key=deal_key,
                            title=title,
                            store=self.store_name,
                            normal_price=orig_price,
                            sale_price=sale_price,
                            discount=discount_percent if not is_free else 100.0,
                            currency="BRL",
                            url=deal_url,
                            image_url=image_url,
                            is_free=is_free
                        )
                        deals.append(dto)
                    except Exception as e:
                        logger.error(f"Error parsing Steam item: {e}")
                        continue
        except Exception as e:
            logger.error(f"Error fetching Steam Store: {e}")

        return deals
