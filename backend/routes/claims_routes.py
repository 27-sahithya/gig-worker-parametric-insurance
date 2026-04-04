from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import uuid

from database.connection import get_db
from models.claim import Claim
from models.policy import Policy
from models.user import User
from services.ai_service import detect_fraud
from services.weather_service import get_weather_data
from routes.deps import get_current_user, get_current_admin

router = APIRouter()

@router.post("/auto-trigger")
async def auto_trigger_claim(
    city: str = "Mumbai",
    event_type: str = None,
    simulate_gps_spoof: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Automatically trigger a claim.
    Supports real-time weather API or simulated mock events via `event_type`.
    """
    # 1. Check active policy
    policy = db.query(Policy).filter(Policy.user_id == current_user.id, Policy.active == True).first()
    if not policy:
        raise HTTPException(status_code=400, detail="No active policy. Please buy a policy first.")

    # 2. Setup trigger description and data
    if event_type:
        event_map = {
            "heavy_rain": {"weather": "Rain", "description": "severe heavy rain and waterlogging"},
            "extreme_heat": {"weather": "Clear", "description": "extreme heatwave (45°C)"},
            "curfew": {"weather": "Social", "description": "unplanned local curfew or strike"},
            "aqi": {"weather": "Haze", "description": "severe AQI emergency (Hazardous)"},
            "platform_outage": {"weather": "System", "description": "major platform/app technical outage"}
        }
        mock_event = event_map.get(event_type, event_map["heavy_rain"])
        weather = {
            "city": current_user.zone or city,
            "weather": mock_event["weather"],
            "description": mock_event["description"],
            "is_disruption": True
        }
    else:
        # Fetch actual real-time/mock weather data
        weather = await get_weather_data(current_user.zone or city)
        if not weather.get("is_disruption"):
            return {
                "triggered": False,
                "message": "No income disruption detected in your area right now.",
                "weather": weather
            }

    # 3. Run fraud check (simulate fresh claim)
    fraud_score = detect_fraud(
        claim_frequency=1,
        location_mismatch=1 if simulate_gps_spoof else 0,
        weather_mismatch=0
    )

    # 4. Phase 3 Payout Logic: (avg_income / 30) * multiplier
    plan_multipliers = {"Basic": 1.0, "Standard": 2.0, "Premium": 5.0}
    multiplier = plan_multipliers.get(policy.plan_type, 1.0)
    
    daily_income = current_user.avg_income / 30
    payout = round(daily_income * multiplier, 2)

    # 5. Financial Transaction Simulation (Admin pool -> User balance)
    admin = db.query(User).filter(User.role == "admin").first()
    status = "fraudulent" if (fraud_score > 0.75 or simulate_gps_spoof) else "approved"

    if status == "approved":
        if admin:
            admin.balance -= payout
        current_user.balance += payout

    trigger_desc = f"{weather['weather']}: {weather['description']} in {weather['city']}"

    claim = Claim(
        user_id=current_user.id,
        policy_id=policy.id,
        amount=round(payout, 2) if status == "approved" else 0.0,
        trigger=trigger_desc,
        status=status,
        fraud_score=fraud_score,
        zone=city,
        is_auto_triggered=True
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)

    response_data = {
        "triggered": True,
        "status": status,
        "claim_id": f"CLM-{claim.id:04d}",
        "amount": claim.amount,
        "trigger": trigger_desc,
        "fraud_score": round(fraud_score, 4),
        "weather": weather
    }

    if status == "approved":
        response_data["receipt"] = {
            "gateway": "Razorpay Sandbox",
            "txn_id": f"pay_{uuid.uuid4().hex[:14]}",
            "timestamp": claim.created_at.isoformat() if claim.created_at else "Now",
            "method": "UPI Auto-Transfer"
        }

    return response_data

@router.get("/my-claims")
def get_my_claims(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    claims = db.query(Claim).filter(Claim.user_id == current_user.id).order_by(Claim.created_at.desc()).all()
    return claims

@router.get("/all", dependencies=[Depends(get_current_admin)])
def get_all_claims(db: Session = Depends(get_db)):
    return db.query(Claim).order_by(Claim.created_at.desc()).all()

@router.get("/weather-check")
async def check_weather(city: str = "Mumbai"):
    """Public endpoint to check current weather disruption status for demo."""
    data = await get_weather_data(city)
    return data
