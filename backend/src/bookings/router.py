from datetime import datetime, time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.auth.dependencies import require_role
from src.auth.schemas import UserResponse, UserRole
from src.core.responses import ApiResponse
from src.db.models import Booking, Route
from src.db.session import get_db

from .schemas import CreateBookingRequest, VisitorBookingResponse


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
            preferred_time=booking.preferred_time,
            visitor_name=booking.visitor_name,
            visitor_phone=booking.visitor_phone,
            visitor_message=booking.visitor_message,
            special_requirements=booking.special_requirements,
        )
        for booking, route_title in rows
    ]
    return ApiResponse(code=200, message='Reservas obtenidas correctamente.', success=True, data=data)


@router.post('', response_model=ApiResponse[VisitorBookingResponse], status_code=201)
def create_booking(
    data: CreateBookingRequest,
    user: Annotated[UserResponse, Depends(require_role(UserRole.VISITOR))],
    db: Annotated[Session, Depends(get_db)],
) -> ApiResponse[VisitorBookingResponse]:
    route = db.scalar(select(Route).where(Route.id == data.route_id))
    if route is None:
        raise HTTPException(status_code=404, detail='La experiencia no existe.')
    if route.status != 'active':
        raise HTTPException(status_code=409, detail='La experiencia no está disponible.')

    booking = Booking(
        route_id=route.id,
        tourist_id=int(user.id),
        operator_profile_id=route.operator_profile_id,
        booking_date=datetime.combine(data.booking_date, time.min),
        num_people=data.num_people,
        status='pending',
        total_cop=data.num_people * route.price_cop,
        preferred_time=data.preferred_time,
        visitor_name=data.visitor_name,
        visitor_phone=data.visitor_phone,
        visitor_message=data.visitor_message,
        special_requirements=data.special_requirements,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    response = VisitorBookingResponse(
        id=booking.id, route_id=route.id, experience_id=route.id, experience_name=route.title,
        booking_date=booking.booking_date, num_people=booking.num_people, status=booking.status,
        total_cop=booking.total_cop, visitor_email=user.email, preferred_time=booking.preferred_time,
        visitor_name=booking.visitor_name, visitor_phone=booking.visitor_phone,
        visitor_message=booking.visitor_message, special_requirements=booking.special_requirements,
    )
    return ApiResponse(code=201, message='Solicitud de reserva enviada correctamente.', success=True, data=response)
