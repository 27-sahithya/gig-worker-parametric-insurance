from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    role: str
    status: str
    zone: str
    company: Optional[str] = None
    avg_income: Optional[float] = 0.0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    upi_id: Optional[str] = None
    gov_proof: Optional[str] = None
    worker_proof: Optional[str] = None
    paid_until: Optional[str] = None
    selected_plan: Optional[str] = "Basic"
    is_paused: bool = False
    user_image: Optional[str] = None
    balance: Optional[float] = 0.0

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
