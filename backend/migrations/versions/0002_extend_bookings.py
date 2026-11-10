"""store visitor reservation request details

Revision ID: 0002_extend_bookings
Revises: 0001_add_auth_role
Create Date: 2026-11-09
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '0002_extend_bookings'
down_revision: str | None = '0001_add_auth_role'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('bookings', sa.Column('preferred_time', sa.String(length=30), nullable=True))
    op.add_column('bookings', sa.Column('visitor_name', sa.String(length=160), nullable=True))
    op.add_column('bookings', sa.Column('visitor_phone', sa.String(length=30), nullable=True))
    op.add_column('bookings', sa.Column('visitor_message', sa.String(length=500), nullable=True))
    op.add_column('bookings', sa.Column('special_requirements', sa.String(length=500), nullable=True))
    op.execute("UPDATE bookings SET preferred_time = '' WHERE preferred_time IS NULL")
    op.execute("UPDATE bookings SET visitor_name = '' WHERE visitor_name IS NULL")
    op.execute("UPDATE bookings SET visitor_phone = '' WHERE visitor_phone IS NULL")
    op.alter_column('bookings', 'preferred_time', nullable=False)
    op.alter_column('bookings', 'visitor_name', nullable=False)
    op.alter_column('bookings', 'visitor_phone', nullable=False)


def downgrade() -> None:
    op.drop_column('bookings', 'special_requirements')
    op.drop_column('bookings', 'visitor_message')
    op.drop_column('bookings', 'visitor_phone')
    op.drop_column('bookings', 'visitor_name')
    op.drop_column('bookings', 'preferred_time')
