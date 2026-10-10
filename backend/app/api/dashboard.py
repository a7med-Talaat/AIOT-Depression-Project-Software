from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.sensor_reading import SensorReading
from app.models.risk_assessment import RiskAssessment

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
async def get_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get latest risk
    risk_res = await db.execute(
        select(RiskAssessment)
        .where(RiskAssessment.user_id == current_user.id)
        .order_by(RiskAssessment.timestamp.desc())
        .limit(1)
    )
    latest_risk = risk_res.scalar_one_or_none()
    
    # Get average HR today
    today = datetime.now(timezone.utc) - timedelta(days=1)
    hr_res = await db.execute(
        select(func.avg(SensorReading.heart_rate))
        .where(SensorReading.user_id == current_user.id, SensorReading.timestamp >= today)
    )
    avg_hr = hr_res.scalar_one_or_none()
    
    return {
        "latest_risk_level": latest_risk.risk_level if latest_risk else "UNKNOWN",
        "latest_risk_score": latest_risk.risk_score if latest_risk else 0.0,
        "avg_heart_rate_24h": float(avg_hr) if avg_hr else 0.0
    }

@router.get("/trends")
async def get_trends(
    days: int = 7,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(RiskAssessment)
        .where(RiskAssessment.user_id == current_user.id, RiskAssessment.timestamp >= since)
        .order_by(RiskAssessment.timestamp.asc())
    )
    assessments = result.scalars().all()
    
    return {
        "dates": [a.timestamp.isoformat() for a in assessments],
        "scores": [a.risk_score for a in assessments]
    }
