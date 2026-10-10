import json
import logging
import asyncio
from paho.mqtt import client as mqtt_client
from app.config import settings
from app.database import AsyncSessionLocal
from app.schemas.sensor import SensorReadingCreate
from app.services.sensor_service import create_sensor_reading
from app.services.risk_service import trigger_risk_analysis

logger = logging.getLogger(__name__)

class MQTTManager:
    def __init__(self):
        self.client = mqtt_client.Client(mqtt_client.CallbackAPIVersion.VERSION2, "fastapi_backend")
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.connected = False

    def on_connect(self, client, userdata, flags, reason_code, properties):
        if reason_code == 0:
            logger.info("Connected to MQTT Broker!")
            self.connected = True
            topic = f"{settings.MQTT_TOPIC_PREFIX}/+/data"
            client.subscribe(topic)
            logger.info(f"Subscribed to {topic}")
        else:
            logger.error(f"Failed to connect to MQTT, return code {reason_code}")

    def on_message(self, client, userdata, msg):
        topic = msg.topic
        payload = msg.payload.decode()
        logger.debug(f"Received `{payload}` from `{topic}` topic")

        try:
            # Extract user_id/device_id from topic: depression/sensors/{device_id}/data
            parts = topic.split('/')
            if len(parts) >= 3:
                device_id = parts[2]
                data = json.loads(payload)

                # Use asyncio to run async DB operations from sync MQTT callback
                try:
                    loop = asyncio.get_running_loop()
                    loop.create_task(self.process_sensor_data(device_id, data))
                except RuntimeError:
                    # No running loop — skip (shouldn't happen in normal FastAPI context)
                    logger.warning("No running event loop for MQTT message processing")

        except Exception as e:
            logger.error(f"Error processing MQTT message: {e}")

    async def process_sensor_data(self, device_id: str, data: dict):
        """Store incoming MQTT sensor data and trigger risk analysis."""
        # Use device_id=1 as default user for MQTT devices
        # In production, map device_id to a real user via a device registry table
        user_id = 1
        async with AsyncSessionLocal() as db:
            try:
                reading_in = SensorReadingCreate(**{
                    k: data.get(k) for k in SensorReadingCreate.model_fields
                    if k in data
                })
                db_reading = await create_sensor_reading(db, reading_in, user_id, source="mqtt")
                await trigger_risk_analysis(db, user_id, data, db_reading.id)
            except Exception as e:
                logger.error(f"Error saving MQTT sensor data to DB: {e}")

    def start(self):
        if not settings.MQTT_ENABLED:
            logger.info("MQTT is disabled (MQTT_ENABLED=False). Skipping broker connection.")
            return
        try:
            self.client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, keepalive=60)
            self.client.loop_start()
            logger.info(f"MQTT client started, connecting to {settings.MQTT_BROKER}:{settings.MQTT_PORT}")
        except Exception as e:
            logger.warning(f"Could not connect to MQTT broker at {settings.MQTT_BROKER}:{settings.MQTT_PORT}: {e}")
            logger.warning("Backend will run without MQTT. Use the REST API to submit sensor data.")

    def stop(self):
        if self.connected:
            self.client.loop_stop()
            self.client.disconnect()

mqtt_manager = MQTTManager()

