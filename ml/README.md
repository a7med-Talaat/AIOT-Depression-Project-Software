# AIoT Depression Early Risk Monitoring System - ML Pipeline

## Overview
This repository contains the Machine Learning pipeline for the AIoT Depression project. It covers data generation, preprocessing, training, explainability, inference, and evaluation.

## Structure
- `data/`: Contains synthetic dataset generator and CSVs.
- `preprocessing/`: Feature extraction and scaling.
- `training/`: XGBoost model training and hyperparameter tuning.
- `explainability/`: SHAP integration for model interpretability.
- `inference/`: Real-time prediction class for backend integration.
- `evaluation/`: Scripts to evaluate models and generate plots.
- `models/`: Saved models and scalers.

## How to run
1. Install requirements: `pip install -r requirements.txt`
2. Run the complete pipeline: `python run_pipeline.py`
