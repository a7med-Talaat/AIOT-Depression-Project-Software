from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.risk_assessment import RiskAssessment
from app.schemas.risk import RiskAssessmentResponse
from app.api.auth import get_current_user
from app.models.user import User
from app.services.risk_service import trigger_risk_analysis
from app.services.sensor_service import get_latest_sensor_reading

router = APIRouter(prefix="/risk/assessments", tags=["risk"])

@router.get("", response_model=List[RiskAssessmentResponse])
async def get_assessments(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(RiskAssessment)
        .where(RiskAssessment.user_id == current_user.id)
        .order_by(RiskAssessment.timestamp.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.get("/latest", response_model=RiskAssessmentResponse)
async def get_latest_assessment(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(RiskAssessment)
        .where(RiskAssessment.user_id == current_user.id)
        .order_by(RiskAssessment.timestamp.desc())
        .limit(1)
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        return {} # or 404
    return assessment

@router.post("/analyze", response_model=RiskAssessmentResponse)
async def manual_analyze(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    latest_reading = await get_latest_sensor_reading(db, current_user.id)
    sensor_data = {}
    reading_id = None
    if latest_reading:
        sensor_data = {
            "heart_rate": latest_reading.heart_rate,
            "spo2": latest_reading.spo2,
            "accel_x": latest_reading.accel_x,
            "accel_y": latest_reading.accel_y,
            "accel_z": latest_reading.accel_z,
        }
        reading_id = latest_reading.id
        
    return await trigger_risk_analysis(db, current_user.id, sensor_data, reading_id)
