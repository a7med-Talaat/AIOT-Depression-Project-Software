import os
import pickle
import numpy as np
import logging

logger = logging.getLogger(__name__)

class Predictor:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), 'models', 'depression_model.pkl')
        self.model = None
        self.load_model()

    def load_model(self):
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info("Loaded ML model successfully.")
            else:
                logger.warning("ML model not found. Using mock predictor.")
        except Exception as e:
            logger.error(f"Error loading model: {e}")

    def get_risk_level(self, score: float) -> str:
        if score < 0.3:
            return "LOW"
        elif score < 0.6:
            return "MODERATE"
        elif score < 0.8:
            return "HIGH"
        else:
            return "CRITICAL"

    def predict(self, sensor_data: dict) -> dict:
        # In a real scenario, map sensor_data to a feature array
        # For this prototype, we'll return a mock prediction if model is not loaded
        if self.model is None:
            # Mock prediction based on some heuristics
            hr = sensor_data.get('heart_rate', 75)
            # High heart rate or unusual activity increases score in mock
            score = 0.2
            if hr > 100 or hr < 50:
                score += 0.3
            
            score = min(max(score, 0.0), 1.0)
            
            return {
                "risk_score": score,
                "risk_level": self.get_risk_level(score),
                "key_factors": {"heart_rate": hr, "contribution": "High"},
                "shap_values": {"heart_rate": 0.1},
                "recommendations": ["Take a short break", "Practice deep breathing"]
            }
        
        # If model is loaded, use it
        features = np.array([[
            sensor_data.get('heart_rate', 70),
            sensor_data.get('spo2', 98),
            # Add other features...
        ]])
        
        try:
            score = float(self.model.predict_proba(features)[0][1])
            return {
                "risk_score": score,
                "risk_level": self.get_risk_level(score),
                "key_factors": {},
                "shap_values": {},
                "recommendations": []
            }
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {
                "risk_score": 0.0,
                "risk_level": "LOW",
                "key_factors": {},
                "shap_values": {},
                "recommendations": []
            }

predictor = Predictor()
