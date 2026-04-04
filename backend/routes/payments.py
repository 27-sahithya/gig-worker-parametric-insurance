import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database.connection import get_db
from models.user import User
from models.payment import Payment
from routes.deps import get_current_user
from services.email_service import send_payment_confirmation

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_current_week_range():
    today = datetime.now()
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    return monday.replace(hour=0, minute=0, second=0), sunday.replace(hour=23, minute=59, second=59)

@router.get("/status")
async def check_payment_status(current_user: User = Depends(get_current_user)):
    """
    Check if the user has a valid payment for the current week.
    """
    now = datetime.now()
    if not current_user.paid_until:
        return {"is_paid": False}
        
    paid_until = datetime.fromisoformat(current_user.paid_until)
    if now < paid_until:
        return {"is_paid": True, "paid_until": current_user.paid_until}
    
    return {"is_paid": False}

@router.post("/pay")
async def process_payment(
    amount: float = Form(...),
    method: str = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Process a simulation of payment and store history.
    """
    # 1. Save uploaded image (optional)
    img_path = None
    if image:
        img_path = os.path.join(UPLOAD_DIR, f"pay_{current_user.id}_{int(datetime.now().timestamp())}_{image.filename}")
        with open(img_path, "wb") as buffer:
            buffer.write(await image.read())
        
    # 2. Calculate week range
    monday, sunday = get_current_week_range()
    
    # 3. Create payment record
    new_payment = Payment(
        user_id=current_user.id,
        amount=amount,
        payment_method=method,
        user_image_at_pay=img_path,
        week_start=monday,
        week_end=sunday
    )
    db.add(new_payment)
    
    # 4. Update user status
    current_user.paid_until = sunday.isoformat()
    if img_path:
        current_user.user_image = img_path
    
    admin = db.query(User).filter(User.role == "admin").first()
    if admin:
        admin.balance += amount
        
    db.commit()
    
    # 5. Send notification (safely)
    try:
        send_payment_confirmation(current_user.email, current_user.name, amount, monday.strftime("%Y-%m-%d"), sunday.strftime("%Y-%m-%d"))
    except Exception as e:
        print(f"Email failed: {e}")
    
    return {"message": "Payment successful", "paid_until": sunday.isoformat()}

@router.get("/history")
async def payment_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch all past payments for the logged-in user.
    """
    payments = db.query(Payment).filter(Payment.user_id == current_user.id).order_by(Payment.paid_at.desc()).all()
    return payments
