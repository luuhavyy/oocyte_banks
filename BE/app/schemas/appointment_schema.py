# app/schemas/appointment_schema.py
from pydantic import BaseModel
from typing import Optional, Literal
from pydantic import Field


class AppointmentCreate(BaseModel):
    appointmentDate: str
    type: Literal["checkup", "retrieval"] = Field(..., description="Only 2 types allowed")
    notes: Optional[str] = ""


class AppointmentUpdate(BaseModel):
    appointmentDate: Optional[str] = None
    status: Optional[
            Literal["pending", "confirmed", "cancelled", "completed"]
        ] = None    
    staffAssigned: Optional[str] = None
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: str
    patientId: str
    appointmentDate: str
    type: str
    status: str
    notes: Optional[str]
    staffAssigned: Optional[str]
    createdAt: str
