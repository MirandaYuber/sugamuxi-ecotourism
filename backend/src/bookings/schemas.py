from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


class CreateBookingRequest(BaseModel):
    route_id: int = Field(gt=0)
    booking_date: date
    preferred_time: str = Field(min_length=1, max_length=30)
    num_people: int = Field(ge=1, le=20)
    visitor_name: str = Field(min_length=3, max_length=160)
    visitor_phone: str = Field(min_length=7, max_length=30)
    visitor_message: str | None = Field(default=None, max_length=500)
    special_requirements: str | None = Field(default=None, max_length=500)


class UpdateBookingStatusRequest(BaseModel):
    status: Literal['confirmed', 'rejected', 'cancelled', 'completed']


class VisitorBookingResponse(BaseModel):
    id: int
    route_id: int
    experience_id: int
    experience_name: str
    booking_date: datetime
    num_people: int
    status: str
    total_cop: int
    visitor_email: str
    preferred_time: str
    visitor_name: str
    visitor_phone: str
    visitor_message: str | None = None
    special_requirements: str | None = None


class OperatorBookingResponse(VisitorBookingResponse):
    route_title: str
