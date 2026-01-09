from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class FrameListItem(BaseModel):
    frameId: str
    frameURL: str
    status: str  # "done", "processing", "failed", etc.


class ReportSummary(BaseModel):
    total: int
    mii: int
    mi: int
    reportFileURL: Optional[str] = None


class EvaluationRequestCreate(BaseModel):
    batchId: str
    initiatedBy: str


class EvaluationRequestUpdate(BaseModel):
    status: Optional[str] = None  # "pending", "processing", "completed", "failed"
    errorLog: Optional[str] = None
    reportSummary: Optional[ReportSummary] = None


class EvaluationRequestResponse(BaseModel):
    id: str
    batchId: str
    initiatedBy: str
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    status: str  # "pending", "processing", "completed", "failed"
    frameList: Optional[List[FrameListItem]] = None
    errorLog: Optional[str] = None
    reportSummary: Optional[ReportSummary] = None