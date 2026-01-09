from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class StaffCreate(BaseModel):
    email: EmailStr
    password: str
    fullName: str
    role: str   # "staff" | "admin"


class StaffUpdate(BaseModel):
    fullName: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None  # active | inactive
    role: Optional[str] = None    # allow admin to promote/demote


class StaffResponse(BaseModel):
    staffId: str
    email: EmailStr
    fullName: str
    phone: Optional[str]
    role: str
    status: str
    createdAt: Optional[datetime] = None  # timestamp (can be None for old staff)
    updatedAt: Optional[datetime] = None  # timestamp (can be None for old staff)
