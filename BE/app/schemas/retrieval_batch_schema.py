from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BatchResultSummary(BaseModel):
    totalFrames: int = 0
    mii: Optional[int] = None
    mi: Optional[int] = None
    evaluationReportURL: Optional[str] = None


class BatchCreate(BaseModel):
    patientId: str
    notes: Optional[str] = None


class BatchUpdate(BaseModel):
    notes: Optional[str] = None
    resultSummary: Optional[BatchResultSummary] = None
    evaluationReportURL: Optional[str] = None


class BatchResponse(BaseModel):
    id: str
    patientId: str
    patientName: Optional[str] = None
    patientRole: Optional[str] = None  # donor | recipient
    createdBy: Optional[str]
    createdAt: Optional[datetime]
    notes: Optional[str]
    status: Optional[str] = "pending"  # pending, processing, completed, failed
    resultSummary: BatchResultSummary
    eligibilityPercentage: Optional[float] = None
    suggestedEligibility: Optional[str] = None  # eligible | notEligible
    eligibilityStatus: Optional[str] = None  # pending | approved | rejected
    approvedBy: Optional[str] = None
    approvedAt: Optional[datetime] = None