from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.auth.dependencies import require_role
from src.auth.schemas import UserResponse, UserRole
from src.core.responses import ApiResponse
from src.db.models import OperatorProfile
from src.db.session import get_db

from .schemas import OperatorProfileInput, OperatorProfileResponse


router = APIRouter(prefix='/api/operator/profile', tags=['operator-profile'])


def serialize(profile: OperatorProfile) -> OperatorProfileResponse:
    return OperatorProfileResponse(id=profile.id, full_name=profile.full_name, municipality=profile.municipality, phone=profile.phone, rnt_number=profile.rnt_number, soporte_rnt_url=profile.soporte_rnt_url, bio=profile.bio, verification_status=profile.verification_status)


def profile_for_user(db: Session, user: UserResponse) -> OperatorProfile | None:
    return db.scalar(select(OperatorProfile).where(OperatorProfile.user_id == int(user.id)))


@router.get('', response_model=ApiResponse[OperatorProfileResponse])
def get_profile(user: Annotated[UserResponse, Depends(require_role(UserRole.GUIDE))], db: Annotated[Session, Depends(get_db)]) -> ApiResponse[OperatorProfileResponse]:
    profile = profile_for_user(db, user)
    if profile is None:
        profile = OperatorProfile(user_id=int(user.id), full_name=user.email.split('@')[0][:160], municipality='Sogamoso', phone='', rnt_number=f'PENDING-{user.id}', verification_status='pending')
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return ApiResponse(code=200, message='Perfil obtenido correctamente.', success=True, data=serialize(profile))


@router.put('', response_model=ApiResponse[OperatorProfileResponse])
def save_profile(data: OperatorProfileInput, user: Annotated[UserResponse, Depends(require_role(UserRole.GUIDE))], db: Annotated[Session, Depends(get_db)]) -> ApiResponse[OperatorProfileResponse]:
    profile = profile_for_user(db, user)
    if profile is None:
        profile = OperatorProfile(user_id=int(user.id), verification_status='pending')
        db.add(profile)
    profile.full_name = data.full_name
    profile.municipality = data.municipality
    profile.phone = data.phone
    profile.rnt_number = data.rnt_number
    profile.soporte_rnt_url = data.soporte_rnt_url
    profile.bio = data.bio
    db.commit()
    db.refresh(profile)
    return ApiResponse(code=200, message='Perfil RNT guardado correctamente.', success=True, data=serialize(profile))
