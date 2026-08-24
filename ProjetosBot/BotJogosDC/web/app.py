import logging
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, Request, BackgroundTasks, Form, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from config.settings import settings
from database.database import DatabaseManager
from scheduler.updater import DealUpdater

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent

web_app = FastAPI(title="Bot Game Deals - Admin Dashboard")

# Mount templates & static files
templates = Jinja2Templates(directory=str(BASE_DIR / "web" / "templates"))
web_app.mount("/static", StaticFiles(directory=str(BASE_DIR / "web" / "static")), name="static")

@web_app.get("/", response_class=HTMLResponse)
async def dashboard_index(request: Request):
    """Render Web Admin Dashboard HTML UI."""
    stats = await DatabaseManager.get_dashboard_stats()
    free_games = await DatabaseManager.get_active_free_games()
    deals = await DatabaseManager.get_active_deals(min_discount=30.0, limit=20)

    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "stats": stats,
            "free_games": free_games,
            "deals": deals,
            "settings": settings,
        }
    )

@web_app.get("/api/stats")
async def get_stats():
    """API endpoint for dashboard stats AJAX polling."""
    return await DatabaseManager.get_dashboard_stats()

@web_app.get("/api/deals")
async def get_deals(min_discount: float = 0.0, store: Optional[str] = None):
    """API endpoint to query deals."""
    deals = await DatabaseManager.get_active_deals(min_discount=min_discount, store_filter=store, limit=50)
    return [d.to_dict() for d in deals]

@web_app.post("/api/sync")
async def trigger_sync(background_tasks: BackgroundTasks):
    """API endpoint to trigger immediate store synchronization."""
    updater = DealUpdater(bot=None)
    background_tasks.add_task(updater.run_update_cycle)
    return {"status": "started", "message": "Sincronização iniciada em segundo plano."}

@web_app.post("/api/settings")
async def update_settings(
    check_interval: int = Form(...),
    min_discount: float = Form(...),
    extreme_discount: float = Form(...),
    preferred_currency: str = Form(...)
):
    """API endpoint to update global settings."""
    settings.CHECK_INTERVAL_MINUTES = check_interval
    settings.MIN_DISCOUNT = min_discount
    settings.EXTREME_DISCOUNT = extreme_discount
    settings.PREFERRED_CURRENCY = preferred_currency
    logger.info("Updated global settings from Web Dashboard.")
    return {"status": "success", "message": "Configurações salvas com sucesso!"}
