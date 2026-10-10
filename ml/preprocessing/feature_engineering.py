import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
import joblib
import os

class FeatureEngineer:
    def __init__(self, scaler_path='d:/AIOT depression Software Project/ml/models/scaler.pkl'):
        self.scaler = StandardScaler()
        self.imputer = SimpleImputer(strategy='median')
        self.scaler_path = scaler_path
        self.feature_names = None
        
    def _compute_derived_features(self, df):
        df_new = df.copy()
        
        # Compute HRV approximation from heart_rate (lower HR generally correlates with higher HRV in healthy individuals, simplify here)
        # We assume hrv_approx = max(0, 120 - heart_rate) + noise
        if 'heart_rate' in df_new.columns:
            df_new['hrv_approx'] = np.maximum(0, 120 - df_new['heart_rate'] + np.random.normal(0, 5, len(df_new)))
            
        # Compute motion magnitude
        if all(c in df_new.columns for c in ['accel_x', 'accel_y', 'accel_z']):
            df_new['motion_magnitude'] = np.sqrt(df_new['accel_x']**2 + df_new['accel_y']**2 + df_new['accel_z']**2)
            
        # Drop original raw high-freq axes if desired, but we can keep them
        return df_new

    def fit_transform(self, X):
        X_derived = self._compute_derived_features(X)
        self.feature_names = X_derived.columns.tolist()
        
        # Impute
        X_imputed = self.imputer.fit_transform(X_derived)
        
        # Scale
        X_scaled = self.scaler.fit_transform(X_imputed)
        
        # Save preprocessors
        os.makedirs(os.path.dirname(self.scaler_path), exist_ok=True)
        joblib.dump({'scaler': self.scaler, 'imputer': self.imputer, 'features': self.feature_names}, self.scaler_path)
        
        return pd.DataFrame(X_scaled, columns=self.feature_names)

    def transform(self, X):
        X_derived = self._compute_derived_features(X)
        
        # Ensure columns match
        if self.feature_names is None:
            preprocessors = joblib.load(self.scaler_path)
            self.scaler = preprocessors['scaler']
            self.imputer = preprocessors['imputer']
            self.feature_names = preprocessors['features']
            
        # Reindex to handle missing/extra columns
        X_derived = X_derived.reindex(columns=self.feature_names, fill_value=0)
        
        X_imputed = self.imputer.transform(X_derived)
        X_scaled = self.scaler.transform(X_imputed)
        
        return pd.DataFrame(X_scaled, columns=self.feature_names)
