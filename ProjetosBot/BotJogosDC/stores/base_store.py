from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class DealDTO(BaseModel):
    deal_key: str = Field(..., description="Unique key for store + item")
    title: str = Field(..., description="Name of the game")
    store: str = Field(..., description="Store name e.g. Epic Games Store, Steam")
    normal_price: float = Field(0.0, description="Original price")
    sale_price: float = Field(0.0, description="Current promotional price")
    discount: float = Field(0.0, description="Discount percentage 0-100")
    currency: str = Field("BRL", description="Currency symbol/code")
    url: str = Field(..., description="Direct link to claim or buy game")
    image_url: Optional[str] = Field(None, description="Game cover image URL")
    start_date: Optional[datetime] = Field(None, description="Promotion start time")
    end_date: Optional[datetime] = Field(None, description="Promotion end time")
    is_free: bool = Field(False, description="True if price is 0.00 or free promotion")

class BaseStore(ABC):
    store_id: str
    store_name: str

    @abstractmethod
    async def fetch_deals(self) -> List[DealDTO]:
        """Fetch current discounted game deals from store."""
        pass

    @abstractmethod
    async def fetch_free_games(self) -> List[DealDTO]:
        """Fetch games currently 100% free from store."""
        pass

    def calculate_discount(self, normal: float, sale: float) -> float:
        """Helper to calculate percentage discount."""
        if normal <= 0:
            return 0.0
        if sale <= 0:
            return 100.0
        discount = round(((normal - sale) / normal) * 100, 1)
        return max(0.0, min(100.0, discount))
