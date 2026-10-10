from sqlalchemy.ext.asyncio import AsyncSession
from app.models.risk_assessment import RiskAssessment
from app.schemas.alert import AlertCreate
from app.services.alert_service import create_alert
from app.ml.predictor import predictor

async def trigger_risk_analysis(db: AsyncSession, user_id: int, sensor_data: dict, sensor_reading_id: int = None) -> RiskAssessment:
    # 1. Call ML model
    prediction = predictor.predict(sensor_data)
    
    # 2. Store Assessment
    db_assessment = RiskAssessment(
        user_id=user_id,
        risk_score=prediction["risk_score"],
        risk_level=prediction["risk_level"],
        key_factors=prediction["key_factors"],
        shap_values=prediction["shap_values"],
        recommendations=prediction["recommendations"]
    )
    db.add(db_assessment)
    await db.commit()
    await db.refresh(db_assessment)
    
    # 3. Create Alert if risk is HIGH or CRITICAL
    if prediction["risk_level"] in ["HIGH", "CRITICAL"]:
        await create_alert(
            db=db,
            alert_in=AlertCreate(
                user_id=user_id,
                alert_type="HIGH_RISK_DETECTED",
                message=f"A {prediction['risk_level']} risk level has been detected based on recent sensor readings.",
                severity=prediction["risk_level"],
                sensor_reading_id=sensor_reading_id
            )
        )
        
    return db_assessment
