"""persist route images

Revision ID: 0004_add_route_images
Revises: 0003_extend_routes
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '0004_add_route_images'
down_revision: str | None = '0003_extend_routes'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('routes', sa.Column('images', sa.JSON(), nullable=True))
    op.execute("UPDATE routes SET images = '[]'::json WHERE images IS NULL")
    op.alter_column('routes', 'images', nullable=False)


def downgrade() -> None:
    op.drop_column('routes', 'images')
