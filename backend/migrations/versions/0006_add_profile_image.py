"""persist user profile images

Revision ID: 0006_add_profile_image
Revises: 0005_add_user_full_name
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '0006_add_profile_image'
down_revision: str | None = '0005_add_user_full_name'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('users', sa.Column('profile_image_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'profile_image_url')
