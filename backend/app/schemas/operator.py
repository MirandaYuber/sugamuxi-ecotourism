from datetime import datetime
from decimal import Decimal
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field
from app.models.operator import BookingStatus, Difficulty, RouteStatus, VerificationStatus

class Municipality(str, Enum):
    SOGAMOSO = 'Sogamoso'
    CORRALES = 'Corrales'
    TASCO = 'Tasco'
    PAZ_DE_RIO = 'Paz de Río'

class OperatorProfileWrite(BaseModel):
    full_name: str = Field(min_length=3, max_length=160)
    municipality: Municipality
    phone: str = Field(min_length=7, max_length=30)
    rnt_number: str = Field(min_length=3, max_length=40)
    soporte_rnt_url: str | None = Field(default=None, max_length=500)
    bio: str | None = Field(default=None, max_length=2000)

class OperatorProfileRead(OperatorProfileWrite):
    model_config = ConfigDict(from_attributes=True)
    id: int
    verification_status: VerificationStatus

class LocationStart(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

class RouteWrite(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    description: str = Field(min_length=10, max_length=5000)
    difficulty: Difficulty
    duration_hours: Decimal = Field(gt=0, le=72)
    price_cop: int = Field(ge=0)
    location_start: LocationStart
    route_points: list[LocationStart] = Field(default_factory=list, max_length=500)
    status: RouteStatus = RouteStatus.DRAFT

class RouteRead(RouteWrite):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime

class BookingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    route_id: int
    booking_date: datetime
    num_people: int
    status: BookingStatus
    total_cop: int
    route_title: str
    tourist_email: str

class BookingStatusUpdate(BaseModel):
    status: BookingStatus
