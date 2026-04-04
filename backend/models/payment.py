from sqlalchemy import Column, Integer, String, Float, DateTime
from database.connection import Base
from datetime import datetime

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    amount = Column(Float)
    payment_method = Column(String)  # 'UPI', 'CARD', etc.
    user_image_at_pay = Column(String, nullable=True)  # Path to user image
    week_start = Column(DateTime)
    week_end = Column(DateTime)
    paid_at = Column(DateTime, default=datetime.utcnow)
