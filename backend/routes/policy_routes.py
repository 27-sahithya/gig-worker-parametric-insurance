from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from database.connection import get_db
from models.policy import Policy
from models.user import User
from services.ai_service import predict_risk
from routes.deps import get_current_user

router = APIRouter()

@router.post("/buy")
def buy_policy(
    rainfall: float = 50,
    temperature: float = 30,
    pollution_level: float = 200,
    past_claims_count: int = 0,
    persona: str = "food",
    plan_type: str = "Standard",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Use user's zone for risk prediction
    risk_info = predict_risk(rainfall, temperature, pollution_level, past_claims_count, zone=current_user.zone)
    risk_score = risk_info["risk_score"]
    risk_level = risk_info["risk_level"]
    
    # 2. Base Plan Prices (Phase 3 Req)
    base_prices = {"Basic": 200, "Standard": 250, "Premium": 350}
    # 3. Risk-based Increments (Phase 3 Req)
    risk_increments = {"Low": 20, "Medium": 40, "High": 60}
    
    plan_base = base_prices.get(plan_type, 250)
    risk_addon = risk_increments.get(risk_level, 20)
    weekly_premium = plan_base + risk_addon

    # Deactivate any existing policies for user
    db.query(Policy).filter(Policy.user_id == current_user.id, Policy.active == True).update({"active": False})

    policy = Policy(
        user_id=current_user.id,
        weekly_premium=weekly_premium,
        risk_score=risk_score,
        active=True,
        persona=persona,
        plan_type=plan_type,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return {"message": "Policy activated!", "policy": {
        "id": policy.id,
        "weekly_premium": weekly_premium,
        "risk_score": round(risk_score, 4),
        "persona": persona,
        "plan_type": plan_type,
        "expires_at": policy.expires_at
    }}

@router.get("/my-policy")
def get_my_policy(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    policy = db.query(Policy).filter(Policy.user_id == current_user.id, Policy.active == True).first()
    if not policy:
        raise HTTPException(status_code=404, detail="No active policy found")
    return policy
