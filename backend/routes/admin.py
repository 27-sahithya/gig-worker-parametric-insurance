from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.connection import get_db
from models.user import User
from models.policy import Policy
from models.claim import Claim
from models.payment import Payment
from schemas.user_schema import UserResponse
from routes.deps import get_current_admin
from services.email_service import send_approval_email, send_rejection_email
from sqlalchemy import func

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
def get_users(status: str = None, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    query = db.query(User).filter(User.role == "user")
    if status:
        query = query.filter(User.status == status)
    return query.all()

@router.post("/approve/{user_id}", response_model=UserResponse)
def approve_user(user_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.status = "approved"
    db.commit()
    db.refresh(user)
    
    # Send email notification
    send_approval_email(user.email, user.name)
    
    return user

@router.post("/reject/{user_id}", response_model=UserResponse)
def reject_user(user_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.status = "rejected"
    db.commit()
    db.refresh(user)

    # Send rejection notification email
    try:
        send_rejection_email(user.email, user.name)
    except Exception as e:
        print(f"Rejection email failed: {e}")

    return user

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    # In a real app we'd verify admin role here
    total_workers = db.query(User).filter(User.role == "user").count()
    pending_approvals = db.query(User).filter(User.status == "pending").count()
    active_policies = db.query(Policy).filter(Policy.active == True).count()
    fraud_alerts = db.query(Claim).filter(Claim.status == "fraudulent").count()
    
    # Total Payout calculation (func.sum)
    total_payout = db.query(func.sum(Claim.amount)).filter(Claim.status == "approved").scalar() or 0
    
    # Claims this week 
    claims_this_week = db.query(Claim).count() # Simplified for hackathon

    admin = db.query(User).filter(User.role == "admin").first()
    pool_balance = admin.balance if admin else 0.0
    
    loss_ratio = 0.0
    if (pool_balance + total_payout) > 0:
        loss_ratio = (total_payout / (pool_balance + total_payout)) * 100

    forecast_alerts = [
        "75% probability of Heavy Rain in Mumbai next week - Anticipating ₹2.5L in payouts.",
        "High AQI forecast in Delhi zone. Expected respiratory claim spike by 20%."
    ]
    
    return {
        "total_workers": total_workers,
        "pending_approvals": pending_approvals,
        "active_policies": active_policies,
        "fraud_alerts": fraud_alerts,
        "total_payout": round(total_payout, 2),
        "claims_this_week": claims_this_week,
        "pool_balance": round(pool_balance, 2),
        "loss_ratio": round(loss_ratio, 2),
        "forecast_alerts": forecast_alerts
    }

@router.get("/paid-users")
def get_paid_users(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """
    List all users who have made a payment, including the payment details.
    """
    results = db.query(Payment, User).join(User, Payment.user_id == User.id).order_by(Payment.paid_at.desc()).all()
    
    paid_users = []
    for payment, user in results:
        paid_users.append({
            "payment_id": payment.id,
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "amount": payment.amount,
            "method": payment.payment_method,
            "paid_at": payment.paid_at.isoformat(),
            "week_range": f"{payment.week_start.strftime('%d %b')} - {payment.week_end.strftime('%d %b')}",
            "user_image": payment.user_image_at_pay
        })
    
    return paid_users
