import logging
from typing import List
import httpx
from stores.base_store import BaseStore, DealDTO

logger = logging.getLogger(__name__)

GOG_CATALOG_URL = "https://catalog.gog.com/v1/catalog?limit=48&order=desc:discount&productType=in:game,pack&countryCode=BR&locale=pt-BR"

class GOGStore(BaseStore):
    store_id = "gog"
    store_name = "GOG"

    async def fetch_deals(self) -> List[DealDTO]:
        return await self._fetch_gog_catalog(only_free=False)

    async def fetch_free_games(self) -> List[DealDTO]:
        return await self._fetch_gog_catalog(only_free=True)

    async def _fetch_gog_catalog(self, only_free: bool = False) -> List[DealDTO]:
        deals = []
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(GOG_CATALOG_URL)
                if response.status_code != 200:
                    logger.error(f"GOG API status {response.status_code}")
                    return []

                data = response.json()
                products = data.get("products", [])

                for item in products:
                    try:
                        title = item.get("title")
                        product_id = item.get("id")
                        slug = item.get("slug")
                        if not title or not product_id:
                            continue

                        price_info = item.get("price", {})
                        base_str = price_info.get("baseAmount", "0")
                        final_str = price_info.get("finalAmount", "0")

                        try:
                            orig_price = float(base_str)
                        except ValueError:
                            orig_price = 0.0

                        try:
                            sale_price = float(final_str)
                        except ValueError:
                            sale_price = 0.0

                        discount = self.calculate_discount(orig_price, sale_price)

                        # Check if free
                        is_free = (sale_price == 0.0 and orig_price > 0.0) or (discount == 100.0)

                        if only_free and not is_free:
                            continue

                        if not only_free and is_free:
                            continue

                        cover_url = item.get("coverHorizontal") or item.get("coverVertical")
                        if cover_url and not cover_url.startswith("http"):
                            cover_url = f"https:{cover_url}"

                        deal_url = f"https://www.gog.com/pt/game/{slug}" if slug else "https://www.gog.com/"
                        deal_key = f"gog_{product_id}"

                        dto = DealDTO(
                            deal_key=deal_key,
                            title=title,
                            store=self.store_name,
                            normal_price=orig_price,
                            sale_price=sale_price,
                            discount=discount if not is_free else 100.0,
                            currency="BRL",
                            url=deal_url,
                            image_url=cover_url,
                            is_free=is_free
                        )
                        deals.append(dto)
                    except Exception as e:
                        logger.error(f"Error parsing GOG product: {e}")
                        continue
        except Exception as e:
            logger.error(f"Error fetching GOG store: {e}")

        return deals
