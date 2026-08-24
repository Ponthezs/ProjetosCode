import logging
from datetime import datetime, timezone
from typing import List, Optional
import httpx
from stores.base_store import BaseStore, DealDTO

logger = logging.getLogger(__name__)

EPIC_FREE_GAMES_URL = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=pt-BR&country=BR&allowCountries=BR"

class EpicStore(BaseStore):
    store_id = "epic"
    store_name = "Epic Games Store"

    async def fetch_free_games(self) -> List[DealDTO]:
        return await self._parse_epic_promotions(only_free=True)

    async def fetch_deals(self) -> List[DealDTO]:
        return await self._parse_epic_promotions(only_free=False)

    async def _parse_epic_promotions(self, only_free: bool = False) -> List[DealDTO]:
        deals = []
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(EPIC_FREE_GAMES_URL)
                if response.status_code != 200:
                    logger.error(f"Epic Games API status {response.status_code}")
                    return []

                data = response.json()
                elements = data.get("data", {}).get("Catalog", {}).get("searchStore", {}).get("elements", [])

                for item in elements:
                    try:
                        title = item.get("title")
                        if not title:
                            continue

                        price_info = item.get("price", {}).get("totalPrice", {})
                        fmt_price = price_info.get("fmtPrice", {})
                        orig_price_raw = price_info.get("originalPrice", 0) / 100.0
                        sale_price_raw = price_info.get("discountPrice", 0) / 100.0

                        promotions = item.get("promotions") or {}
                        promo_offers = promotions.get("promotionalOffers") or []

                        is_active_free = False
                        start_dt = None
                        end_dt = None

                        if promo_offers and len(promo_offers) > 0:
                            offers_list = promo_offers[0].get("promotionalOffers", [])
                            for offer in offers_list:
                                try:
                                    s_str = offer.get("startDate")
                                    e_str = offer.get("endDate")
                                    if s_str:
                                        start_dt = datetime.fromisoformat(s_str.replace("Z", "+00:00"))
                                    if e_str:
                                        end_dt = datetime.fromisoformat(e_str.replace("Z", "+00:00"))

                                    discount_percentage = offer.get("discountSetting", {}).get("discountPercentage", 0)
                                    if discount_percentage == 0 or sale_price_raw == 0:
                                        is_active_free = True
                                except Exception as ex:
                                    logger.debug(f"Error parsing promo dates for {title}: {ex}")

                        if orig_price_raw == 0 and sale_price_raw == 0:
                            # Permanently free or base free game
                            is_active_free = True

                        if only_free and not is_active_free:
                            continue

                        if not only_free and is_active_free:
                            # Skip 100% free games in general deals endpoint to avoid duplicate classification
                            continue

                        # Image extraction
                        image_url = None
                        for img in item.get("keyImages", []):
                            if img.get("type") in ["OfferImageWide", "DieselStoreFrontWide", "Thumbnail", "VaultClosed"]:
                                image_url = img.get("url")
                                break
                        if not image_url and item.get("keyImages"):
                            image_url = item["keyImages"][0].get("url")

                        # Link extraction
                        product_slug = item.get("productSlug") or item.get("urlSlug")
                        if not product_slug and item.get("offerMappings"):
                            product_slug = item["offerMappings"][0].get("pageSlug")
                        if not product_slug and item.get("catalogNs", {}).get("mappings"):
                            product_slug = item["catalogNs"]["mappings"][0].get("pageSlug")

                        if product_slug:
                            deal_url = f"https://store.epicgames.com/pt-BR/p/{product_slug}"
                        else:
                            deal_url = "https://store.epicgames.com/pt-BR/"

                        discount = self.calculate_discount(orig_price_raw, sale_price_raw) if not is_active_free else 100.0

                        deal_key = f"epic_{item.get('id', title)}"

                        dto = DealDTO(
                            deal_key=deal_key,
                            title=title,
                            store=self.store_name,
                            normal_price=orig_price_raw,
                            sale_price=sale_price_raw,
                            discount=discount,
                            currency="BRL",
                            url=deal_url,
                            image_url=image_url,
                            start_date=start_dt,
                            end_date=end_dt,
                            is_free=is_active_free
                        )
                        deals.append(dto)
                    except Exception as e:
                        logger.error(f"Error parsing Epic item {item.get('title')}: {e}")
                        continue
        except Exception as e:
            logger.error(f"Error fetching Epic Games Store: {e}")

        return deals
