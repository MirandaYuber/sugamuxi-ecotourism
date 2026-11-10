from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.core.config import settings
from src.db.session import get_db

from .dependencies import current_user
from .schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from .service import authenticate, create_user, to_response
from src.core.responses import ApiResponse


router = APIRouter(prefix='/api/auth', tags=['auth'])


def create_access_token(user: UserResponse) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({'sub': user.id, 'role': user.role.value, 'exp': expires_at}, settings.secret_key, algorithm=settings.algorithm)


@router.post('/register', response_model=ApiResponse[TokenResponse], status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Annotated[Session, Depends(get_db)]) -> ApiResponse[TokenResponse]:
    try:
        user = create_user(db, data)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    response = to_response(user)
    return ApiResponse(code=201, message='Usuario registrado correctamente.', success=True, data=TokenResponse(access_token=create_access_token(response), user=response))


@router.post('/login', response_model=ApiResponse[TokenResponse])
def login(data: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> ApiResponse[TokenResponse]:
    user = authenticate(db, data.email, data.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Correo o contraseña incorrectos')
    response = to_response(user)
    return ApiResponse(code=200, message='Inicio de sesión exitoso.', success=True, data=TokenResponse(access_token=create_access_token(response), user=response))


@router.get('/me', response_model=ApiResponse[UserResponse])
def me(user: Annotated[UserResponse, Depends(current_user)]) -> ApiResponse[UserResponse]:
    return ApiResponse(code=200, message='Usuario obtenido correctamente.', success=True, data=user)
