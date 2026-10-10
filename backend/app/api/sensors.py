from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.sensor_reading import SensorReading
from app.schemas.sensor import SensorReadingCreate, SensorReadingResponse
from app.api.auth import get_current_user
from app.models.user import User
from app.services.sensor_service import create_sensor_reading, get_latest_sensor_reading

router = APIRouter(prefix="/sensors/readings", tags=["sensors"])

@router.post("", response_model=SensorReadingResponse)
async def create_reading(
    reading_in: SensorReadingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await create_sensor_reading(db, reading_in, current_user.id, source="api")

@router.get("", response_model=List[SensorReadingResponse])
async def get_readings(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(SensorReading)
        .where(SensorReading.user_id == current_user.id)
        .order_by(SensorReading.timestamp.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.get("/latest", response_model=SensorReadingResponse)
async def get_latest_reading(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reading = await get_latest_sensor_reading(db, current_user.id)
    if not reading:
        return {} # Or raise 404
    return reading

@router.get("/statistics")
async def get_statistics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(
            func.avg(SensorReading.heart_rate).label('avg_hr'),
            func.avg(SensorReading.spo2).label('avg_spo2')
        )
        .where(SensorReading.user_id == current_user.id)
    )
    row = result.fetchone()
    return {
        "average_heart_rate": float(row.avg_hr) if row and row.avg_hr else 0,
        "average_spo2": float(row.avg_spo2) if row and row.avg_spo2 else 0
    }
