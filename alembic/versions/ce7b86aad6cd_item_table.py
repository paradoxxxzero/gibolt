"""item_table

Revision ID: ce7b86aad6cd
Revises: f8208b71dad4
Create Date: 2018-01-03 17:24:35.978295

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ce7b86aad6cd'
down_revision = 'f8208b71dad4'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('role') as batch_op:
        batch_op.drop_column('role_checklist')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('role', sa.Column('role_checklist', sa.VARCHAR(), nullable=True))
    # ### end Alembic commands ###