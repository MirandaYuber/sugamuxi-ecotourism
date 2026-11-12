import hashlib
import hmac
import secrets
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.db.models import User

from .schemas import RegisterRequest, UserResponse, UserRole


def _hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f'{salt.hex()}${digest.hex()}'


def _verify_password(password: str, encoded: str) -> bool:
    try:
        salt_hex, digest_hex = encoded.split('$', 1)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
    except ValueError:
        return False
    actual = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return hmac.compare_digest(actual, expected)


def to_response(user: User) -> UserResponse:
    return UserResponse(id=str(user.id), full_name=user.full_name, profile_image_url=user.profile_image_url, email=user.email, role=UserRole(user.role))


def create_user(db: Session, data: RegisterRequest) -> User:
    if db.scalar(select(User).where(User.email == data.email)) is not None:
        raise ValueError('El correo ya está registrado')
    user = User(full_name=data.full_name, email=data.email, role=data.role.value, hashed_password=_hash_password(data.password), is_active=True)
    db.add(user)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(user)
    return user


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not user.is_active or not _verify_password(password, user.hashed_password):
        return None
    return user
