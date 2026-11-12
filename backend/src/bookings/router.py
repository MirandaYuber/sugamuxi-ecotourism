from datetime import date, datetime, time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.auth.dependencies import require_role
from src.auth.schemas import UserResponse, UserRole
from src.core.responses import ApiResponse
from src.db.models import Booking, Route, User
from src.db.session import get_db

from .schemas import CreateBookingRequest, OperatorBookingResponse, UpdateBookingStatusRequest, VisitorBookingResponse


router = APIRouter(prefix='/api/bookings', tags=['bookings'])


def get_operator_profile_id(db: Session, user: UserResponse) -> int:
    from src.db.models import OperatorProfile
    profile = db.scalar(select(OperatorProfile).where(OperatorProfile.user_id == int(user.id)))
    if profile is None:
        raise HTTPException(status_code=409, detail='El guía no tiene un perfil configurado.')
    return profile.id


def serialize_operator_booking(booking: Booking, route_title: str, email: str) -> OperatorBookingResponse:
    return OperatorBookingResponse(
        id=booking.id, route_id=booking.route_id, experience_id=booking.route_id,
        experience_name=route_title, route_title=route_title, booking_date=booking.booking_date,
        num_people=booking.num_people, status=booking.status, total_cop=booking.total_cop,
        visitor_email=email, preferred_time=booking.preferred_time, visitor_name=booking.visitor_name,
        visitor_phone=booking.visitor_phone, visitor_message=booking.visitor_message,
        special_requirements=booking.special_requirements,
    )


def operator_bookings_query(db: Session, profile_id: int, booking_date: date | None = None, pending: bool = False):
    query = select(Booking, Route.title, User.email).join(Route, Route.id == Booking.route_id).join(User, User.id == Booking.tourist_id).where(Booking.operator_profile_id == profile_id)
    if booking_date is not None:
        query = query.where(Booking.booking_date >= datetime.combine(booking_date, time.min), Booking.booking_date < datetime.combine(booking_date, time.max))
    if pending:
        query = query.where(Booking.status == 'pending')
    return query.order_by(Booking.booking_date.desc())


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


@router.patch('/{booking_id}', response_model=ApiResponse[VisitorBookingResponse])
def cancel_my_booking(
    booking_id: int,
    user: Annotated[UserResponse, Depends(require_role(UserRole.VISITOR))],
    db: Annotated[Session, Depends(get_db)],
) -> ApiResponse[VisitorBookingResponse]:
    row = db.execute(
        select(Booking, Route.title)
        .join(Route, Route.id == Booking.route_id)
        .where(Booking.id == booking_id, Booking.tourist_id == int(user.id))
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail='La reserva no existe o no pertenece a este visitante.')
    booking, route_title = row
    if booking.status != 'pending':
        raise HTTPException(status_code=409, detail='Solo se pueden cancelar solicitudes pendientes.')
    booking.status = 'cancelled'
    db.commit()
    db.refresh(booking)
    response = VisitorBookingResponse(
        id=booking.id, route_id=booking.route_id, experience_id=booking.route_id,
        experience_name=route_title, booking_date=booking.booking_date,
        num_people=booking.num_people, status=booking.status, total_cop=booking.total_cop,
        visitor_email=user.email, preferred_time=booking.preferred_time,
        visitor_name=booking.visitor_name, visitor_phone=booking.visitor_phone,
        visitor_message=booking.visitor_message, special_requirements=booking.special_requirements,
    )
    return ApiResponse(code=200, message='Solicitud de reserva cancelada correctamente.', success=True, data=response)


@router.get('/operator', response_model=ApiResponse[list[OperatorBookingResponse]])
def list_operator_bookings(
    user: Annotated[UserResponse, Depends(require_role(UserRole.GUIDE))],
    db: Annotated[Session, Depends(get_db)],
    booking_date: date | None = Query(default=None),
) -> ApiResponse[list[OperatorBookingResponse]]:
    profile_id = get_operator_profile_id(db, user)
    rows = db.execute(operator_bookings_query(db, profile_id, booking_date=booking_date)).all()
    data = [serialize_operator_booking(booking, route_title, email) for booking, route_title, email in rows]
    return ApiResponse(code=200, message='Reservas del guía obtenidas correctamente.', success=True, data=data)


@router.get('/operator/pending', response_model=ApiResponse[list[OperatorBookingResponse]])
def list_pending_operator_bookings(
    user: Annotated[UserResponse, Depends(require_role(UserRole.GUIDE))],
    db: Annotated[Session, Depends(get_db)],
) -> ApiResponse[list[OperatorBookingResponse]]:
    profile_id = get_operator_profile_id(db, user)
    rows = db.execute(operator_bookings_query(db, profile_id, pending=True)).all()
    data = [serialize_operator_booking(booking, route_title, email) for booking, route_title, email in rows]
    return ApiResponse(code=200, message='Solicitudes pendientes obtenidas correctamente.', success=True, data=data)


@router.patch('/operator/{booking_id}/status', response_model=ApiResponse[OperatorBookingResponse])
def update_operator_booking_status(
    booking_id: int,
    data: UpdateBookingStatusRequest,
    user: Annotated[UserResponse, Depends(require_role(UserRole.GUIDE))],
    db: Annotated[Session, Depends(get_db)],
) -> ApiResponse[OperatorBookingResponse]:
    profile_id = get_operator_profile_id(db, user)
    row = db.execute(select(Booking, Route.title, User.email).join(Route, Route.id == Booking.route_id).join(User, User.id == Booking.tourist_id).where(Booking.id == booking_id, Booking.operator_profile_id == profile_id)).first()
    if row is None:
        raise HTTPException(status_code=404, detail='La reserva no existe o no pertenece a este guía.')
    booking, route_title, email = row
    booking.status = data.status
    db.commit()
    db.refresh(booking)
    return ApiResponse(code=200, message='Estado de la reserva actualizado correctamente.', success=True, data=serialize_operator_booking(booking, route_title, email))
