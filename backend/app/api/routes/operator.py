from fastapi import APIRouter, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import CurrentOperator, DbSession
from app.models.operator import Booking, BookingStatus, OperatorProfile, Route
from app.schemas.operator import (BookingRead, BookingStatusUpdate, OperatorProfileRead,
    OperatorProfileWrite, RouteRead, RouteWrite)

router = APIRouter(prefix='/operator', tags=['operator'])

def get_profile(db: Session, user_id: int) -> OperatorProfile:
    profile = db.query(OperatorProfile).filter(OperatorProfile.user_id == user_id).first()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='El operador aún no tiene perfil')
    return profile

@router.post('/profile', response_model=OperatorProfileRead)
def upsert_profile(data: OperatorProfileWrite, current: CurrentOperator, db: DbSession) -> OperatorProfile:
    profile = db.query(OperatorProfile).filter(OperatorProfile.user_id == current.id).first()
    if profile is None:
        profile = OperatorProfile(user_id=current.id, **data.model_dump())
        db.add(profile)
    else:
        for key, value in data.model_dump().items():
            setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile

@router.get('/profile', response_model=OperatorProfileRead)
def read_profile(current: CurrentOperator, db: DbSession) -> OperatorProfile:
    return get_profile(db, current.id)

@router.get('/routes', response_model=list[RouteRead])
def list_routes(current: CurrentOperator, db: DbSession) -> list[Route]:
    profile = get_profile(db, current.id)
    return db.query(Route).filter(Route.operator_profile_id == profile.id).order_by(Route.created_at.desc()).all()

@router.post('/routes', response_model=RouteRead, status_code=status.HTTP_201_CREATED)
def create_route(data: RouteWrite, current: CurrentOperator, db: DbSession) -> Route:
    profile = get_profile(db, current.id)
    values = data.model_dump(exclude={'location_start'})
    values['route_points'] = [point.model_dump() for point in data.route_points]
    values.update(start_latitude=data.location_start.latitude, start_longitude=data.location_start.longitude)
    route = Route(operator_profile_id=profile.id, **values)
    db.add(route); db.commit(); db.refresh(route)
    return route

@router.put('/routes/{route_id}', response_model=RouteRead)
def update_route(route_id: int, data: RouteWrite, current: CurrentOperator, db: DbSession) -> Route:
    profile = get_profile(db, current.id)
    route = db.query(Route).filter(Route.id == route_id, Route.operator_profile_id == profile.id).first()
    if route is None:
        raise HTTPException(status_code=404, detail='Ruta no encontrada')
    for key, value in data.model_dump(exclude={'location_start'}).items():
        if key == 'route_points':
            value = [point.model_dump() for point in data.route_points]
        setattr(route, key, value)
    route.start_latitude = data.location_start.latitude
    route.start_longitude = data.location_start.longitude
    db.commit(); db.refresh(route)
    return route

@router.get('/bookings', response_model=list[BookingRead])
def list_bookings(current: CurrentOperator, db: DbSession) -> list[BookingRead]:
    profile = get_profile(db, current.id)
    rows = db.query(Booking, Route.title,).join(Route, Booking.route_id == Route.id).filter(Booking.operator_profile_id == profile.id).order_by(Booking.booking_date.desc()).all()
    return [BookingRead.model_validate({**booking.__dict__, 'route_title': title, 'tourist_email': booking.tourist.email}) for booking, title in rows]

@router.patch('/bookings/{booking_id}/status', response_model=BookingRead)
def update_booking_status(booking_id: int, data: BookingStatusUpdate, current: CurrentOperator, db: DbSession) -> BookingRead:
    profile = get_profile(db, current.id)
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.operator_profile_id == profile.id).first()
    if booking is None:
        raise HTTPException(status_code=404, detail='Reserva no encontrada')
    if data.status not in {BookingStatus.CONFIRMED, BookingStatus.REJECTED}:
        raise HTTPException(status_code=400, detail='Solo se puede confirmar o rechazar una solicitud')
    booking.status = data.status
    db.commit(); db.refresh(booking)
    return BookingRead.model_validate({**booking.__dict__, 'route_title': booking.route.title, 'tourist_email': booking.tourist.email})
