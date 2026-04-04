import sys
import os

# Add the parent directory to sys.path to import from sibling directories
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.connection import Base, engine, SessionLocal
from models.user import User
from models.policy import Policy
from models.claim import Claim
from services.auth_service import get_password_hash

def init_db():
    # 1. Create tables
    print("Creating tables in rakshak.db...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # 2. Check if admin exists
    admin_email = "admin@rakshak.ai"
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    
    if not existing_admin:
        print(f"Seeding default admin: {admin_email}")
        admin = User(
            name="Rakshak Admin",
            email=admin_email,
            phone="0000000000",
            password=get_password_hash("admin123"),
            role="admin",
            status="approved",
            zone="Mumbai",
            balance=1000000.0
        )
        db.add(admin)
    else:
        print(f"Updating admin balance: {admin_email}")
        existing_admin.password = get_password_hash("admin123")
        existing_admin.balance = 1000000.0
        existing_admin.status = "approved"

    # 3. Seed a test worker
    user_email = "worker@rakshak.ai"
    existing_user = db.query(User).filter(User.email == user_email).first()
    if not existing_user:
        print(f"Seeding test worker: {user_email}")
        worker = User(
            name="Rahul Kumar",
            email=user_email,
            phone="9876543210",
            password=get_password_hash("worker123"),
            role="user",
            status="approved",
            zone="Hyderabad",
            company="Zomato",
            avg_income=30000.0,
            balance=500.0
        )
        db.add(worker)
    else:
        print(f"Updating worker data: {user_email}")
        existing_user.password = get_password_hash("worker123")
        existing_user.zone = "Hyderabad"
        existing_user.company = "Zomato"
        existing_user.avg_income = 30000.0
        existing_user.status = "approved"

    db.commit()
    db.close()
    print("Database initialization complete!")

if __name__ == "__main__":
    init_db()
