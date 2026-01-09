from typing import List, Optional, Dict
from pydantic import BaseModel
from datetime import datetime


class JourneyStage(BaseModel):
    registration: str     # "done"
    medicalHistory: str   # "pending" | "done"
    appointment: str      # "pending" | "done"
    retrieval: str        # "pending" | "active" | "done"
    eligibility: str    # "pending" | "done" | "failed"


class JourneyAppointment(BaseModel):
    id: str
    appointmentDate: datetime
    type: str
    status: str
    staffAssigned: Optional[str] = None


class JourneyBatch(BaseModel):
    id: str
    status: str
    createdAt: datetime
    completedAt: Optional[datetime] = None


class JourneyEggRecord(BaseModel):
    id: str
    miiEggs: int
    miEggs: int
    total: int
    createdAt: datetime


class JourneyResponse(BaseModel):
    patientId: str
    fullName: Optional[str]
    role: str  # donor | recipient
    stage: JourneyStage

    # FE needs raw items for timeline, detail page, etc.
    appointments: List[JourneyAppointment]
    batches: List[JourneyBatch]
    eggRecords: List[JourneyEggRecord]

    # Additional computed data for FE UI
    eligibilityScore: Optional[float] = None
    eligibilityRule: Optional[str] = None