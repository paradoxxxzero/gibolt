"""Report - fixing data

Revision ID: 16ab54432e2a
Revises: 691f13d1880e
Create Date: 2018-03-15 11:34:24.552725

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '16ab54432e2a'
down_revision = '691f13d1880e'
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()

    reports = sa.Table(
        'report',
        sa.MetaData(),
        sa.Column('report_id', sa.Integer()),
        sa.Column('report_type', sa.String()),
    )

    report_checklist = sa.Table(
        'report_checklist',
        sa.MetaData(),
        sa.Column('report_id', sa.Integer()),
    )

    report_indicator = sa.Table(
        'report_indicator',
        sa.MetaData(),
        sa.Column('report_id', sa.Integer()),
    )

    for report in connection.execute(reports.select().where(
            reports.c.report_type == 'Gouvernance'
        )):
        op.execute(
            report_checklist.delete().\
                where(report_checklist.c.report_id == report.report_id)
        )
        op.execute(
            report_indicator.delete().\
                where(report_indicator.c.report_id == report.report_id)
        )


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###
