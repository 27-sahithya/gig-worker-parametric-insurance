from sqlalchemy import Column, Integer, Float, Boolean, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    weekly_premium = Column(Float)
    risk_score = Column(Float)
    active = Column(Boolean, default=True)
    persona = Column(String, default="food")  # food, ecom, grocery
    plan_type = Column(String, default="Standard")  # Basic, Standard, Premium
    expires_at = Column(DateTime, nullable=True)
