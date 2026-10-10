/*
 * AIoT-Based Depression Early Risk Monitoring System
 * ESP32 Firmware - Sensor Integration
 * 
 * Sensors:
 *   - MAX30102: Heart Rate + SpO2 (I2C: SDA=21, SCL=22)
 *   - MPU6050:  Accelerometer + Gyroscope (I2C: SDA=21, SCL=22)
 *   - MQ5:      Gas Sensor - LPG/Methane (Analog: GPIO34)
 *   - MQ135:    Air Quality Sensor (Analog: GPIO35)
 * 
 * Communication: WiFi + MQTT
 * Topic: depression/sensors/{DEVICE_ID}/data
 */

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include "spo2_algorithm.h"
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <time.h>

// ============================================================
// CONFIGURATION - EDIT THESE VALUES
// ============================================================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* MQTT_BROKER   = "192.168.1.100";  // Your server IP
const int   MQTT_PORT     = 1883;
const char* MQTT_USER     = "";
const char* MQTT_PASS     = "";
const char* DEVICE_ID     = "esp32_001";

// ============================================================
// PIN DEFINITIONS
// ============================================================
#define MQ5_PIN      34   // Analog input
#define MQ135_PIN    35   // Analog input
#define LED_BUILTIN  2    // Onboard LED for status
#define SDA_PIN      21
#define SCL_PIN      22

// ============================================================
// SENSOR OBJECTS
// ============================================================
MAX30105 particleSensor;
Adafruit_MPU6050 mpu;

// ============================================================
// NETWORK OBJECTS
// ============================================================
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// ============================================================
// MQTT TOPICS
// ============================================================
char topicData[64];
char topicStatus[64];
char topicCommand[64];

// ============================================================
// SENSOR DATA STRUCT
// ============================================================
struct SensorData {
  float heart_rate;
  float spo2;
  float accel_x, accel_y, accel_z;
  float gyro_x, gyro_y, gyro_z;
  int   mq5_value;
  int   mq135_value;
  float activity_level;
  float temperature;
  unsigned long timestamp;
  bool  hr_valid;
  bool  spo2_valid;
};

SensorData currentData;

// ============================================================
// MAX30102 VARIABLES
// ============================================================
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute;
int beatAvg;

#define MAX_BRIGHTNESS 255
uint32_t irBuffer[100];
uint32_t redBuffer[100];
int32_t bufferLength = 100;
int32_t spo2;
int8_t  validSPO2;
int32_t heartRate;
int8_t  validHeartRate;

// ============================================================
// TIMING
// ============================================================
unsigned long lastSendTime    = 0;
const long    SEND_INTERVAL   = 5000;   // Send data every 5 seconds
unsigned long lastReconnect   = 0;
const long    RECONNECT_DELAY = 5000;

// ============================================================
// FUNCTION DECLARATIONS
// ============================================================
void connectWiFi();
void connectMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void initSensors();
void readMAX30102();
void readMPU6050();
void readGasSensors();
void computeActivityLevel();
void sendSensorData();
void publishStatus(const char* status);
String buildJsonPayload();

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n====================================");
  Serial.println(" AIoT Depression Monitoring System");
  Serial.println(" ESP32 Firmware v1.0");
  Serial.println("====================================\n");
  
  pinMode(LED_BUILTIN, OUTPUT);
  
  // Initialize I2C
  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(400000);  // 400kHz I2C
  
  // Connect to WiFi
  connectWiFi();
  
  // Configure MQTT topics
  snprintf(topicData,    sizeof(topicData),    "depression/sensors/%s/data", DEVICE_ID);
  snprintf(topicStatus,  sizeof(topicStatus),  "depression/sensors/%s/status", DEVICE_ID);
  snprintf(topicCommand, sizeof(topicCommand), "depression/sensors/%s/command", DEVICE_ID);
  
  // Configure MQTT
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(1024);
  
  // Connect MQTT
  connectMQTT();
  
  // Initialize sensors
  initSensors();
  
  // Configure NTP for timestamps
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  
  Serial.println("System initialized and ready!\n");
  publishStatus("online");
}

// ============================================================
// MAIN LOOP
// ============================================================
void loop() {
  // Maintain MQTT connection
  if (!mqttClient.connected()) {
    unsigned long now = millis();
    if (now - lastReconnect > RECONNECT_DELAY) {
      lastReconnect = now;
      connectMQTT();
    }
  }
  mqttClient.loop();
  
  // Read sensor data continuously (MAX30102 needs continuous reading)
  readMAX30102();
  
  // Send data at regular intervals
  unsigned long now = millis();
  if (now - lastSendTime > SEND_INTERVAL) {
    lastSendTime = now;
    
    // Read all sensors
    readMPU6050();
    readGasSensors();
    computeActivityLevel();
    
    // Get timestamp
    time_t t = time(nullptr);
    currentData.timestamp = (unsigned long)t;
    
    // Publish data
    sendSensorData();
    
    // Blink LED to indicate data sent
    digitalWrite(LED_BUILTIN, HIGH);
    delay(100);
    digitalWrite(LED_BUILTIN, LOW);
  }
}

// ============================================================
// WIFI CONNECTION
// ============================================================
void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed! Restarting...");
    delay(3000);
    ESP.restart();
  }
}

// ============================================================
// MQTT CONNECTION
// ============================================================
void connectMQTT() {
  Serial.print("Connecting to MQTT broker: ");
  Serial.println(MQTT_BROKER);
  
  String clientId = "ESP32-" + String(DEVICE_ID);
  
  bool connected;
  if (strlen(MQTT_USER) > 0) {
    connected = mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASS,
                                    topicStatus, 0, true, "offline");
  } else {
    connected = mqttClient.connect(clientId.c_str(),
                                    nullptr, nullptr,
                                    topicStatus, 0, true, "offline");
  }
  
  if (connected) {
    Serial.println("MQTT connected!");
    mqttClient.subscribe(topicCommand);
    publishStatus("online");
  } else {
    Serial.print("MQTT connection failed, rc=");
    Serial.println(mqttClient.state());
  }
}

// ============================================================
// MQTT CALLBACK (handle incoming commands)
// ============================================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message received on [");
  Serial.print(topic);
  Serial.print("]: ");
  
  char message[length + 1];
  memcpy(message, payload, length);
  message[length] = '\0';
  Serial.println(message);
  
  // Parse command JSON
  DynamicJsonDocument cmdDoc(256);
  DeserializationError error = deserializeJson(cmdDoc, message);
  
  if (!error) {
    const char* cmd = cmdDoc["command"];
    if (cmd) {
      if (strcmp(cmd, "restart") == 0) {
        Serial.println("Restart command received. Restarting...");
        delay(1000);
        ESP.restart();
      } else if (strcmp(cmd, "status") == 0) {
        publishStatus("online");
      }
    }
  }
}

// ============================================================
// SENSOR INITIALIZATION
// ============================================================
void initSensors() {
  // Initialize MAX30102
  Serial.print("Initializing MAX30102... ");
  if (particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
    particleSensor.enableDIETEMPRDY();
    Serial.println("OK");
    currentData.hr_valid = false;
    currentData.spo2_valid = false;
  } else {
    Serial.println("FAILED - Check wiring");
    currentData.heart_rate = 0;
    currentData.spo2 = 0;
  }
  
  // Initialize MPU6050
  Serial.print("Initializing MPU6050... ");
  if (mpu.begin()) {
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    Serial.println("OK");
  } else {
    Serial.println("FAILED - Check wiring");
  }
  
  // Gas sensors - analog, no initialization needed
  Serial.println("Gas sensors (MQ5, MQ135): Ready (analog)");
  
  // Warm up gas sensors
  Serial.println("Warming up gas sensors (2 seconds)...");
  delay(2000);
  
  Serial.println("All sensors initialized!");
}

// ============================================================
// READ MAX30102 (Heart Rate + SpO2)
// ============================================================
void readMAX30102() {
  // Collect samples for SpO2 calculation
  // First collect 100 samples for SpO2
  for (byte i = 0; i < bufferLength; i++) {
    while (particleSensor.available() == false)
      particleSensor.check();
    
    redBuffer[i] = particleSensor.getRed();
    irBuffer[i]  = particleSensor.getIR();
    particleSensor.nextSample();
  }
  
  // Calculate SpO2
  maxim_heart_rate_and_oxygen_saturation(
    irBuffer, bufferLength, redBuffer,
    &spo2, &validSPO2, &heartRate, &validHeartRate
  );
  
  if (validHeartRate && heartRate > 20 && heartRate < 220) {
    currentData.heart_rate = (float)heartRate;
    currentData.hr_valid = true;
  } else {
    // Try beat detection fallback
    long irValue = particleSensor.getIR();
    if (checkForBeat(irValue)) {
      long delta = millis() - lastBeat;
      lastBeat = millis();
      beatsPerMinute = 60 / (delta / 1000.0);
      
      if (beatsPerMinute < 255 && beatsPerMinute > 20) {
        rates[rateSpot++] = (byte)beatsPerMinute;
        rateSpot %= RATE_SIZE;
        
        beatAvg = 0;
        for (byte x = 0; x < RATE_SIZE; x++) beatAvg += rates[x];
        beatAvg /= RATE_SIZE;
        
        currentData.heart_rate = beatAvg;
        currentData.hr_valid = (beatAvg > 20);
      }
    }
  }
  
  if (validSPO2 && spo2 > 0 && spo2 <= 100) {
    currentData.spo2 = (float)spo2;
    currentData.spo2_valid = true;
  }
  
  // Read temperature from MAX30102
  currentData.temperature = particleSensor.readTemperature();
}

// ============================================================
// READ MPU6050 (Accelerometer + Gyroscope)
// ============================================================
void readMPU6050() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  
  currentData.accel_x = a.acceleration.x;
  currentData.accel_y = a.acceleration.y;
  currentData.accel_z = a.acceleration.z;
  currentData.gyro_x  = g.gyro.x;
  currentData.gyro_y  = g.gyro.y;
  currentData.gyro_z  = g.gyro.z;
}

// ============================================================
// READ GAS SENSORS (MQ5 + MQ135)
// ============================================================
void readGasSensors() {
  // Average 10 readings for stability
  long mq5Sum = 0, mq135Sum = 0;
  for (int i = 0; i < 10; i++) {
    mq5Sum   += analogRead(MQ5_PIN);
    mq135Sum += analogRead(MQ135_PIN);
    delay(10);
  }
  currentData.mq5_value   = (int)(mq5Sum / 10);
  currentData.mq135_value = (int)(mq135Sum / 10);
}

// ============================================================
// COMPUTE ACTIVITY LEVEL (0-10 from accelerometer)
// ============================================================
void computeActivityLevel() {
  float magnitude = sqrt(
    currentData.accel_x * currentData.accel_x +
    currentData.accel_y * currentData.accel_y +
    currentData.accel_z * currentData.accel_z
  );
  
  // Subtract gravity (approx 9.8 m/s²) to get motion magnitude
  float motion = abs(magnitude - 9.8);
  
  // Scale to 0-10
  float activity = constrain(motion * 2.0, 0.0, 10.0);
  currentData.activity_level = activity;
}

// ============================================================
// SEND SENSOR DATA VIA MQTT
// ============================================================
void sendSensorData() {
  if (!mqttClient.connected()) {
    Serial.println("MQTT not connected, skipping data send");
    return;
  }
  
  String payload = buildJsonPayload();
  
  Serial.print("Publishing to [");
  Serial.print(topicData);
  Serial.println("]:");
  Serial.println(payload);
  
  bool success = mqttClient.publish(topicData, payload.c_str(), true);
  if (success) {
    Serial.println("Data published successfully!");
  } else {
    Serial.println("Publish failed!");
  }
}

// ============================================================
// BUILD JSON PAYLOAD
// ============================================================
String buildJsonPayload() {
  DynamicJsonDocument doc(512);
  
  doc["device_id"]     = DEVICE_ID;
  doc["timestamp"]     = currentData.timestamp;
  
  // Heart Rate & SpO2
  doc["heart_rate"]    = currentData.hr_valid ? currentData.heart_rate : 0;
  doc["spo2"]          = currentData.spo2_valid ? currentData.spo2 : 0;
  doc["hr_valid"]      = currentData.hr_valid;
  doc["spo2_valid"]    = currentData.spo2_valid;
  doc["temperature"]   = currentData.temperature;
  
  // Motion Data
  doc["accel_x"]       = round(currentData.accel_x * 100.0) / 100.0;
  doc["accel_y"]       = round(currentData.accel_y * 100.0) / 100.0;
  doc["accel_z"]       = round(currentData.accel_z * 100.0) / 100.0;
  doc["gyro_x"]        = round(currentData.gyro_x * 100.0) / 100.0;
  doc["gyro_y"]        = round(currentData.gyro_y * 100.0) / 100.0;
  doc["gyro_z"]        = round(currentData.gyro_z * 100.0) / 100.0;
  doc["activity_level"] = round(currentData.activity_level * 10.0) / 10.0;
  
  // Gas Sensors
  doc["mq5_value"]     = currentData.mq5_value;
  doc["mq135_value"]   = currentData.mq135_value;
  
  // WiFi signal strength
  doc["rssi"]          = WiFi.RSSI();
  
  String output;
  serializeJson(doc, output);
  return output;
}

// ============================================================
// PUBLISH DEVICE STATUS
// ============================================================
void publishStatus(const char* status) {
  DynamicJsonDocument doc(256);
  doc["device_id"] = DEVICE_ID;
  doc["status"]    = status;
  doc["ip"]        = WiFi.localIP().toString();
  doc["rssi"]      = WiFi.RSSI();
  doc["uptime"]    = millis() / 1000;
  
  String payload;
  serializeJson(doc, payload);
  
  mqttClient.publish(topicStatus, payload.c_str(), true);
}
