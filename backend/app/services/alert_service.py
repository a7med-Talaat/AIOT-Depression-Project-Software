from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.alert import Alert
from app.schemas.alert import AlertCreate

async def create_alert(db: AsyncSession, alert_in: AlertCreate) -> Alert:
    db_alert = Alert(**alert_in.model_dump())
    db.add(db_alert)
    await db.commit()
    await db.refresh(db_alert)
    return db_alert

async def get_alerts_for_user(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Alert)
        .where(Alert.user_id == user_id)
        .order_by(Alert.timestamp.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
