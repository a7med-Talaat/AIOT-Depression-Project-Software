import shap
import joblib
import numpy as np
import matplotlib.pyplot as plt
import os
import pandas as pd

class SHAPAnalyzer:
    def __init__(self, model_path='d:/AIOT depression Software Project/ml/models/depression_model.pkl'):
        self.model = joblib.load(model_path)
        self.explainer = shap.TreeExplainer(self.model)
        
    def explain_prediction(self, features_df):
        # features_df should be a DataFrame with 1 row of preprocessed features
        shap_values = self.explainer.shap_values(features_df)
        
        # Handle multiclass SHAP output
        if isinstance(shap_values, list):
            # For XGBoost multiclass, shap_values is a list of arrays, one per class
            # Let's get the predicted class
            pred_class = self.model.predict(features_df)[0]
            sv = shap_values[pred_class][0]
        else:
            sv = shap_values[0]
            
        feature_names = features_df.columns.tolist()
        
        # Map values to features
        importance = {feature_names[i]: float(sv[i]) for i in range(len(feature_names))}
        
        # Sort by absolute impact
        sorted_importance = dict(sorted(importance.items(), key=lambda item: abs(item[1]), reverse=True))
        top_factors = list(sorted_importance.keys())[:3]
        
        return {
            'shap_values': importance,
            'feature_importance': sorted_importance,
            'top_factors': top_factors
        }

    def generate_global_explanation(self, X_test, output_dir='d:/AIOT depression Software Project/ml/evaluation/plots/'):
        os.makedirs(output_dir, exist_ok=True)
        shap_values = self.explainer.shap_values(X_test)
        
        plt.figure(figsize=(10, 8))
        shap.summary_plot(shap_values, X_test, plot_type="bar", show=False)
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'shap_global_importance.png'))
        plt.close()
