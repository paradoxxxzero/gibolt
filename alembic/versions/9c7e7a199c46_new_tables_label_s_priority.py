"""new tables Label(s) & Priority

Revision ID: 9c7e7a199c46
Revises: 7980badc5c6f
Create Date: 2018-01-24 14:52:36.363866

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9c7e7a199c46'
down_revision = '7980badc5c6f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    label_type = op.create_table(
        'label_type',
        sa.Column('label_type_id', sa.Integer(), nullable=False),
        sa.Column('label_type_name', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('label_type_id')
    )
    label = op.create_table(
        'label',
        sa.Column('label_id', sa.Integer(), nullable=False),
        sa.Column('label_type_id', sa.Integer(), nullable=False),
        sa.Column('label_name', sa.String(), nullable=True),
        sa.Column('label_color', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ['label_type_id'],
            ['label_type.label_type_id'],
            name='fk_labeltype_label'
        ),
        sa.PrimaryKeyConstraint('label_id')
    )
    priority = op.create_table(
        'priority',
        sa.Column('priority_id', sa.Integer(), nullable=False),
        sa.Column('label_id', sa.Integer(), nullable=False),
        sa.Column('value', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ['label_id'], ['label.label_id'], name='fk_priority_label'
        ),
        sa.PrimaryKeyConstraint('priority_id')
    )
    with op.batch_alter_table('circle', schema=None) as batch_op:
        batch_op.add_column(sa.Column('label_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            'fk_circle_label', 'label', ['label_id'], ['label_id']
        )

    op.bulk_insert(
        label_type,
        [
            {
                'label_type_id': 1,
                'label_type_name': 'ack',
            },
            {
                'label_type_id': 2,
                'label_type_name': 'priority',
            },
            {
                'label_type_id': 3,
                'label_type_name': 'qualifier',
            },
            {
                'label_type_id': 4,
                'label_type_name': 'circle',
            }
        ]
    )
    op.bulk_insert(
        label,
        [
            {
                'label_id': 1,
                'label_type_id': 1,
                'label_name': 'En cours',
                'label_color': '#2980b9'
            },
            {
                'label_id': 2,
                'label_type_id': 1,
                'label_name': 'A venir',
                'label_color': '#9FC5E8'
            },
            {
                'label_id': 3,
                'label_type_id': 1,
                'label_name': 'Vu',
                'label_color': '#b7b7b7b'
            },
            {
                'label_id': 4,
                'label_type_id': 2,
                'label_name': 'Urgent',
                'label_color': '#e73c7d'
            },
            {
                'label_id': 5,
                'label_type_id': 2,
                'label_name': 'Bientôt',
                'label_color': '#f1c40f'
            },
            {
                'label_id': 6,
                'label_type_id': 2,
                'label_name': 'Plus tard',
                'label_color': '#27ae60'
            },
            {
                'label_id': 7,
                'label_type_id': 3,
                'label_name': 'Triage',
                'label_color': '#000000'
            },
            {
                'label_id': 8,
                'label_type_id': 3,
                'label_name': 'Bug',
                'label_color': '#9a62d3'
            },
            {
                'label_id': 9,
                'label_type_id': 4,
                'label_name': '1er cercle',
                'label_color': '#1a1b31'
            },
            {
                'label_id': 10,
                'label_type_id': 4,
                'label_name': 'Dévops',
                'label_color': '#6e6186'
            },
            {
                'label_id': 11,
                'label_type_id': 4,
                'label_name': 'Marco',
                'label_color': '#f59c30'
            },
            {
                'label_id': 12,
                'label_type_id': 4,
                'label_name': 'Design',
                'label_color': '#86ad50'
            },
        ]
    )
    op.bulk_insert(
        priority,
        [
            {
                'priority_id': 1,
                'label_id': 4,
                'value': 0
            },
            {
                'priority_id': 2,
                'label_id': 5,
                'value': 1
            },
            {
                'priority_id': 3,
                'label_id': 6,
                'value': 2
            }
        ]
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('circle', schema=None) as batch_op:
        batch_op.drop_constraint('fk_circle_label', type_='foreignkey')
        batch_op.drop_column('label_id')

    op.drop_table('priority')
    op.drop_table('label')
    op.drop_table('label_type')
    # ### end Alembic commands ###
