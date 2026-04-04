import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./rakshak_ai_v3.db")
    # For MySQL locally use: mysql+pymysql://root:password@localhost:3306/rakshak
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_key_for_hackathon_only_12345")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
