from pydantic import BaseModel

class PlanChange(BaseModel):
    plan: str
