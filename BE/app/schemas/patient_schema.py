from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


# ----------------------------------------
# Medical History Schemas
# ----------------------------------------

class SmokingStatus(str, Enum):
    NEVER = "Never"
    OCCASIONALLY = "Occasionally"
    OFTEN = "Often"


class AlcoholStatus(str, Enum):
    NEVER = "Never"
    OCCASIONALLY = "Occasionally"
    OFTEN = "Often"


class YesNo(str, Enum):
    YES = "Yes"
    NO = "No"


class PersonalHistory(BaseModel):
    height: Optional[float] = None  # cm
    weight: Optional[float] = None  # kg
    bmi: Optional[float] = None  # auto-calculated on FE
    bloodType: Optional[str] = None  # e.g., "A+", "B-", "O+", "AB+", etc.
    allergies: Optional[List[str]] = None  # e.g. ["penicillin", "dust"]
    smoking: Optional[SmokingStatus] = None  # "Never" | "Occasionally" | "Often"
    alcohol: Optional[AlcoholStatus] = None  # "Never" | "Occasionally" | "Often"
    medications: Optional[str] = None  # free text (textarea)


class Treatments(BaseModel):
    hormonalTherapyHistory: Optional[YesNo] = None  # "Yes" | "No"
    fertilityTreatmentsBefore: Optional[YesNo] = None  # "Yes" | "No"
    fertilityTreatmentType: Optional[str] = None  # e.g. "IVF, IUI", optional if No


class Surgeries(BaseModel):
    pelvicSurgeryHistory: Optional[YesNo] = None  # "Yes" | "No"
    surgeryDetail: Optional[str] = None  # optional if Yes


class FamilyHistory(BaseModel):
    geneticDiseases: Optional[YesNo] = None  # "Yes" | "No"
    familyFertilityIssues: Optional[YesNo] = None  # "Yes" | "No"
    notes: Optional[str] = None


class MedicalHistory(BaseModel):
    personalHistory: Optional[PersonalHistory] = None
    treatments: Optional[Treatments] = None
    surgeries: Optional[Surgeries] = None
    familyHistory: Optional[FamilyHistory] = None


# ----------------------------------------
# Patient Schemas
# ----------------------------------------

class PatientUpdate(BaseModel):
    fullName: Optional[str] = None
    dob: Optional[datetime] = None  # date of birth (timestamp) - accepts YYYY-MM-DD or ISO datetime format
    phone: Optional[str] = None  # phone number
    address: Optional[str] = None  # address string
    medicalHistory: Optional[MedicalHistory] = None
    status: Optional[str] = None


class PatientResponse(BaseModel):
    id: str
    email: str
    fullName: Optional[str]
    dob: Optional[datetime] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    role: Optional[str]
    status: Optional[str]
    stage: Optional[str] = None  # registration | medicalHistory | appointment | retrieval | eligibility
    medicalHistory: Optional[Dict[str, Any]] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None