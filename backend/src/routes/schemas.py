from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class RoutePoint(BaseModel):
    latitude: float
    longitude: float


class RouteInput(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    description: str = Field(min_length=1)
    municipality: str = Field(min_length=1, max_length=80)
    difficulty: Literal['low', 'medium', 'high']
    duration_hours: float = Field(gt=0, le=72)
    price_cop: int = Field(ge=0)
    location_start: RoutePoint
    route_points: list[RoutePoint] = Field(default_factory=list)
    images: list[str] = Field(default_factory=list)
    status: Literal['active', 'draft', 'paused'] = 'draft'


class RouteResponse(RouteInput):
    id: int
    created_at: datetime


class PublicRouteResponse(BaseModel):
    id: int
    name: str
    description: str
    detail: str
    municipality: str
    difficulty: str
    duration_hours: float
    price: int
    location_start: RoutePoint
    route_points: list[RoutePoint]
    images: list[str]
    guide_name: str
    images: list[str]
