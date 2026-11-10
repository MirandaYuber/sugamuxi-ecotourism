from typing import Generic, TypeVar

from pydantic import BaseModel


DataT = TypeVar('DataT')


class ApiResponse(BaseModel, Generic[DataT]):
    code: int
    message: str
    success: bool
    data: DataT | None = None
