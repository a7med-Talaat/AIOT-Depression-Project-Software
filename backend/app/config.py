from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # SQLite by default — no PostgreSQL install needed
    # To use PostgreSQL: set DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db
    DATABASE_URL: str = "sqlite+aiosqlite:///./depression_monitor.db"
    MQTT_BROKER: str = "localhost"
    MQTT_PORT: int = 1883
    MQTT_TOPIC_PREFIX: str = "depression/sensors"
    MQTT_ENABLED: bool = True   # Set to False if no MQTT broker is running
    JWT_SECRET: str = "aiot-depression-monitor-super-secret-key-2024"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    ML_MODEL_PATH: str = "../ml/models/depression_model.pkl"
    ML_SCALER_PATH: str = "../ml/models/scaler.pkl"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
