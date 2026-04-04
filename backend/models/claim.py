from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Text, Boolean
from datetime import datetime
from database.connection import Base

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=True)
    amount = Column(Float)
    trigger = Column(String)         # e.g. "Heavy Rain (95mm)"
    status = Column(String, default="pending")   # pending, approved, rejected, fraudulent
    fraud_score = Column(Float, default=0.0)
    zone = Column(String, nullable=True)
    is_auto_triggered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

