from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


class MaturityStatus(str, Enum):
    MII = "MII"
    MI = "MI"


class QualityStatus(str, Enum):
    LIKELY_REPRODUCIBLE = "likely reproducible"
    UNLIKELY_REPRODUCIBLE = "unlikely reproducible"


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DetectionClass(str, Enum):
    OOCYTE = "oocyte"
    PB = "pb"
    POLARBODY = "polarbody"
    CYTOPLASM = "cytoplasm"


class Detection(BaseModel):
    class_: DetectionClass = Field(alias="class")
    confidence: float = Field(ge=0, le=1)
    bbox: BoundingBox


class DetectionResults(BaseModel):
    detections: List[Detection]
    inferenceTimestamp: datetime
    modelVersion: Optional[str] = None


class EvalResult(BaseModel):
    maturity: MaturityStatus
    quality: QualityStatus
    evaluatedAt: Optional[datetime] = None


class FrameUpdate(BaseModel):
    evaluationResult: Optional[EvalResult] = None
    detectionResults: Optional[DetectionResults] = None


class FrameResponse(BaseModel):
    id: str
    frameId: Optional[str] = None  # Add for compatibility
    batchId: str
    patientId: str
    uploadedBy: str
    uploadedAt: Optional[datetime]
    frameURL: str
    maturity: Optional[MaturityStatus] = None  # Get from evaluationResult.maturity only
    evaluationResult: Optional[EvalResult] = None
    detectionResults: Optional[DetectionResults] = None
    
    class Config:
        populate_by_name = True
    
    @validator('maturity', pre=True, always=True)
    def set_maturity_from_evaluation_result(cls, v, values):
        # Always get maturity from evaluationResult.maturity
        if 'evaluationResult' in values and values.get('evaluationResult'):
            eval_result = values['evaluationResult']
            if isinstance(eval_result, dict) and 'maturity' in eval_result:
                return eval_result['maturity']
            elif hasattr(eval_result, 'maturity'):
                return eval_result.maturity
        return None