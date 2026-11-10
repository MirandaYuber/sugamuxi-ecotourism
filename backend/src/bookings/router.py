from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.auth.dependencies import require_role
from src.auth.schemas import UserResponse, UserRole
from src.core.responses import ApiResponse
from src.db.models import Booking, Route
from src.db.session import get_db

from .schemas import VisitorBookingResponse


router = APIRouter(prefix='/api/bookings', tags=['bookings'])


@router.get('/me', response_model=ApiResponse[list[VisitorBookingResponse]])
def list_my_bookings(
    user: Annotated[UserResponse, Depends(require_role(UserRole.VISITOR))],
    db: Annotated[Session, Depends(get_db)],
) -> ApiResponse[list[VisitorBookingResponse]]:
    rows = db.execute(
        select(Booking, Route.title)
        .join(Route, Route.id == Booking.route_id)
        .where(Booking.tourist_id == int(user.id))
        .order_by(Booking.booking_date.desc())
    ).all()
    data = [
        VisitorBookingResponse(
            id=booking.id,
            route_id=booking.route_id,
            experience_id=booking.route_id,
            experience_name=route_title,
            booking_date=booking.booking_date,
            num_people=booking.num_people,
            status=booking.status,
            total_cop=booking.total_cop,
            visitor_email=user.email,
        )
        for booking, route_title in rows
    ]
    return ApiResponse(code=200, message='Reservas obtenidas correctamente.', success=True, data=data)
