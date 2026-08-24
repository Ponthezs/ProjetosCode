import asyncio
import logging
from typing import List, Dict, Tuple
from stores.base_store import BaseStore, DealDTO
from stores.epic import EpicStore
from stores.steam import SteamStore
from stores.gog import GOGStore
from stores.ea import EAStore
from stores.playstation import PlayStationStore
from stores.xbox import XboxStore
from stores.ubisoft import UbisoftStore
from database.database import DatabaseManager

logger = logging.getLogger(__name__)

class StoreManager:
    def __init__(self):
        self.stores: List[BaseStore] = [
            EpicStore(),
            SteamStore(),
            GOGStore(),
            EAStore(),
            PlayStationStore(),
            XboxStore(),
            UbisoftStore(),
        ]

    async def fetch_all_deals_and_free_games(self) -> Tuple[List[DealDTO], List[DealDTO]]:
        """
        Executes fetch_deals and fetch_free_games across all registered stores concurrently.
        Updates store status metrics in DB and returns combined (all_deals, free_games).
        """
        all_deals: List[DealDTO] = []
        all_free_games: List[DealDTO] = []

        async def _fetch_single_store(store: BaseStore):
            deals = []
            free_games = []
            status = "OK"
            err_msg = None

            try:
                # Fetch free games and promotional deals in parallel for this store
                free_task = asyncio.create_task(store.fetch_free_games())
                deals_task = asyncio.create_task(store.fetch_deals())

                free_res, deals_res = await asyncio.gather(free_task, deals_task, return_exceptions=True)

                if isinstance(free_res, Exception):
                    logger.error(f"[{store.store_name}] Free games fetch failed: {free_res}")
                    status = "ERROR"
                    err_msg = str(free_res)
                else:
                    free_games = free_res

                if isinstance(deals_res, Exception):
                    logger.error(f"[{store.store_name}] Deals fetch failed: {deals_res}")
                    status = "ERROR"
                    if not err_msg:
                        err_msg = str(deals_res)
                else:
                    deals = deals_res

            except Exception as ex:
                logger.error(f"[{store.store_name}] Unexpected error: {ex}")
                status = "ERROR"
                err_msg = str(ex)

            await DatabaseManager.update_store_status(
                store_name=store.store_name,
                status=status,
                items_found=len(deals),
                free_games_found=len(free_games),
                error_message=err_msg
            )

            logger.info(f"[{store.store_name}] Finished run. Status: {status} | Deals: {len(deals)} | Free: {len(free_games)}")
            return deals, free_games

        tasks = [_fetch_single_store(store) for store in self.stores]
        results = await asyncio.gather(*tasks)

        for deals, free_games in results:
            all_deals.extend(deals)
            all_free_games.extend(free_games)

        return all_deals, all_free_games
