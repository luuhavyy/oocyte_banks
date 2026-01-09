from pydantic import BaseModel
from typing import List
from datetime import datetime


class RecentBatch(BaseModel):
    batchId: str
    patient: str  # Patient name
    date: datetime
    mii: int  # likely reproducible count
    mi: int   # unlikely reproducible count
    total: int
    status: str  # pending, processing, completed, failed (no frozen)


class RecentPatient(BaseModel):
    patientId: str
    name: str
    role: str  # donor | recipient
    status: str  # active | inactive


class MonthlyTrend(BaseModel):
    """Monthly trend data for line chart"""
    month: str  # "YYYY-MM" format
    likelyReproducible: int  # MII count
    unlikelyReproducible: int  # MI count


class JourneyStageCount(BaseModel):
    """Patient count by journey stage"""
    stage: str  # registration, medicalHistory, appointment, retrieval, eligibility
    donor: int
    recipient: int


class DashboardResponse(BaseModel):
    totalPatients: int
    totalBatches: int
    todayAppointments: int
    monthlyTrend: List[MonthlyTrend]  # Line chart: likely vs unlikely reproducible
    journeyStages: List[JourneyStageCount]  # Bar chart: donor vs recipient by stage
    patientsGrowthPercent: float  # Growth percentage vs last month
    lastBatchesUpdateTime: datetime | None  # Last batch update time
    nextAppointmentTime: datetime | None  # Next appointment time today
    totalEggs: int  # Total eggs from all egg records