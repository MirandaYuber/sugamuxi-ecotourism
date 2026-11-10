from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.auth.dependencies import require_role
from src.auth.schemas import UserResponse, UserRole
from src.core.responses import ApiResponse
from src.db.models import OperatorProfile, Route
from src.db.session import get_db

from .schemas import PublicRouteResponse, RouteInput, RouteResponse


router = APIRouter(prefix='/api/routes', tags=['routes'])
public_router = APIRouter(prefix='/api/public/routes', tags=['public-catalog'])


def serialize_route(route: Route) -> RouteResponse:
    return RouteResponse(
        id=route.id, title=route.title, description=route.description,
        municipality=route.municipality, difficulty=route.difficulty,
        duration_hours=float(route.duration_hours), price_cop=route.price_cop,
        location_start={'latitude': route.start_latitude, 'longitude': route.start_longitude},
        route_points=route.route_points or [], status=route.status, created_at=route.created_at,
    )


def get_profile(db: Session, user: UserResponse) -> OperatorProfile:
    profile = db.scalar(select(OperatorProfile).where(OperatorProfile.user_id == int(user.id)))
    if profile is None:
        profile = OperatorProfile(
            user_id=int(user.id), full_name=user.email.split('@')[0][:160], municipality='Sogamoso',
            phone='', rnt_number=f'PENDING-{user.id}', verification_status='pending',
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get('', response_model=ApiResponse[list[RouteResponse]])
def list_routes(
    user: Annotated[UserResponse, Depends(require_role(UserRole.GUIDE))],
    db: Annotated[Session, Depends(get_db)],
) -> ApiResponse[list[RouteResponse]]:
    profile = get_profile(db, user)
    routes = db.scalars(select(Route).where(Route.operator_profile_id == profile.id).order_by(Route.created_at.desc())).all()
    return ApiResponse(code=200, message='Rutas obtenidas correctamente.', success=True, data=[serialize_route(route) for route in routes])


@router.post('', response_model=ApiResponse[RouteResponse], status_code=status.HTTP_201_CREATED)
def create_route(
    data: RouteInput,
    user: Annotated[UserResponse, Depends(require_role(UserRole.GUIDE))],
    db: Annotated[Session, Depends(get_db)],
) -> ApiResponse[RouteResponse]:
    profile = get_profile(db, user)
    route = Route(
        operator_profile_id=profile.id, title=data.title, description=data.description,
        municipality=data.municipality, difficulty=data.difficulty, duration_hours=data.duration_hours,
        start_latitude=data.location_start.latitude, start_longitude=data.location_start.longitude,
        price_cop=data.price_cop, status=data.status, route_points=[point.model_dump() for point in data.route_points],
        created_at=datetime.utcnow(),
    )
    db.add(route)
    db.commit()
    db.refresh(route)
    response = serialize_route(route)
    return ApiResponse(code=201, message='Ruta creada correctamente.', success=True, data=response)


@router.patch('/{route_id}', response_model=ApiResponse[RouteResponse])
def update_route(
    route_id: int,
    data: RouteInput,
    user: Annotated[UserResponse, Depends(require_role(UserRole.GUIDE))],
    db: Annotated[Session, Depends(get_db)],
) -> ApiResponse[RouteResponse]:
    profile = get_profile(db, user)
    route = db.scalar(select(Route).where(Route.id == route_id, Route.operator_profile_id == profile.id))
    if route is None:
        raise HTTPException(status_code=404, detail='La ruta no existe o no pertenece a este guía.')
    route.title = data.title
    route.description = data.description
    route.municipality = data.municipality
    route.difficulty = data.difficulty
    route.duration_hours = data.duration_hours
    route.start_latitude = data.location_start.latitude
    route.start_longitude = data.location_start.longitude
    route.price_cop = data.price_cop
    route.status = data.status
    route.route_points = [point.model_dump() for point in data.route_points]
    db.commit()
    db.refresh(route)
    return ApiResponse(code=200, message='Ruta actualizada correctamente.', success=True, data=serialize_route(route))


def serialize_public_route(route: Route, guide_name: str) -> PublicRouteResponse:
    return PublicRouteResponse(id=route.id, name=route.title, description=route.description, detail=route.description, municipality=route.municipality, difficulty=route.difficulty, duration_hours=float(route.duration_hours), price=route.price_cop, location_start={'latitude': route.start_latitude, 'longitude': route.start_longitude}, route_points=route.route_points or [], guide_name=guide_name)


@public_router.get('', response_model=ApiResponse[list[PublicRouteResponse]])
def list_public_routes(municipality: str | None = None, search: str | None = None, db: Session = Depends(get_db)) -> ApiResponse[list[PublicRouteResponse]]:
    query = select(Route, OperatorProfile.full_name).join(OperatorProfile, OperatorProfile.id == Route.operator_profile_id).where(Route.status == 'active')
    if municipality:
        query = query.where(Route.municipality == municipality)
    if search:
        query = query.where(Route.title.ilike(f'%{search.strip()}%'))
    rows = db.execute(query.order_by(Route.created_at.desc())).all()
    return ApiResponse(code=200, message='Experiencias obtenidas correctamente.', success=True, data=[serialize_public_route(route, guide_name) for route, guide_name in rows])


@public_router.get('/{route_id}', response_model=ApiResponse[PublicRouteResponse])
def get_public_route(route_id: int, db: Session = Depends(get_db)) -> ApiResponse[PublicRouteResponse]:
    row = db.execute(select(Route, OperatorProfile.full_name).join(OperatorProfile, OperatorProfile.id == Route.operator_profile_id).where(Route.id == route_id, Route.status == 'active')).first()
    if row is None:
        raise HTTPException(status_code=404, detail='La experiencia no existe o no está disponible.')
    route, guide_name = row
    return ApiResponse(code=200, message='Experiencia obtenida correctamente.', success=True, data=serialize_public_route(route, guide_name))
