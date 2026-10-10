import joblib
import pandas as pd
import numpy as np
import os
import sys

# Ensure ml is in path
sys.path.append('d:/AIOT depression Software Project/')
from ml.preprocessing.feature_engineering import FeatureEngineer
from ml.explainability.shap_analyzer import SHAPAnalyzer

class DepressionPredictor:
    def __init__(self, model_dir='d:/AIOT depression Software Project/ml/models/'):
        self.model_dir = model_dir
        self.model_path = os.path.join(model_dir, 'depression_model.pkl')
        self.scaler_path = os.path.join(model_dir, 'scaler.pkl')
        self.model = None
        self.fe = None
        self.shap_analyzer = None
        
    def load_models(self):
        try:
            if not os.path.exists(self.model_path) or not os.path.exists(self.scaler_path):
                print("Models not found. Please train the model first.")
                return False
            self.model = joblib.load(self.model_path)
            self.fe = FeatureEngineer(scaler_path=self.scaler_path)
            # Dummy transform to load scaler internally
            self.fe.transform(pd.DataFrame([{'heart_rate': 70}]))
            self.shap_analyzer = SHAPAnalyzer(self.model_path)
            return True
        except Exception as e:
            print(f"Error loading models: {e}")
            return False

    def predict(self, sensor_data_dict):
        if self.model is None:
            success = self.load_models()
            if not success:
                return {"error": "Models could not be loaded."}
                
        # Convert dict to DataFrame
        df = pd.DataFrame([sensor_data_dict])
        
        # Preprocess
        try:
            X_processed = self.fe.transform(df)
        except Exception as e:
            return {"error": f"Preprocessing failed: {e}"}
            
        # Predict
        probs = self.model.predict_proba(X_processed)[0]
        pred_class = int(np.argmax(probs))
        confidence = float(probs[pred_class])
        
        # Risk score calculation: expected value of risk (0 to 3) scaled to 0-1
        expected_risk = sum(i * p for i, p in enumerate(probs)) / 3.0
        
        risk_level = "LOW"
        if expected_risk >= 0.8:
            risk_level = "CRITICAL"
        elif expected_risk >= 0.6:
            risk_level = "HIGH"
        elif expected_risk >= 0.3:
            risk_level = "MODERATE"
            
        # Explain
        explanation = self.shap_analyzer.explain_prediction(X_processed)
        top_factors = explanation['top_factors']
        
        # Recommendations
        recs = self._generate_recommendations(risk_level, top_factors)
        
        return {
            "risk_score": float(expected_risk),
            "risk_level": risk_level,
            "confidence": confidence,
            "key_factors": top_factors,
            "shap_values": explanation['shap_values'],
            "recommendations": recs
        }
        
    def _generate_recommendations(self, risk_level, key_factors):
        recs = []
        if risk_level in ["CRITICAL", "HIGH"]:
            recs.append("Please consider speaking with a mental health professional immediately.")
        elif risk_level == "MODERATE":
            recs.append("Consider monitoring your symptoms and consulting a professional if they persist.")
            
        if 'sleep_hours' in key_factors:
            recs.append("Try to improve your sleep hygiene and maintain a consistent sleep schedule.")
        if 'activity_level' in key_factors or 'motion_magnitude' in key_factors:
            recs.append("Increase your daily physical activity.")
        if 'social_activity' in key_factors:
            recs.append("Reach out to friends or family members to stay socially connected.")
            
        if not recs:
            recs.append("Maintain healthy habits and continue monitoring.")
            
        return recs

if __name__ == '__main__':
    # Test predictor
    pred = DepressionPredictor()
    test_data = {
        'heart_rate': 60, 'spo2': 98, 'accel_x': 0, 'accel_y': 0, 'accel_z': 1, 
        'gyro_x': 0, 'gyro_y': 0, 'gyro_z': 0, 'mq5_value': 200, 'mq135_value': 300, 
        'activity_level': 5, 'sleep_hours': 6, 'mood_score': 5, 'social_activity': 4
    }
    print(pred.predict(test_data))
