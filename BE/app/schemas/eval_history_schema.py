from pydantic import BaseModel
from typing import List
from datetime import datetime
from enum import Enum


class MaturityStatus(str, Enum):
    MII = "MII"
    MI = "MI"


class FrameItem(BaseModel):
    id: str
    frameURL: str


class BatchSummary(BaseModel):
    batchId: str
    retrievalDate: datetime
    miiEggs: int
    miEggs: int
    frames: List[FrameItem]


class EvaluationHistoryResponse(BaseModel):
    patientId: str
    history: List[BatchSummary]