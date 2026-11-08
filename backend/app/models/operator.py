from datetime import datetime
from decimal import Decimal
from enum import Enum
from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

class VerificationStatus(str, Enum):
    PENDING = 'pending'
    VERIFIED = 'verified'
    REJECTED = 'rejected'

class RouteStatus(str, Enum):
    ACTIVE = 'active'
    DRAFT = 'draft'
    PAUSED = 'paused'

class Difficulty(str, Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'

class BookingStatus(str, Enum):
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    REJECTED = 'rejected'
    CANCELLED = 'cancelled'
    COMPLETED = 'completed'

class OperatorProfile(Base):
    __tablename__ = 'operator_profiles'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(160))
    municipality: Mapped[str] = mapped_column(String(80))
    phone: Mapped[str] = mapped_column(String(30))
    rnt_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    soporte_rnt_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    verification_status: Mapped[VerificationStatus] = mapped_column(String(20), default=VerificationStatus.PENDING)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    user: Mapped['User'] = relationship(back_populates='operator_profile')
    routes: Mapped[list['Route']] = relationship(back_populates='operator', cascade='all, delete-orphan')
    bookings: Mapped[list['Booking']] = relationship(back_populates='operator')

class Route(Base):
    __tablename__ = 'routes'
    id: Mapped[int] = mapped_column(primary_key=True)
    operator_profile_id: Mapped[int] = mapped_column(ForeignKey('operator_profiles.id'), index=True)
    title: Mapped[str] = mapped_column(String(180))
    description: Mapped[str] = mapped_column(Text)
    difficulty: Mapped[Difficulty] = mapped_column(String(20))
    duration_hours: Mapped[Decimal] = mapped_column(Numeric(5, 2))
    start_latitude: Mapped[float] = mapped_column(Float)
    start_longitude: Mapped[float] = mapped_column(Float)
    route_points: Mapped[list[dict]] = mapped_column(JSON, default=list)
    price_cop: Mapped[int] = mapped_column(Integer)
    status: Mapped[RouteStatus] = mapped_column(String(20), default=RouteStatus.DRAFT)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    operator: Mapped[OperatorProfile] = relationship(back_populates='routes')
    bookings: Mapped[list['Booking']] = relationship(back_populates='route')

    @property
    def location_start(self) -> dict[str, float]:
        return {'latitude': self.start_latitude, 'longitude': self.start_longitude}

class Booking(Base):
    __tablename__ = 'bookings'
    id: Mapped[int] = mapped_column(primary_key=True)
    route_id: Mapped[int] = mapped_column(ForeignKey('routes.id'), index=True)
    tourist_id: Mapped[int] = mapped_column(ForeignKey('users.id'), index=True)
    operator_profile_id: Mapped[int] = mapped_column(ForeignKey('operator_profiles.id'), index=True)
    booking_date: Mapped[datetime] = mapped_column(DateTime)
    num_people: Mapped[int] = mapped_column(Integer)
    status: Mapped[BookingStatus] = mapped_column(String(20), default=BookingStatus.PENDING)
    total_cop: Mapped[int] = mapped_column(Integer)
    route: Mapped[Route] = relationship(back_populates='bookings')
    tourist: Mapped['User'] = relationship(foreign_keys=[tourist_id])
    operator: Mapped[OperatorProfile] = relationship(back_populates='bookings')
