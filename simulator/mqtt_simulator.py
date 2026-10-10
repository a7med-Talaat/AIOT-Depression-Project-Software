"""
AIoT Depression Early Risk Monitoring System
MQTT Simulator - Tests ESP32 data flow without real hardware

Simulates realistic sensor data from an ESP32 device and
publishes to the MQTT broker for testing the full pipeline.

Usage:
    pip install paho-mqtt
    python simulator/mqtt_simulator.py
"""

import json
import time
import math
import random
import argparse
from datetime import datetime
import paho.mqtt.client as mqtt

# ============================================================
# CONFIGURATION
# ============================================================
MQTT_BROKER   = "localhost"
MQTT_PORT     = 1883
DEVICE_ID     = "esp32_simulator_001"
SEND_INTERVAL = 5  # seconds

# ============================================================
# PHYSIOLOGICAL SIMULATION PARAMETERS
# ============================================================
class PersonProfile:
    """Simulates different depression risk profiles"""
    
    PROFILES = {
        "healthy": {
            "heart_rate": (65, 75, 5),       # (min, max, noise)
            "spo2": (97, 99, 0.5),
            "activity_level": (3, 7, 1),
            "risk_bias": 0.1
        },
        "moderate_risk": {
            "heart_rate": (55, 85, 10),
            "spo2": (94, 97, 1),
            "activity_level": (1, 4, 0.5),
            "risk_bias": 0.4
        },
        "high_risk": {
            "heart_rate": (45, 90, 15),
            "spo2": (90, 95, 2),
            "activity_level": (0, 2, 0.3),
            "risk_bias": 0.75
        }
    }
    
    def __init__(self, profile_name="healthy"):
        self.profile = self.PROFILES.get(profile_name, self.PROFILES["healthy"])
        self.time_offset = 0
    
    def get_heart_rate(self):
        """Simulate realistic heart rate with circadian rhythm"""
        base = (self.profile["heart_rate"][0] + self.profile["heart_rate"][1]) / 2
        noise = random.gauss(0, self.profile["heart_rate"][2])
        circadian = 5 * math.sin(2 * math.pi * self.time_offset / 86400)
        hr = base + noise + circadian
        return max(30, min(200, round(hr, 1)))
    
    def get_spo2(self):
        """Simulate SpO2 with small variations"""
        base = (self.profile["spo2"][0] + self.profile["spo2"][1]) / 2
        noise = random.gauss(0, self.profile["spo2"][2])
        spo2 = base + noise
        return max(85, min(100, round(spo2, 1)))
    
    def get_accelerometer(self):
        """Simulate accelerometer based on activity level"""
        activity = self.get_activity_level()
        if activity < 2:  # Sedentary
            ax = random.gauss(0.1, 0.05)
            ay = random.gauss(0.1, 0.05)
            az = random.gauss(9.8, 0.1)
        elif activity < 5:  # Light activity
            ax = random.gauss(0.5, 0.3)
            ay = random.gauss(0.5, 0.3)
            az = random.gauss(9.8, 0.5)
        else:  # Active
            ax = random.gauss(2.0, 1.0)
            ay = random.gauss(2.0, 1.0)
            az = random.gauss(9.8, 2.0)
        return round(ax, 3), round(ay, 3), round(az, 3)
    
    def get_gyroscope(self):
        """Simulate gyroscope based on motion"""
        scale = random.uniform(0.1, 2.0)
        gx = random.gauss(0, scale)
        gy = random.gauss(0, scale)
        gz = random.gauss(0, scale)
        return round(gx, 3), round(gy, 3), round(gz, 3)
    
    def get_activity_level(self):
        """Activity level 0-10"""
        base = (self.profile["activity_level"][0] + self.profile["activity_level"][1]) / 2
        noise = random.gauss(0, self.profile["activity_level"][2])
        return max(0, min(10, round(base + noise, 1)))
    
    def get_gas_sensors(self):
        """Simulate MQ5 and MQ135 values (0-4095 for 12-bit ADC)"""
        # Higher values = more gas/pollution
        mq5   = random.randint(200, 800)
        mq135 = random.randint(300, 900)
        return mq5, mq135
    
    def step(self, seconds=5):
        """Advance time"""
        self.time_offset += seconds


# ============================================================
# MQTT CALLBACKS
# ============================================================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✅ Connected to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}")
        status_topic = f"depression/sensors/{DEVICE_ID}/status"
        status_payload = json.dumps({
            "device_id": DEVICE_ID,
            "status": "online",
            "simulator": True,
            "timestamp": int(time.time())
        })
        client.publish(status_topic, status_payload, retain=True)
    else:
        print(f"❌ Connection failed with code {rc}")

def on_disconnect(client, userdata, rc):
    print(f"Disconnected from MQTT broker (rc={rc})")

def on_publish(client, userdata, mid):
    pass  # Silent on successful publish


# ============================================================
# MAIN SIMULATOR
# ============================================================
def simulate(profile_name="healthy", duration=None):
    """
    Run the MQTT sensor simulator
    
    Args:
        profile_name: 'healthy', 'moderate_risk', or 'high_risk'
        duration: seconds to run (None = infinite)
    """
    print(f"\n{'='*60}")
    print(f"  AIoT Depression Monitor - MQTT Simulator")
    print(f"{'='*60}")
    print(f"  Profile:  {profile_name.upper()}")
    print(f"  Broker:   {MQTT_BROKER}:{MQTT_PORT}")
    print(f"  Device:   {DEVICE_ID}")
    print(f"  Interval: {SEND_INTERVAL}s")
    print(f"{'='*60}\n")
    
    # Create MQTT client
    client = mqtt.Client(client_id=f"simulator_{DEVICE_ID}")
    client.on_connect    = on_connect
    client.on_disconnect = on_disconnect
    client.on_publish    = on_publish
    
    # Set will message (sent if disconnected unexpectedly)
    will_payload = json.dumps({
        "device_id": DEVICE_ID,
        "status": "offline",
        "timestamp": int(time.time())
    })
    client.will_set(
        f"depression/sensors/{DEVICE_ID}/status",
        will_payload,
        retain=True
    )
    
    # Connect
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
    except Exception as e:
        print(f"❌ Could not connect to MQTT broker: {e}")
        print(f"   Make sure the broker is running: docker-compose up mosquitto")
        return
    
    client.loop_start()
    time.sleep(1)
    
    # Create person profile
    person = PersonProfile(profile_name)
    
    topic = f"depression/sensors/{DEVICE_ID}/data"
    count = 0
    start_time = time.time()
    
    try:
        while True:
            # Generate sensor data
            ax, ay, az = person.get_accelerometer()
            gx, gy, gz = person.get_gyroscope()
            mq5, mq135 = person.get_gas_sensors()
            hr          = person.get_heart_rate()
            spo2        = person.get_spo2()
            activity    = person.get_activity_level()
            
            # Build payload
            payload = {
                "device_id":     DEVICE_ID,
                "timestamp":     int(time.time()),
                "heart_rate":    hr,
                "spo2":          spo2,
                "hr_valid":      True,
                "spo2_valid":    True,
                "temperature":   36.5 + random.gauss(0, 0.2),
                "accel_x":       ax,
                "accel_y":       ay,
                "accel_z":       az,
                "gyro_x":        gx,
                "gyro_y":        gy,
                "gyro_z":        gz,
                "activity_level": activity,
                "mq5_value":     mq5,
                "mq135_value":   mq135,
                "rssi":          random.randint(-80, -40),
                "simulator":     True,
                "profile":       profile_name
            }
            
            # Publish
            result = client.publish(topic, json.dumps(payload), qos=1)
            count += 1
            
            # Print status
            risk_emoji = "🟢" if profile_name == "healthy" else ("🟡" if profile_name == "moderate_risk" else "🔴")
            print(f"{risk_emoji} [{count:04d}] HR={hr:.0f}bpm | SpO2={spo2:.1f}% | Activity={activity:.1f} | "
                  f"MQ5={mq5} | MQ135={mq135} | ax={ax:.2f} | ay={ay:.2f} | az={az:.2f}")
            
            # Advance simulation time
            person.step(SEND_INTERVAL)
            
            # Check duration
            if duration and (time.time() - start_time) >= duration:
                print(f"\n✅ Simulation complete after {count} readings")
                break
            
            time.sleep(SEND_INTERVAL)
    
    except KeyboardInterrupt:
        print(f"\n⚡ Simulator stopped. Sent {count} readings.")
    finally:
        # Publish offline status
        offline_payload = json.dumps({
            "device_id": DEVICE_ID,
            "status": "offline",
            "timestamp": int(time.time())
        })
        client.publish(f"depression/sensors/{DEVICE_ID}/status", offline_payload, retain=True)
        time.sleep(0.5)
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AIoT Depression Monitor - MQTT Simulator")
    parser.add_argument(
        "--profile",
        choices=["healthy", "moderate_risk", "high_risk"],
        default="healthy",
        help="Simulation profile (default: healthy)"
    )
    parser.add_argument(
        "--broker",
        default="localhost",
        help="MQTT broker hostname (default: localhost)"
    )
    parser.add_argument(
        "--duration",
        type=int,
        default=None,
        help="Duration in seconds (default: infinite)"
    )
    
    args = parser.parse_args()
    MQTT_BROKER = args.broker
    
    simulate(profile_name=args.profile, duration=args.duration)
