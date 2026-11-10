"""store route catalog fields

Revision ID: 0003_extend_routes
Revises: 0002_extend_bookings
Create Date: 2026-11-09
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '0003_extend_routes'
down_revision: str | None = '0002_extend_bookings'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('routes', sa.Column('municipality', sa.String(length=80), nullable=True))
    op.add_column('routes', sa.Column('route_points', sa.JSON(), nullable=True))
    op.execute("UPDATE routes SET municipality = 'Sogamoso' WHERE municipality IS NULL")
    op.execute("UPDATE routes SET route_points = '[]'::json WHERE route_points IS NULL")
    op.alter_column('routes', 'municipality', nullable=False)
    op.alter_column('routes', 'route_points', nullable=False)


def downgrade() -> None:
    op.drop_column('routes', 'route_points')
    op.drop_column('routes', 'municipality')
