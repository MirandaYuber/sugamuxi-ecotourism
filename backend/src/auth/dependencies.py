from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.core.config import settings
from src.db.models import User
from src.db.session import get_db

from .schemas import UserResponse, UserRole
from .service import to_response


bearer = HTTPBearer(auto_error=False)


def current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token requerido')
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=[settings.algorithm])
        user_id = payload.get('sub')
        if not isinstance(user_id, str):
            raise ValueError
    except (jwt.InvalidTokenError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token inválido') from None

    try:
        user = db.scalar(select(User).where(User.id == int(user_id)))
    except ValueError:
        user = None
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Usuario no encontrado')
    return to_response(user)


def require_role(role: UserRole):
    def dependency(user: Annotated[UserResponse, Depends(current_user)]) -> UserResponse:
        if user.role != role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='No tienes permisos para este recurso')
        return user

    return dependency
