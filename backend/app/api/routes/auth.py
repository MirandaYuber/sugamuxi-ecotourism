from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.deps import DbSession, get_current_user
from app.models.user import User
from app.schemas.auth import Token, UserCreate, UserRead
from app.services.auth import create_access_token, hash_password, verify_password

router = APIRouter(prefix='/auth', tags=['auth'])

@router.post('/register', response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: DbSession) -> User:
    if db.query(User).filter(User.email == data.email).first(): raise HTTPException(409, 'El correo ya está registrado')
    user = User(email=str(data.email), hashed_password=hash_password(data.password))
    db.add(user); db.commit(); db.refresh(user)
    return user

@router.post('/login', response_model=Token)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbSession) -> Token:
    user = db.query(User).filter(User.email == form.username).first()
    if user is None or not verify_password(form.password, user.hashed_password): raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Credenciales incorrectas')
    return Token(access_token=create_access_token(user.email, user.role.value),)

@router.get('/me', response_model=UserRead)
def me(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user
