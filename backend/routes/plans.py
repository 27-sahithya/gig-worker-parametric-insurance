from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from models.user import User
from routes.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

from schemas.plan_schema import PlanChange

@router.put("/toggle-pause")
def toggle_pause(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == current_user.id).first()
    user.is_paused = not user.is_paused
    db.commit()
    db.refresh(user)
    return {"is_paused": user.is_paused, "message": "Plan status updated"}

@router.put("/change")
def change_plan(plan_data: PlanChange, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if plan_data.plan not in ["Basic", "Standard", "Premium"]:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
    
    user = db.query(User).filter(User.id == current_user.id).first()
    user.selected_plan = plan_data.plan
    db.commit()
    db.refresh(user)
    return {"selected_plan": user.selected_plan, "message": "Plan updated successfully"}
