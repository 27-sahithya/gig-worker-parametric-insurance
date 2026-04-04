from sqlalchemy import Column, Integer, String, Text, Float, Boolean
from database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="user")  # 'user' or 'admin'
    status = Column(String, default="pending")  # 'pending', 'approved', 'rejected'
    zone = Column(String, default="Mumbai")  # Mumbai, Hyderabad, Delhi, etc.
    company = Column(String, default="Zomato")  # Zomato, Swiggy, Dunzo, etc.
    avg_income = Column(Float, default=25000.0)  # Monthly average income
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    upi_id = Column(String, nullable=True)
    balance = Column(Float, default=0.0)  # For payouts and admin pool
    gov_proof = Column(Text, nullable=True)
    worker_proof = Column(Text, nullable=True)
    paid_until = Column(Text, nullable=True)  # ISO format date
    user_image = Column(Text, nullable=True)  # For payment verification
    selected_plan = Column(String, default="Basic")  # Basic, Premium, Pro
    weekly_premium = Column(Float, default=0.0)  # The actual weekly cost based on zone risk
    is_paused = Column(Boolean, default=False)  # Whether the plan is currently inactive
