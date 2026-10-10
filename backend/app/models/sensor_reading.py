from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    heart_rate = Column(Float, nullable=True)
    spo2 = Column(Float, nullable=True)
    
    accel_x = Column(Float, nullable=True)
    accel_y = Column(Float, nullable=True)
    accel_z = Column(Float, nullable=True)
    gyro_x = Column(Float, nullable=True)
    gyro_y = Column(Float, nullable=True)
    gyro_z = Column(Float, nullable=True)
    
    mq5_value = Column(Float, nullable=True)
    mq135_value = Column(Float, nullable=True)
    
    activity_level = Column(String, nullable=True)
    source = Column(String, nullable=True)
    
    user = relationship("User")
