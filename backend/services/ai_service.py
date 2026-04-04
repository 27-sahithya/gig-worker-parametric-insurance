import joblib
import pandas as pd
import os

# Define relative paths based on this file's location
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RISK_MODEL_PATH = os.path.join(BASE_DIR, 'ai_models', 'risk_model.joblib')
FRAUD_MODEL_PATH = os.path.join(BASE_DIR, 'ai_models', 'fraud_model.joblib')

class AILoader:
    _risk_model = None
    _fraud_model = None

    @classmethod
    def get_risk_model(cls):
        if cls._risk_model is None:
            if not os.path.exists(RISK_MODEL_PATH):
                raise FileNotFoundError("Risk model not trained. Run train_risk_model.py")
            cls._risk_model = joblib.load(RISK_MODEL_PATH)
        return cls._risk_model

    @classmethod
    def get_fraud_model(cls):
        if cls._fraud_model is None:
            if not os.path.exists(FRAUD_MODEL_PATH):
                raise FileNotFoundError("Fraud model not trained. Run train_fraud_model.py")
            cls._fraud_model = joblib.load(FRAUD_MODEL_PATH)
        return cls._fraud_model

ZONE_RISK_MAP = {
    "Mumbai": 1.4,      # High rain/flood risk
    "Hyderabad": 1.2,   # Moderate risk
    "Bangalore": 1.1,   # Traffic/Accident risk
    "Delhi": 1.3,       # Pollution/AQI risk
    "Pune": 1.0         # Baseline risk
}

def predict_risk(rainfall: float, temperature: float, pollution_level: float, past_claims_count: int, zone: str = "Pune") -> dict:
    model = AILoader.get_risk_model()
    input_df = pd.DataFrame([{
        'rainfall': rainfall,
        'temperature': temperature,
        'pollution_level': pollution_level,
        'past_claims_count': past_claims_count
    }])
    
    base_prediction = model.predict(input_df)[0]
    multiplier = ZONE_RISK_MAP.get(zone, 1.0)
    final_risk = min(1.0, base_prediction * multiplier)
    
    # Categorize risk for Phase 3 pricing (+20, +40, +60)
    if final_risk < 0.33:
        risk_level = "Low"
    elif final_risk < 0.66:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return {
        "risk_score": float(final_risk),
        "risk_level": risk_level
    }

def detect_fraud(claim_frequency: int, location_mismatch: int, weather_mismatch: int) -> float:
    # We use IsolationForest which outputs -1 for internal anomalies and 1 for inliers.
    # We want to return a fraud 'score' from 0 to 1, or just anomaly indicator.
    model = AILoader.get_fraud_model()
    input_df = pd.DataFrame([{
        'claim_frequency': claim_frequency,
        'location_mismatch': location_mismatch,
        'weather_mismatch': weather_mismatch
    }])
    
    # decision_function gives anomaly score (lower means more anomalous)
    # We can negate/normalize it to 0-1 for easier hackathon frontend rendering, 
    # but let's just make anomaly positive fraud score for simplicity.
    score = model.decision_function(input_df)[0]
    # Invert score: highly anomalous is negative out of bounds, normal is around >0.
    # Simplest: score * -1, shifted to a 0-1 perspective loosely.
    fraud_score = -1.0 * score 
    
    # 0 to 1 scaling loosely (heuristic for hackathon demo):
    normalized_fraud = max(0.0, min(1.0, 0.5 + (fraud_score * 5))) 
    
    return float(normalized_fraud)
