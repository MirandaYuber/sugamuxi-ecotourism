"""add authentication role to users

Revision ID: 0001_add_auth_role
Revises:
Create Date: 2026-11-09
"""

from collections.abc import Sequence

from alembic import op
from sqlalchemy import Boolean, Column, Integer, String, inspect, text


revision: str = '0001_add_auth_role'
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    connection = op.get_bind()
    inspector = inspect(connection)
    if 'users' not in inspector.get_table_names():
        op.create_table(
            'users',
            Column('id', Integer, primary_key=True),
            Column('email', String(320), nullable=False, unique=True),
            Column('hashed_password', String(255), nullable=False),
            Column('is_active', Boolean, nullable=False, server_default=text('true')),
            Column('role', String(20), nullable=False, server_default='visitor'),
        )
        op.create_index('ix_users_email', 'users', ['email'], unique=True)
        return

    columns = {column['name'] for column in inspector.get_columns('users')}
    if 'role' not in columns:
        op.add_column('users', Column('role', String(20), nullable=True, server_default='visitor'))
        op.execute("UPDATE users SET role = 'visitor' WHERE role IS NULL")
        op.alter_column('users', 'role', nullable=False, server_default=None)


def downgrade() -> None:
    connection = op.get_bind()
    if 'users' in inspect(connection).get_table_names():
        columns = {column['name'] for column in inspect(connection).get_columns('users')}
        if 'role' in columns:
            op.drop_column('users', 'role')
