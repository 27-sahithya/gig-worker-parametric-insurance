import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import timedelta

from database.connection import get_db
from models.user import User
from schemas.user_schema import UserResponse, Token, UserLogin
from services.auth_service import get_password_hash, verify_password, create_access_token
from config import settings
from routes.deps import get_current_user

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/signup", response_model=UserResponse)
async def signup(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    zone: str = Form("Mumbai"),
    company: str = Form("Zomato"),
    avg_income: float = Form(25000.0),
    latitude: float = Form(None),
    longitude: float = Form(None),
    upi_id: str = Form(None),
    selected_plan: str = Form("Basic"),
    gov_proof: UploadFile = File(...),
    worker_proof: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check if user exists
    existing_user = db.query(User).filter((User.email == email) | (User.phone == phone)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or phone already registered")

    # Handle file uploads
    gov_proof_path = os.path.join(UPLOAD_DIR, f"gov_{email}_{gov_proof.filename}")
    worker_proof_path = os.path.join(UPLOAD_DIR, f"worker_{email}_{worker_proof.filename}")

    with open(gov_proof_path, "wb") as buffer:
        buffer.write(await gov_proof.read())
        
    with open(worker_proof_path, "wb") as buffer:
        buffer.write(await worker_proof.read())

    # Dynamic Premium Calculation
    is_high_risk = zone in ["Mumbai", "Delhi"]
    pricing = {
        "Basic": 350 if is_high_risk else 250,
        "Standard": 550 if is_high_risk else 350,
        "Premium": 800 if is_high_risk else 600,
        "Pro": 800 if is_high_risk else 600  # Sync Pro with Premium
    }
    premium = pricing.get(selected_plan, 250)

    # Create new user
    hashed_password = get_password_hash(password)
    new_user = User(
        name=name,
        email=email,
        phone=phone,
        password=hashed_password,
        role="user",
        status="pending",
        zone=zone,
        company=company,
        avg_income=avg_income,
        latitude=latitude,
        longitude=longitude,
        upi_id=upi_id,
        gov_proof=gov_proof_path.replace("\\", "/"),
        worker_proof=worker_proof_path.replace("\\", "/"),
        selected_plan=selected_plan,
        weekly_premium=float(premium)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not verify_password(user_credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if user.status != "approved" and user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is {user.status}. Please wait for admin approval.",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Fetch current logged in user details dynamically"""
    return current_user

@router.put("/profile/update", response_model=UserResponse)
async def update_profile(
    email: str = Form(None),
    upi_id: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update profile data (Email, UPI, Avatar)"""
    if email:
        # Simple duplicate check
        existing = db.query(User).filter(User.email == email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already taken")
        current_user.email = email
    
    if upi_id:
        current_user.upi_id = upi_id
        
    if image:
        img_path = os.path.join(UPLOAD_DIR, f"avatar_{current_user.id}_{image.filename}")
        with open(img_path, "wb") as buffer:
            buffer.write(await image.read())
        current_user.user_image = img_path.replace("\\", "/")
        
    db.commit()
    db.refresh(current_user)
    return current_user
