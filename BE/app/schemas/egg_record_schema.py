from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EggRecordBase(BaseModel):
    patientId: str
    batchId: str
    miiEggs: int
    miEggs: int
    total: int
    suggestedEligibility: Optional[str] = None  # eligible | notEligible
    eligibilityStatus: Optional[str] = None  # pending | approved | rejected
    approvedBy: Optional[str] = None
    approvedAt: Optional[datetime] = None


class EggRecordCreate(EggRecordBase):
    pass


class EggRecordUpdate(BaseModel):
    miiEggs: Optional[int] = None
    miEggs: Optional[int] = None
    total: Optional[int] = None
    suggestedEligibility: Optional[str] = None
    eligibilityStatus: Optional[str] = None
    approvedBy: Optional[str] = None
    approvedAt: Optional[datetime] = None


class EggRecordResponse(EggRecordBase):
    id: str
    createdAt: Optional[datetime]
    updatedAt: Optional[datetime]