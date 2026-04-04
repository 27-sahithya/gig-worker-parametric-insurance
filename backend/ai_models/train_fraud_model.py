import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

def create_synthetic_fraud_data(n_samples=500):
    np.random.seed(42)
    
    # claim_frequency: claims in the last 30 days (0 to 10)
    claim_freq = np.random.poisson(lam=1, size=n_samples)
    
    # location_mismatch: 0 (No), 1 (Yes)
    loc_mismatch = np.random.choice([0, 1], size=n_samples, p=[0.9, 0.1])
    
    # weather_mismatch: 0 (No), 1 (Yes)
    weather_mismatch = np.random.choice([0, 1], size=n_samples, p=[0.9, 0.1])
    
    # Add some deliberate anomalies (e.g. too many claims + mismatches)
    for i in range(20):
        claim_freq[i] = np.random.randint(5, 10)
        loc_mismatch[i] = 1
        weather_mismatch[i] = 1
        
    return pd.DataFrame({
        'claim_frequency': claim_freq,
        'location_mismatch': loc_mismatch,
        'weather_mismatch': weather_mismatch
    })

def train_and_save_model():
    print("Generating synthetic data for Fraud Detection Model...")
    df = create_synthetic_fraud_data()
    
    X = df[['claim_frequency', 'location_mismatch', 'weather_mismatch']]
    
    print("Training IsolationForest...")
    # contamination represents the proportion of outliers in the data set
    model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    model.fit(X)
    
    # Save the model
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fraud_model.joblib')
    joblib.dump(model, model_path)
    print(f"Fraud detection model saved to {model_path}")

if __name__ == "__main__":
    train_and_save_model()
