from pydantic import BaseModel

class RiskPredictionRequest(BaseModel):
    rainfall: float
    temperature: float
    pollution_level: float
    past_claims_count: int
    zone: str = "Pune"

class RiskPredictionResponse(BaseModel):
    risk_score: float
    # We could also include the calculated weekly premium based on risk score
    weekly_premium: float

class FraudDetectionRequest(BaseModel):
    claim_frequency: int
    location_mismatch: int # 0 or 1
    weather_mismatch: int # 0 or 1

class FraudDetectionResponse(BaseModel):
    fraud_score: float
    is_fraudulent: bool
