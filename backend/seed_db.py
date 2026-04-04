import os
import datetime
from sqlalchemy.orm import Session
from database.connection import SessionLocal, engine, Base
from models.user import User
from models.policy import Policy
from models.payment import Payment
from models.claim import Claim
from services.auth_service import get_password_hash

# Ensure uploads directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Create some dummy files for proofs
def create_dummy_file(filename):
    path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(path):
        with open(path, "w") as f:
            f.write("This is a mock document for demo purposes.")
    return f"uploads/{filename}"

def seed():
    db = SessionLocal()
    try:
        # 1. Clear existing data for a clean demo state
        print("Cleaning database...")
        db.query(Claim).delete()
        db.query(Payment).delete()
        db.query(Policy).delete()
        db.query(User).delete()
        db.commit()
        
        # 2. Add Admin
        print("Creating admin...")
        admin = User(
            name="Rakshak Admin",
            email="admin@rakshak.ai",
            phone="0000000000",
            password=get_password_hash("admin123"),
            role="admin",
            status="approved",
            balance=1500000.0 # 15 Lakh pool
        )
        db.add(admin)
        db.flush()

        # 3. Add Mock Workers
        print("Creating mock workers...")
        workers_data = [
            {
                "name": "Rajesh Kumar",
                "email": "rajesh@work.com",
                "phone": "9876543210",
                "zone": "Mumbai North",
                "plan": "Standard",
                "status": "approved",
                "income": 28000.0,
                "gov": "gov_rajesh.txt",
                "work": "work_rajesh.txt"
            },
            {
                "name": "Anita Sharma",
                "email": "anita@delivery.com",
                "phone": "9876543211",
                "zone": "Delhi South",
                "plan": "Premium",
                "status": "pending",
                "income": 22000.0,
                "gov": "gov_anita.txt",
                "work": "work_anita.txt"
            },
            {
                "name": "Vikram Singh",
                "email": "vikram@gig.com",
                "phone": "9876543212",
                "zone": "Bangalore East",
                "plan": "Basic",
                "status": "approved",
                "income": 18000.0,
                "gov": "gov_vikram.txt",
                "work": "work_vikram.txt"
            },
            {
                "name": "Priya Patel",
                "email": "priya@zomato.com",
                "phone": "9876543213",
                "zone": "Hyderabad",
                "plan": "Standard",
                "status": "pending",
                "income": 35000.0,
                "gov": "gov_priya.txt",
                "work": "work_priya.txt"
            },
            {
                "name": "Amit Chenoy",
                "email": "amit@swiggy.com",
                "phone": "9876543214",
                "zone": "Pune",
                "plan": "Premium",
                "status": "approved",
                "income": 25000.0,
                "gov": "gov_amit.txt",
                "work": "work_amit.txt"
            },
            {
                "name": "Akash Darapuneni",
                "email": "akashdarapuneni7@gmail.com",
                "phone": "9999999999",
                "zone": "Hyderabad",
                "plan": "Standard",
                "status": "approved",
                "income": 45000.0,
                "gov": "gov_akash.txt",
                "work": "work_akash.txt"
            }
        ]

        for wd in workers_data:
            gov_path = create_dummy_file(wd["gov"])
            work_path = create_dummy_file(wd["work"])
            
            user = User(
                name=wd["name"],
                email=wd["email"],
                phone=wd["phone"],
                password=get_password_hash("password123"),
                role="user",
                status=wd["status"],
                zone=wd["zone"],
                avg_income=wd["income"],
                gov_proof=gov_path,
                worker_proof=work_path,
                selected_plan=wd["plan"],
                paid_until=(datetime.datetime.now() + datetime.timedelta(days=5)).isoformat() if wd["status"] == "approved" else None
            )
            db.add(user)
            db.flush()
            
            # Add a policy for approved users
            if user.status == "approved":
                policy = Policy(
                    user_id=user.id,
                    weekly_premium=89.0 if wd["plan"] == "Standard" else (149.0 if wd["plan"] == "Premium" else 49.0),
                    risk_score=0.25,
                    active=True,
                    persona="food",
                    plan_type=wd["plan"],
                    expires_at=datetime.datetime.now() + datetime.timedelta(days=7)
                )
                db.add(policy)
                db.flush()

                # Add a mock payment
                payment = Payment(
                    user_id=user.id,
                    amount=policy.weekly_premium,
                    payment_method="UPI",
                    week_start=datetime.datetime.now() - datetime.timedelta(days=2),
                    week_end=datetime.datetime.now() + datetime.timedelta(days=5)
                )
                db.add(payment)

                # Add a claim for Rajesh Kumar
                if wd["name"] == "Rajesh Kumar":
                    claim = Claim(
                        user_id=user.id,
                        policy_id=policy.id,
                        amount=500.0,
                        trigger="Heavy Rain (102mm)",
                        status="approved",
                        zone=wd["zone"],
                        is_auto_triggered=True
                    )
                    db.add(claim)
                
                # Add initial claim history for Akash
                if wd["name"] == "Akash Darapuneni":
                    claim = Claim(
                        user_id=user.id,
                        policy_id=policy.id,
                        amount=1250.0,
                        trigger="Severe AQI (420)",
                        status="approved",
                        zone=wd["zone"],
                        is_auto_triggered=True
                    )
                    db.add(claim)

        db.commit()
        print("Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
