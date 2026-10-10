from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    
    key_factors = Column(JSON, nullable=True)
    shap_values = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    
    user = relationship("User")
