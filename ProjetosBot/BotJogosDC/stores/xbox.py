import logging
from typing import List
import httpx
from stores.base_store import BaseStore, DealDTO

logger = logging.getLogger(__name__)

XBOX_DEALS_URL = "https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=9P6SRW1SCW1Q,9N8M0TZV0V7N,9NBLGGH4R5V5&market=BR&languages=pt-br"

class XboxStore(BaseStore):
    store_id = "xbox"
    store_name = "Xbox Store"

    async def fetch_deals(self) -> List[DealDTO]:
        return await self._fetch_xbox_deals(only_free=False)

    async def fetch_free_games(self) -> List[DealDTO]:
        return await self._fetch_xbox_deals(only_free=True)

    async def _fetch_xbox_deals(self, only_free: bool = False) -> List[DealDTO]:
        deals = []
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(XBOX_DEALS_URL)
                if resp.status_code == 200:
                    data = resp.json()
                    products = data.get("Products", [])
                    for prod in products:
                        try:
                            prod_id = prod.get("ProductId")
                            localized = prod.get("LocalizedProperties", [{}])[0]
                            title = localized.get("ProductTitle")
                            if not title or not prod_id:
                                continue

                            skus = prod.get("DisplaySkuAvailabilities", [{}])[0]
                            availabilities = skus.get("Availabilities", [{}])[0]
                            order_mgmt = availabilities.get("OrderManagementData", {}).get("Price", {})

                            orig_price = float(order_mgmt.get("MSRP", 0.0))
                            sale_price = float(order_mgmt.get("ListPrice", 0.0))

                            is_free = (sale_price == 0.0 and orig_price > 0.0)

                            if only_free and not is_free:
                                continue
                            if not only_free and is_free:
                                continue

                            discount = self.calculate_discount(orig_price, sale_price)
                            deal_url = f"https://www.xbox.com/pt-br/games/store/a/{prod_id}"
                            images = localized.get("Images", [])
                            image_url = images[0].get("Uri") if images else None
                            if image_url and image_url.startswith("//"):
                                image_url = f"https:{image_url}"

                            dto = DealDTO(
                                deal_key=f"xbox_{prod_id}",
                                title=title,
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
                            logger.error(f"Error parsing Xbox item: {e}")
                            continue
        except Exception as e:
            logger.error(f"Error fetching Xbox Store: {e}")

        return deals
