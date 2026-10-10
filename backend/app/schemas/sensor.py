from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class SensorReadingBase(BaseModel):
    heart_rate: Optional[float] = None
    spo2: Optional[float] = None
    
    accel_x: Optional[float] = None
    accel_y: Optional[float] = None
    accel_z: Optional[float] = None
    gyro_x: Optional[float] = None
    gyro_y: Optional[float] = None
    gyro_z: Optional[float] = None
    
    mq5_value: Optional[float] = None
    mq135_value: Optional[float] = None
    
    timestamp: Optional[datetime] = None

class SensorReadingCreate(SensorReadingBase):
    device_id: Optional[str] = None

class SensorReadingResponse(SensorReadingBase):
    id: int
    user_id: int
    activity_level: Optional[str] = None
    source: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
