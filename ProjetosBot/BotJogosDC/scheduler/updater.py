import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional, List
import discord
from config.settings import settings
from database.database import DatabaseManager
from stores.manager import StoreManager
from bot.embeds.deal_embed import EmbedBuilder

logger = logging.getLogger(__name__)

class DealUpdater:
    def __init__(self, bot: Optional[discord.Client] = None):
        self.bot = bot
        self.store_manager = StoreManager()

    async def run_update_cycle(self):
        """Main execution cycle: fetches stores, updates DB, publishes new deals to Discord."""
        logger.info("Starting Deal Update Cycle...")
        try:
            deals, free_games = await self.store_manager.fetch_all_deals_and_free_games()
            all_items = free_games + deals
            logger.info(f"Retrieved {len(all_items)} total deal items from all stores.")

            processed_deals = []
            for item in all_items:
                try:
                    db_deal, is_new = await DatabaseManager.upsert_deal(item.model_dump())
                    processed_deals.append((db_deal, is_new))
                except Exception as ex:
                    logger.error(f"Error saving deal {item.title} to DB: {ex}")

            if self.bot and self.bot.is_ready():
                await self._publish_to_discord(processed_deals)
            else:
                logger.info("Bot is not connected or ready; skipped Discord publication step.")

            logger.info("Deal Update Cycle finished successfully.")
        except Exception as e:
            logger.error(f"Critical error during Deal Update Cycle: {e}", exc_info=True)

    async def _publish_to_discord(self, processed_deals: List):
        """Iterates through processed deals and publishes them to configured guild channels."""
        if not self.bot:
            return

        guild_configs = await DatabaseManager.get_all_guild_configs()

        # Build list of targets: registered guild configs + default environment channels
        targets = []
        for conf in guild_configs:
            targets.append({
                "guild_id": conf.guild_id,
                "free_games": conf.channel_free_games or settings.CHANNEL_FREE_GAMES,
                "deals": conf.channel_deals or settings.CHANNEL_DEALS,
                "big_deals": conf.channel_big_deals or settings.CHANNEL_BIG_DEALS,
                "new_offers": conf.channel_new_offers or settings.CHANNEL_NEW_OFFERS,
                "min_discount": conf.min_discount or settings.MIN_DISCOUNT
            })

        # Fallback target for default ENV configuration if no guild configs exist yet
        if not targets and (settings.CHANNEL_FREE_GAMES or settings.CHANNEL_DEALS):
            targets.append({
                "guild_id": "DEFAULT",
                "free_games": settings.CHANNEL_FREE_GAMES,
                "deals": settings.CHANNEL_DEALS,
                "big_deals": settings.CHANNEL_BIG_DEALS,
                "new_offers": settings.CHANNEL_NEW_OFFERS,
                "min_discount": settings.MIN_DISCOUNT
            })

        for db_deal, is_new in processed_deals:
            for target in targets:
                guild_id = target["guild_id"]
                min_discount = target["min_discount"]

                # 1. FREE GAMES CATEGORY
                if db_deal.is_free:
                    ch_id = target["free_games"] or target["deals"]
                    if ch_id and not await DatabaseManager.is_deal_published(db_deal.id, guild_id, "FREE"):
                        embed = EmbedBuilder.create_free_game_embed(db_deal)
                        msg_id = await self._send_embed(ch_id, embed)
                        if msg_id:
                            await DatabaseManager.record_published_deal(db_deal.id, guild_id, ch_id, msg_id, "FREE")
                    continue

                # 2. EXTREME DEALS (>= 80%)
                if db_deal.discount >= settings.EXTREME_DISCOUNT:
                    ch_id = target["big_deals"] or target["deals"]
                    if ch_id and not await DatabaseManager.is_deal_published(db_deal.id, guild_id, "EXTREME"):
                        embed = EmbedBuilder.create_big_deal_embed(db_deal, is_extreme=True)
                        msg_id = await self._send_embed(ch_id, embed)
                        if msg_id:
                            await DatabaseManager.record_published_deal(db_deal.id, guild_id, ch_id, msg_id, "EXTREME")
                    continue

                # 3. BIG DEALS (>= min_discount)
                if db_deal.discount >= min_discount:
                    ch_id = target["deals"] or target["big_deals"]
                    if ch_id and not await DatabaseManager.is_deal_published(db_deal.id, guild_id, "BIG_DEALS"):
                        embed = EmbedBuilder.create_big_deal_embed(db_deal, is_extreme=False)
                        msg_id = await self._send_embed(ch_id, embed)
                        if msg_id:
                            await DatabaseManager.record_published_deal(db_deal.id, guild_id, ch_id, msg_id, "BIG_DEALS")
                    continue

                # 4. NEW OFFERS
                if is_new and target["new_offers"]:
                    ch_id = target["new_offers"]
                    if not await DatabaseManager.is_deal_published(db_deal.id, guild_id, "NEW_OFFER"):
                        embed = EmbedBuilder.create_new_offer_embed(db_deal)
                        msg_id = await self._send_embed(ch_id, embed)
                        if msg_id:
                            await DatabaseManager.record_published_deal(db_deal.id, guild_id, ch_id, msg_id, "NEW_OFFER")

    async def _send_embed(self, channel_id_str: str, embed: discord.Embed) -> Optional[str]:
        """Helper to send an embed to a Discord channel by ID string."""
        try:
            channel_id = int(channel_id_str)
            channel = self.bot.get_channel(channel_id)
            if not channel:
                channel = await self.bot.fetch_channel(channel_id)
            if channel and isinstance(channel, discord.TextChannel):
                msg = await channel.send(embed=embed)
                return str(msg.id)
            else:
                logger.warning(f"Channel ID {channel_id_str} is not a valid TextChannel.")
        except Exception as ex:
            logger.error(f"Failed to send embed to channel {channel_id_str}: {ex}")
        return None
