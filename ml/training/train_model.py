import pandas as pd
import numpy as np
import os
import json
import joblib
from sklearn.ensemble import GradientBoostingClassifier   # replaces XGBoost — no build tools needed
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score
import sys
sys.path.insert(0, 'd:/AIOT depression Software Project')
from ml.preprocessing.feature_engineering import FeatureEngineer

def train_model():
    data_path = 'd:/AIOT depression Software Project/ml/data/depression_dataset.csv'
    model_dir = 'd:/AIOT depression Software Project/ml/models/'
    os.makedirs(model_dir, exist_ok=True)
    
    df = pd.read_csv(data_path)
    X = df.drop('depression_risk', axis=1)
    y = df['depression_risk']
    
    # Feature Engineering
    fe = FeatureEngineer(scaler_path=os.path.join(model_dir, 'scaler.pkl'))
    X_processed = fe.fit_transform(X)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X_processed, y, test_size=0.2, random_state=42, stratify=y)
    
    # Train
    xgb = XGBClassifier(eval_metric='mlogloss', random_state=42)
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [3, 5],
        'learning_rate': [0.01, 0.1]
    }
    
    print("Starting GridSearchCV...")
    grid = GridSearchCV(xgb, param_grid, cv=3, scoring='f1_macro', verbose=1)
    grid.fit(X_train, y_train)
    
    best_model = grid.best_estimator_
    
    # Evaluate
    y_pred = best_model.predict(X_test)
    y_prob = best_model.predict_proba(X_test)
    
    metrics = {
        'accuracy': float(accuracy_score(y_test, y_pred)),
        'precision_macro': float(precision_score(y_test, y_pred, average='macro')),
        'recall_macro': float(recall_score(y_test, y_pred, average='macro')),
        'f1_macro': float(f1_score(y_test, y_pred, average='macro')),
        'roc_auc_ovr': float(roc_auc_score(y_test, y_prob, multi_class='ovr')),
        'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
    }
    
    print("Training Evaluation Metrics:")
    for k, v in metrics.items():
        print(f"{k}: {v}")
        
    # Save Model
    model_path = os.path.join(model_dir, 'depression_model.pkl')
    joblib.dump(best_model, model_path)
    
    report_path = os.path.join(model_dir, 'training_report.json')
    with open(report_path, 'w') as f:
        json.dump(metrics, f, indent=4)
        
    print(f"Model saved to {model_path}")
    print(f"Report saved to {report_path}")

if __name__ == '__main__':
    train_model()
