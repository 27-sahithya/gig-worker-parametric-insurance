from fastapi import APIRouter, HTTPException
from schemas.ai_schema import (
    RiskPredictionRequest, 
    RiskPredictionResponse, 
    FraudDetectionRequest, 
    FraudDetectionResponse
)
from services.ai_service import predict_risk, detect_fraud

router = APIRouter()

@router.post("/predict-risk", response_model=RiskPredictionResponse)
def get_risk_prediction(request: RiskPredictionRequest):
    try:
        risk_score = predict_risk(
            request.rainfall, 
            request.temperature, 
            request.pollution_level, 
            request.past_claims_count,
            request.zone
        )
        # Calculate dynamic premium: base premium + factor based on risk
        # Hackathon pseudo-logic: Base is 20, max extra is 50.
        weekly_premium = round(20 + (risk_score * 50), 2)
        
        return RiskPredictionResponse(
            risk_score=round(risk_score, 4),
            weekly_premium=weekly_premium
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-fraud", response_model=FraudDetectionResponse)
def get_fraud_detection(request: FraudDetectionRequest):
    try:
        fraud_score = detect_fraud(
            request.claim_frequency,
            request.location_mismatch,
            request.weather_mismatch
        )
        
        # Simple threshold for fraud
        is_fraudulent = True if fraud_score > 0.75 else False
        
        return FraudDetectionResponse(
            fraud_score=round(fraud_score, 4),
            is_fraudulent=is_fraudulent
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
