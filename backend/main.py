from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from database.connection import Base, engine
from models.user import User
from models.policy import Policy
from models.claim import Claim
from models.payment import Payment
from fastapi.staticfiles import StaticFiles
from routes import auth, admin, ai_routes, policy_routes, claims_routes, payments, plans

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Rakshak AI Backend",
    description="Backend API for AI-Powered Insurance for India's Gig Economy",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for proofs
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(ai_routes.router, prefix="/ai", tags=["AI Models"])
app.include_router(policy_routes.router, prefix="/policy", tags=["Policy"])
app.include_router(claims_routes.router, prefix="/claims", tags=["Claims"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(plans.router, prefix="/plans", tags=["Plans Management"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Rakshak AI API"}
