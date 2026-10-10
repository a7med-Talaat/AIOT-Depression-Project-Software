from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AlertBase(BaseModel):
    alert_type: str
    message: str
    severity: str

class AlertCreate(AlertBase):
    user_id: int
    sensor_reading_id: Optional[int] = None

class AlertResponse(AlertBase):
    id: int
    user_id: int
    timestamp: datetime
    is_read: bool
    sensor_reading_id: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)
