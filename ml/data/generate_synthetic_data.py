import pandas as pd
import numpy as np
import os

def generate_data(num_samples=5000, output_path=None):
    np.random.seed(42)
    
    # Base target distribution
    # 0: Low (40%), 1: Moderate (30%), 2: High (20%), 3: Critical (10%)
    depression_risk = np.random.choice([0, 1, 2, 3], size=num_samples, p=[0.4, 0.3, 0.2, 0.1])
    
    data = {'depression_risk': depression_risk}
    
    # Generate features based on risk level
    # Higher risk -> lower sleep, lower mood, lower social activity, lower hrv, etc.
    
    def generate_feature(base_mean, base_std, risk_effect, min_val, max_val):
        # risk_effect is how much the mean changes per risk level
        means = base_mean + depression_risk * risk_effect
        stds = np.full(num_samples, base_std)
        values = np.random.normal(loc=means, scale=stds)
        return np.clip(values, min_val, max_val)

    # heart_rate (bpm) - higher resting heart rate for higher risk due to stress
    data['heart_rate'] = generate_feature(70, 8, 5, 50, 120)
    
    # spo2 (%) - slightly lower for higher risk (poor breathing/sleep apnea correlation)
    data['spo2'] = generate_feature(98, 1, -1, 90, 100)
    
    # accelerometer (g) - general movement
    data['accel_x'] = np.random.normal(0, 0.5, num_samples)
    data['accel_y'] = np.random.normal(0, 0.5, num_samples)
    data['accel_z'] = np.random.normal(1.0, 0.2, num_samples) # gravity
    
    # gyroscope (deg/s)
    data['gyro_x'] = np.random.normal(0, 10, num_samples)
    data['gyro_y'] = np.random.normal(0, 10, num_samples)
    data['gyro_z'] = np.random.normal(0, 10, num_samples)
    
    # MQ sensors - indoor air quality can affect mood/health
    data['mq5_value'] = generate_feature(200, 50, 20, 0, 1023)
    data['mq135_value'] = generate_feature(300, 60, 30, 0, 1023)
    
    # activity_level (0-10) - lower for higher risk
    data['activity_level'] = generate_feature(8, 1.5, -2, 0, 10)
    
    # sleep_hours (per day) - sleep disturbances
    data['sleep_hours'] = generate_feature(8, 1.0, -1.5, 2, 12)
    
    # mood_score (1-10) - direct correlation
    data['mood_score'] = generate_feature(8, 1.0, -2, 1, 10)
    
    # social_activity (0-10) - withdrawal in depression
    data['social_activity'] = generate_feature(7, 1.5, -2, 0, 10)
    
    df = pd.DataFrame(data)
    
    # Add some missing values (5% missing randomly in sensor data)
    cols_to_corrupt = ['heart_rate', 'spo2', 'mq5_value', 'mq135_value']
    for col in cols_to_corrupt:
        mask = np.random.rand(num_samples) < 0.05
        df.loc[mask, col] = np.nan
        
    if output_path is None:
        os.makedirs(os.path.dirname('d:/AIOT depression Software Project/ml/data/'), exist_ok=True)
        output_path = 'd:/AIOT depression Software Project/ml/data/depression_dataset.csv'
        
    df.to_csv(output_path, index=False)
    print(f"Generated {num_samples} samples and saved to {output_path}")
    return df

if __name__ == '__main__':
    generate_data()
