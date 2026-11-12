from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    profile_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)


class OperatorProfile(Base):
    __tablename__ = 'operator_profiles'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    municipality: Mapped[str] = mapped_column(String(80), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    rnt_number: Mapped[str] = mapped_column(String(40), nullable=False)
    soporte_rnt_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    verification_status: Mapped[str] = mapped_column(String(20), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)


class Route(Base):
    __tablename__ = 'routes'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    operator_profile_id: Mapped[int] = mapped_column(Integer, nullable=False)
    price_cop: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    municipality: Mapped[str] = mapped_column(String(80), nullable=False)
    route_points: Mapped[list] = mapped_column(JSON, nullable=False)
    images: Mapped[list] = mapped_column(JSON, nullable=False)
    start_latitude: Mapped[float] = mapped_column(nullable=False)
    start_longitude: Mapped[float] = mapped_column(nullable=False)
    duration_hours: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)


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
    preferred_time: Mapped[str] = mapped_column(String(30), nullable=False)
    visitor_name: Mapped[str] = mapped_column(String(160), nullable=False)
    visitor_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    visitor_message: Mapped[str | None] = mapped_column(String(500), nullable=True)
    special_requirements: Mapped[str | None] = mapped_column(String(500), nullable=True)
