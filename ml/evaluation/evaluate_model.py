import pandas as pd
import joblib
import os
import sys
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, roc_curve, auc
from sklearn.preprocessing import label_binarize

sys.path.append('d:/AIOT depression Software Project/')
from ml.preprocessing.feature_engineering import FeatureEngineer
from ml.explainability.shap_analyzer import SHAPAnalyzer

def evaluate_model():
    data_path = 'd:/AIOT depression Software Project/ml/data/depression_dataset.csv'
    model_dir = 'd:/AIOT depression Software Project/ml/models/'
    plots_dir = 'd:/AIOT depression Software Project/ml/evaluation/plots/'
    os.makedirs(plots_dir, exist_ok=True)
    
    df = pd.read_csv(data_path)
    # Take the last 1000 for evaluation
    df_eval = df.tail(1000)
    X = df_eval.drop('depression_risk', axis=1)
    y = df_eval['depression_risk']
    
    fe = FeatureEngineer(scaler_path=os.path.join(model_dir, 'scaler.pkl'))
    X_processed = fe.transform(X)
    
    model = joblib.load(os.path.join(model_dir, 'depression_model.pkl'))
    
    y_pred = model.predict(X_processed)
    y_prob = model.predict_proba(X_processed)
    
    # Confusion Matrix
    cm = confusion_matrix(y, y_pred)
    plt.figure(figsize=(8,6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.savefig(os.path.join(plots_dir, 'confusion_matrix.png'))
    plt.close()
    
    # ROC Curve
    y_bin = label_binarize(y, classes=[0, 1, 2, 3])
    n_classes = y_bin.shape[1]
    
    plt.figure(figsize=(8,6))
    for i in range(n_classes):
        fpr, tpr, _ = roc_curve(y_bin[:, i], y_prob[:, i])
        roc_auc = auc(fpr, tpr)
        plt.plot(fpr, tpr, lw=2, label=f'Class {i} (area = {roc_auc:.2f})')
        
    plt.plot([0, 1], [0, 1], 'k--', lw=2)
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve per Class')
    plt.legend(loc="lower right")
    plt.savefig(os.path.join(plots_dir, 'roc_curve.png'))
    plt.close()
    
    # Feature Importance (Global SHAP)
    shap_analyzer = SHAPAnalyzer(os.path.join(model_dir, 'depression_model.pkl'))
    shap_analyzer.generate_global_explanation(X_processed, output_dir=plots_dir)
    
    print("Evaluation completed. Plots saved.")

if __name__ == '__main__':
    evaluate_model()
