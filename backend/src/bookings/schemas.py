from datetime import datetime

from pydantic import BaseModel


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
