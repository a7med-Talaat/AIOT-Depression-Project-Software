from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class RiskAssessmentResponse(BaseModel):
    id: int
    user_id: int
    timestamp: datetime
    risk_score: float
    risk_level: str
    key_factors: Optional[Dict[str, Any]] = None
    shap_values: Optional[Dict[str, Any]] = None
    recommendations: Optional[List[str]] = None
    
    model_config = ConfigDict(from_attributes=True)
