from enum import Enum
from sqlalchemy import Boolean, Enum as SqlEnum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

class UserRole(str, Enum):
    TOURIST = 'tourist'
    OPERATOR = 'operator'

class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    role: Mapped[UserRole] = mapped_column(SqlEnum(UserRole), default=UserRole.TOURIST, nullable=False)
    operator_profile: Mapped['OperatorProfile | None'] = relationship(back_populates='user', uselist=False, cascade='all, delete-orphan')
