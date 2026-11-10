from typing import Literal

from pydantic import BaseModel, Field


class OperatorProfileInput(BaseModel):
    full_name: str = Field(min_length=3, max_length=160)
    municipality: str = Field(min_length=1, max_length=80)
    phone: str = Field(min_length=7, max_length=30)
    rnt_number: str = Field(min_length=3, max_length=40)
    soporte_rnt_url: str | None = Field(default=None, max_length=500)
    bio: str | None = Field(default=None, max_length=2000)


class OperatorProfileResponse(OperatorProfileInput):
    id: int
    verification_status: Literal['pending', 'verified', 'rejected']
