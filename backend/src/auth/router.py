from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated
from uuid import uuid4

import jwt
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from src.core.config import settings
from src.db.session import get_db

from .dependencies import current_user
from .schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from .service import authenticate, create_user, to_response
from src.core.responses import ApiResponse


router = APIRouter(prefix='/api/auth', tags=['auth'])
PROFILE_MEDIA_DIR = Path(__file__).resolve().parents[2] / 'media' / 'profiles'
ALLOWED_PROFILE_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}
MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024


def create_access_token(user: UserResponse) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({'sub': user.id, 'role': user.role.value, 'exp': expires_at}, settings.secret_key, algorithm=settings.algorithm)


@router.post('/register', response_model=ApiResponse[TokenResponse], status_code=status.HTTP_201_CREATED)
async def register(
    full_name: Annotated[str, Form(...)],
    email: Annotated[str, Form(...)],
    password: Annotated[str, Form(...)],
    role: Annotated[str, Form()] = 'visitor',
    profile_image: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
) -> ApiResponse[TokenResponse]:
    try:
        data = RegisterRequest(full_name=full_name, email=email, password=password, role=role)
    except ValueError as error:
        raise HTTPException(status_code=422, detail='Los datos de registro no son válidos.') from error
    image_content: bytes | None = None
    image_extension = '.jpg'
    if profile_image is not None:
        if profile_image.content_type not in ALLOWED_PROFILE_IMAGE_TYPES:
            raise HTTPException(status_code=415, detail='La foto debe ser JPG, PNG, WEBP o GIF.')
        image_content = await profile_image.read()
        if len(image_content) > MAX_PROFILE_IMAGE_SIZE:
            raise HTTPException(status_code=413, detail='La foto de perfil debe pesar máximo 5 MB.')
        image_extension = Path(profile_image.filename or '').suffix.lower() or '.jpg'
    try:
        user = create_user(db, data)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    if image_content is not None:
        PROFILE_MEDIA_DIR.mkdir(parents=True, exist_ok=True)
        filename = f'{uuid4().hex}{image_extension}'
        (PROFILE_MEDIA_DIR / filename).write_bytes(image_content)
        user.profile_image_url = f'/media/profiles/{filename}'
        db.commit()
        db.refresh(user)
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
