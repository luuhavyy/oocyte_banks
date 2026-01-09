from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class RegisterPatient(BaseModel):
    email: EmailStr
    password: str
    fullName: str
    role: str  # donor | recipient
    dob: datetime  # date of birth (timestamp, required) - accepts YYYY-MM-DD or ISO datetime format
    phone: str  # phone number (required)
    address: str  # address string (required)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    userId: str
    role: str
    
class ChangePasswordSchema(BaseModel):
    oldPassword: str
    newPassword: str

class ForgotPasswordSchema(BaseModel):
    email: EmailStr