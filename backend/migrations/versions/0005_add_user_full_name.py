"""persist user full names

Revision ID: 0005_add_user_full_name
Revises: 0004_add_route_images
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '0005_add_user_full_name'
down_revision: str | None = '0004_add_route_images'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('users', sa.Column('full_name', sa.String(length=160), nullable=True))
    op.execute("UPDATE users SET full_name = split_part(email, '@', 1) WHERE full_name IS NULL")
    op.alter_column('users', 'full_name', nullable=False)


def downgrade() -> None:
    op.drop_column('users', 'full_name')
