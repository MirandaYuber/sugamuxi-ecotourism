from enum import StrEnum

from pydantic import BaseModel, Field, field_validator


class UserRole(StrEnum):
    VISITOR = 'visitor'
    GUIDE = 'guide'


class RegisterRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.VISITOR

    @field_validator('email')
    @classmethod
    def normalize_email(cls, value: str) -> str:
        email = value.strip().lower()
        if '@' not in email or email.startswith('@') or email.endswith('@'):
            raise ValueError('Debe ser un correo electrónico válido')
        return email


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=128)

    @field_validator('email')
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class UserResponse(BaseModel):
    id: str
    email: str
    role: UserRole


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: UserResponse
