from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.database import engine, Base
from app.mqtt.client import mqtt_manager
from app.api import auth, sensors, risk, alerts, dashboard
# Import all models so Base.metadata knows about them
import app.models.user          # noqa
import app.models.sensor_reading  # noqa
import app.models.risk_assessment  # noqa
import app.models.alert         # noqa

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup — create all tables automatically (works great with SQLite)
    logger.info("Starting up FastAPI application...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created/verified.")

    # Start MQTT (non-fatal if broker is not available)
    mqtt_manager.start()

    yield

    # Shutdown
    logger.info("Shutting down FastAPI application...")
    mqtt_manager.stop()
    await engine.dispose()


app = FastAPI(
    title="AIoT Depression Early Risk Monitoring API",
    description="REST API for the AIoT-Based Depression Early Risk Monitoring System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend at localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router,      prefix="/api")
app.include_router(sensors.router,   prefix="/api")
app.include_router(risk.router,      prefix="/api")
app.include_router(alerts.router,    prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "AIoT Depression Risk Monitoring API is running ✅"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


