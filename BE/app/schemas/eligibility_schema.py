from pydantic import BaseModel
from typing import Optional


class ApproveEligibilityRequest(BaseModel):
    approved: bool
    notes: Optional[str] = None

