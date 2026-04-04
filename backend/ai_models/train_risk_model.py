import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

def create_synthetic_risk_data(n_samples=500):
    np.random.seed(42)
    # Generate synthetic data
    # rainfall: 0 to 150 mm
    rainfall = np.random.uniform(0, 150, n_samples)
    # temperature: 10 to 45 C
    temperature = np.random.uniform(10, 45, n_samples)
    # pollution_level: 50 to 500 AQI
    pollution = np.random.uniform(50, 500, n_samples)
    # past claims count: 0 to 5
    claims = np.random.randint(0, 6, n_samples)
    
    # Calculate a synthetic 'ground truth' risk score (0 to 1) based on features
    # High rainfall, extreme heat, very bad pollution, or high past claims increases risk
    risk = (rainfall / 150.0 * 0.4) + \
           (np.abs(temperature - 25) / 20.0 * 0.2) + \
           (pollution / 500.0 * 0.2) + \
           (claims / 5.0 * 0.2)
    
    # Add some noise
    risk += np.random.normal(0, 0.05, n_samples)
    risk = np.clip(risk, 0, 1)  # Bound between 0 and 1
    
    return pd.DataFrame({
        'rainfall': rainfall,
        'temperature': temperature,
        'pollution_level': pollution,
        'past_claims_count': claims,
        'risk_score': risk
    })

def train_and_save_model():
    print("Generating synthetic data for Risk Model...")
    df = create_synthetic_risk_data()
    
    X = df[['rainfall', 'temperature', 'pollution_level', 'past_claims_count']]
    y = df['risk_score']
    
    print("Training RandomForestRegressor...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    score = model.score(X, y)
    print(f"Model R^2 Score on training data: {score:.4f}")
    
    # Save the model
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'risk_model.joblib')
    joblib.dump(model, model_path)
    print(f"Risk model saved to {model_path}")

if __name__ == "__main__":
    train_and_save_model()
