import os
import sys

sys.path.append('d:/AIOT depression Software Project/')

from ml.data.generate_synthetic_data import generate_data
from ml.training.train_model import train_model
from ml.evaluation.evaluate_model import evaluate_model
from ml.inference.predictor import DepressionPredictor

def main():
    print("=== 1. Generating Synthetic Data ===")
    generate_data()
    
    print("\n=== 2. Training Model ===")
    train_model()
    
    print("\n=== 3. Evaluating Model ===")
    evaluate_model()
    
    print("\n=== 4. Testing Inference ===")
    predictor = DepressionPredictor()
    test_data = {
        'heart_rate': 65, 'spo2': 99, 'accel_x': 0.1, 'accel_y': -0.1, 'accel_z': 0.98, 
        'gyro_x': 5, 'gyro_y': -5, 'gyro_z': 2, 'mq5_value': 150, 'mq135_value': 250, 
        'activity_level': 8, 'sleep_hours': 8, 'mood_score': 8, 'social_activity': 9
    }
    result = predictor.predict(test_data)
    print("\nInference Result for healthy sample:")
    print(result)
    
    test_data_high_risk = {
        'heart_rate': 85, 'spo2': 94, 'accel_x': 0.0, 'accel_y': 0.0, 'accel_z': 1.0, 
        'gyro_x': 0, 'gyro_y': 0, 'gyro_z': 0, 'mq5_value': 400, 'mq135_value': 500, 
        'activity_level': 2, 'sleep_hours': 4, 'mood_score': 3, 'social_activity': 1
    }
    result_high = predictor.predict(test_data_high_risk)
    print("\nInference Result for high-risk sample:")
    print(result_high)
    
    print("\nPipeline execution completed successfully!")

if __name__ == '__main__':
    main()
