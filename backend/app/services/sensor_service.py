import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.sensor_reading import SensorReading
from app.schemas.sensor import SensorReadingCreate

async def create_sensor_reading(db: AsyncSession, reading_in: SensorReadingCreate, user_id: int, source: str = "mqtt") -> SensorReading:
    # Compute simple activity level from accel data if available
    activity_level = "UNKNOWN"
    if reading_in.accel_x is not None and reading_in.accel_y is not None and reading_in.accel_z is not None:
        magnitude = math.sqrt(reading_in.accel_x**2 + reading_in.accel_y**2 + reading_in.accel_z**2)
        if magnitude > 15:
            activity_level = "HIGH"
        elif magnitude > 11:
            activity_level = "MODERATE"
        else:
            activity_level = "LOW"
            
    reading_data = reading_in.model_dump(exclude={"device_id", "timestamp"}, exclude_unset=True)
    if reading_in.timestamp:
        reading_data["timestamp"] = reading_in.timestamp
        
    db_reading = SensorReading(
        **reading_data,
        user_id=user_id,
        activity_level=activity_level,
        source=source
    )
    
    db.add(db_reading)
    await db.commit()
    await db.refresh(db_reading)
    return db_reading

async def get_latest_sensor_reading(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(SensorReading)
        .where(SensorReading.user_id == user_id)
        .order_by(SensorReading.timestamp.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()
