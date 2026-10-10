# AIoT-Based Depression Early Risk Monitoring System

> **A smart IoT + AI system** that combines ESP32 sensors, machine learning, and a real-time web dashboard to monitor behavioral and physiological signals for early depression risk assessment.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HARDWARE LAYER                            │
│  ESP32 + MAX30102 (HR/SpO2) + MPU6050 (Accel/Gyro)         │
│  + MQ5 (Gas) + MQ135 (Air Quality)                          │
└────────────────────────┬────────────────────────────────────┘
                         │ MQTT (WiFi)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND LAYER                              │
│  FastAPI + PostgreSQL + Mosquitto MQTT Broker                │
│  - REST API  - WebSocket  - JWT Auth                         │
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────┐       ┌──────────────────────────────────┐
│   ML/AI LAYER    │       │       FRONTEND LAYER              │
│  XGBoost Model   │       │  Next.js 14 + React + TypeScript  │
│  SHAP Explainer  │       │  Real-time Charts + Risk Dashboard │
│  Risk Predictor  │       │  Alerts + AI Explanations         │
└──────────────────┘       └──────────────────────────────────┘
```

---

## 📁 Project Structure

```
AIOT depression Software Project/
├── 📱 esp32/                    # ESP32 Arduino Firmware
│   ├── main/main.ino            # Main firmware (all sensors)
│   └── platformio.json          # PlatformIO config
│
├── 🐍 backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── main.py              # App entry point
│   │   ├── config.py            # Settings
│   │   ├── database.py          # SQLAlchemy async DB
│   │   ├── models/              # DB models (User, Sensor, Risk, Alert)
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── api/                 # REST endpoints
│   │   ├── services/            # Business logic
│   │   ├── mqtt/                # MQTT subscriber
│   │   └── ml/                  # ML model integration
│   ├── requirements.txt
│   ├── Dockerfile
│   └── init.sql
│
├── 🤖 ml/                       # Machine Learning Pipeline
│   ├── data/                    # Synthetic data generation
│   ├── preprocessing/           # Feature engineering
│   ├── training/                # XGBoost training
│   ├── explainability/          # SHAP analysis
│   ├── inference/               # Real-time predictor
│   ├── evaluation/              # Model evaluation
│   ├── models/                  # Saved models (generated)
│   └── run_pipeline.py          # Master pipeline runner
│
├── ⚛️  frontend/                 # Next.js 14 Dashboard
│   ├── src/
│   │   ├── app/                 # Next.js pages
│   │   ├── components/          # React components
│   │   ├── lib/                 # API client, WebSocket
│   │   ├── store/               # Zustand state
│   │   ├── hooks/               # Custom hooks
│   │   └── types/               # TypeScript interfaces
│   └── Dockerfile
│
├── 🧪 simulator/                # Hardware Simulator
│   └── mqtt_simulator.py        # Test without real hardware
│
├── 🔧 mosquitto/                # MQTT Broker Config
│   └── config/mosquitto.conf
│
├── 🌐 nginx/                    # Reverse Proxy
│   └── nginx.conf
│
└── 🐳 docker-compose.yml        # Full stack deployment
```

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Start all services
docker-compose up -d

# 2. Train the ML model
cd ml
pip install -r requirements.txt
python run_pipeline.py

# 3. Access the system
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
# pgAdmin:   http://localhost:5050 (dev profile only)
```

### Option 2: Manual Setup

#### Backend
```bash
cd backend
pip install -r requirements.txt

# Set environment variables
set DATABASE_URL=postgresql+asyncpg://user:pass@localhost/aiot_db
set MQTT_BROKER=localhost
set JWT_SECRET=your-secret-key

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### ML Pipeline
```bash
cd ml
pip install -r requirements.txt

# Run full pipeline (generate data → train → evaluate)
python run_pipeline.py
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

---

## 🔧 Hardware Setup

### Components Required
| Component | Purpose | Interface |
|-----------|---------|-----------|
| ESP32 DevKit | Microcontroller | - |
| MAX30102 | Heart Rate + SpO2 | I2C (SDA=21, SCL=22) |
| MPU6050 | Accelerometer + Gyroscope | I2C (SDA=21, SCL=22) |
| MQ5 | Gas Sensor (LPG) | Analog (GPIO34) |
| MQ135 | Air Quality | Analog (GPIO35) |

### Wiring Diagram
```
ESP32           MAX30102 / MPU6050
3.3V    ───────  VCC
GND     ───────  GND
GPIO21  ───────  SDA
GPIO22  ───────  SCL

ESP32           MQ5 / MQ135
5V      ───────  VCC
GND     ───────  GND
GPIO34  ───────  MQ5 AO
GPIO35  ───────  MQ135 AO
```

### Flash ESP32 Firmware
1. Edit `esp32/main/main.ino`:
   - Set `WIFI_SSID`, `WIFI_PASSWORD`
   - Set `MQTT_BROKER` to your server IP
2. Install PlatformIO or Arduino IDE
3. Install libraries: MAX30105, Adafruit MPU6050, PubSubClient, ArduinoJson
4. Flash to ESP32

---

## 🧪 Testing Without Hardware

```bash
# Run the MQTT simulator (healthy profile)
cd simulator
pip install paho-mqtt
python mqtt_simulator.py --profile healthy

# Simulate high-risk patient
python mqtt_simulator.py --profile high_risk --duration 60

# Simulate moderate risk
python mqtt_simulator.py --profile moderate_risk
```

---

## 🌐 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login (returns JWT) |
| `/api/sensors/readings` | GET/POST | Sensor data |
| `/api/sensors/readings/latest` | GET | Latest reading |
| `/api/sensors/readings/statistics` | GET | Stats summary |
| `/api/risk/assessments` | GET | Risk history |
| `/api/risk/assessments/latest` | GET | Latest assessment |
| `/api/risk/assessments/analyze` | POST | Trigger new analysis |
| `/api/alerts` | GET | All alerts |
| `/api/alerts/{id}/read` | PUT | Mark alert read |
| `/api/dashboard/summary` | GET | Dashboard KPIs |
| `/api/dashboard/trends` | GET | Time series data |
| `/ws/live` | WS | Real-time stream |

Full interactive docs at: **http://localhost:8000/docs**

---

## 🤖 ML Model

### Features Used
| Feature | Source |
|---------|--------|
| heart_rate | MAX30102 |
| spo2 | MAX30102 |
| hrv_estimate | Computed from HR |
| motion_magnitude | MPU6050 (accel) |
| activity_level | Computed |
| mq5_value | MQ5 sensor |
| mq135_value | MQ135 sensor |

### Risk Levels
| Level | Score | Color |
|-------|-------|-------|
| LOW | 0.0 – 0.3 | 🟢 Green |
| MODERATE | 0.3 – 0.6 | 🟡 Yellow |
| HIGH | 0.6 – 0.8 | 🟠 Orange |
| CRITICAL | 0.8 – 1.0 | 🔴 Red |

### Retrain Model
```bash
cd ml
python training/train_model.py
# Model saved to: ml/models/depression_model.pkl
# Copy to backend: cp ml/models/*.pkl backend/ml_models/
```

---

## 🔐 Environment Variables

### Backend (`.env`)
```env
DATABASE_URL=postgresql+asyncpg://aiot_user:aiot_secure_password@localhost:5432/aiot_depression_db
MQTT_BROKER=localhost
MQTT_PORT=1883
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_EXPIRY_HOURS=24
CORS_ORIGINS=http://localhost:3000
ML_MODEL_PATH=./ml_models/depression_model.pkl
ML_SCALER_PATH=./ml_models/scaler.pkl
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_NAME=AIoT Depression Monitor
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| Hardware | ESP32, MAX30102, MPU6050, MQ5, MQ135 |
| Firmware | Arduino C++, PlatformIO |
| Backend | Python, FastAPI, PostgreSQL, MQTT, SQLAlchemy |
| ML | XGBoost, scikit-learn, SHAP, pandas, numpy |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Chart.js |
| DevOps | Docker, Nginx, GitHub Actions |

---

*AIoT-Based Depression Early Risk Monitoring System - v1.0*
