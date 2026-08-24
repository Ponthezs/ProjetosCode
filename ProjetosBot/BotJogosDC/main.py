import asyncio
import logging
import sys
import uvicorn
from config.settings import settings
from database.database import init_db
from bot.client import GameDealsBot
from web.app import web_app

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s [%(name)s]: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("logs/bot_execution.log", encoding="utf-8")
    ]
)

logger = logging.getLogger("main")

async def run_fastapi_server():
    """Runs the FastAPI Web Admin Panel with Uvicorn."""
    config = uvicorn.Config(
        app=web_app,
        host=settings.WEB_HOST,
        port=settings.WEB_PORT,
        log_level="info"
    )
    server = uvicorn.Server(config)
    logger.info(f"Starting Web Admin Panel on http://{settings.WEB_HOST}:{settings.WEB_PORT}")
    await server.serve()

async def run_bot_and_web():
    """Initializes DB and runs Discord Bot + Web Admin Panel concurrently."""
    await init_db()

    bot_task = None
    if settings.DISCORD_TOKEN and settings.DISCORD_TOKEN != "your_discord_bot_token_here":
        bot = GameDealsBot()
        logger.info("Starting Discord Bot connection...")
        bot_task = asyncio.create_task(bot.start(settings.DISCORD_TOKEN))
    else:
        logger.warning("DISCORD_TOKEN is not set or using placeholder in .env. Bot will start in Web-Only mode. (Provide token to connect Discord bot).")

    web_task = asyncio.create_task(run_fastapi_server())

    tasks = [web_task]
    if bot_task:
        tasks.append(bot_task)

    await asyncio.gather(*tasks)

if __name__ == "__main__":
    try:
        asyncio.run(run_bot_and_web())
    except KeyboardInterrupt:
        logger.info("Application stopped by user.")
