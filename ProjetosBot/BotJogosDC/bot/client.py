import logging
import discord
from discord.ext import commands, tasks
from config.settings import settings
from scheduler.updater import DealUpdater

logger = logging.getLogger(__name__)

class GameDealsBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        intents.guilds = True
        intents.messages = True
        super().__init__(command_prefix="!", intents=intents)
        self.updater = DealUpdater(bot=self)

    async def setup_hook(self):
        """Called automatically before bot login is completed."""
        logger.info("Loading Cogs and registering slash commands...")
        await self.load_extension("bot.commands.deals")
        try:
            synced = await self.tree.sync()
            logger.info(f"Successfully synced {len(synced)} Slash Commands globally.")
        except Exception as e:
            logger.error(f"Failed to sync slash commands: {e}")

    async def on_ready(self):
        logger.info(f"Bot logged in as {self.user} (ID: {self.user.id})")
        if not self.update_task.is_running():
            self.update_task.start()

    @tasks.loop(minutes=settings.CHECK_INTERVAL_MINUTES)
    async def update_task(self):
        """Periodic background task that checks stores for deals."""
        logger.info("Periodic store check triggered by bot loop.")
        await self.updater.run_update_cycle()

    @update_task.before_loop
    async def before_update_task(self):
        await self.wait_until_ready()
