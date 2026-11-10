from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)


class Route(Base):
    __tablename__ = 'routes'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)


class Booking(Base):
    __tablename__ = 'bookings'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    route_id: Mapped[int] = mapped_column(Integer, nullable=False)
    tourist_id: Mapped[int] = mapped_column(Integer, nullable=False)
    operator_profile_id: Mapped[int] = mapped_column(Integer, nullable=False)
    booking_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    num_people: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    total_cop: Mapped[int] = mapped_column(Integer, nullable=False)
