import os
from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "MindPulse ML Service"
    environment: str = os.getenv("ENVIRONMENT", "development")
    port: int = int(os.getenv("PORT", "8000"))
    model_version: str = "prototype-v1.0"
    is_non_diagnostic: bool = True

settings = Settings()
