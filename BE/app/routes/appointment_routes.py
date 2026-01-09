# app/routes/appointment_routes.py
from fastapi import APIRouter, Depends, HTTPException
from app.core.auth_jwt import get_current_user
from app.core.permissions import require_role
from app.schemas.appointment_schema import AppointmentCreate, AppointmentUpdate
from app.services import appointment_service as service

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("/")
def create(body: AppointmentCreate, user=Depends(get_current_user)):
    if user["role"] != "patient":
        raise HTTPException(403, "Only patients can book")
    return service.create_appointment(user["userId"], body)


@router.get("/my")
def my_apps(limit: int = 10, cursor: str = None, type: str = None, status: str = None,
            dateFrom: str = None, dateTo: str = None, user=Depends(get_current_user)):
    if user["role"] != "patient":
        raise HTTPException(403, "Forbidden")
    return service.query_appointments(limit, cursor, type, status, dateFrom, dateTo, patientId=user["userId"])


@router.get("/", dependencies=[Depends(require_role(["admin", "staff"]))])
def all_apps(limit: int = 10, cursor: str = None, type: str = None, status: str = None,
             dateFrom: str = None, dateTo: str = None, patientId: str = None):
    return service.query_appointments(limit, cursor, type, status, dateFrom, dateTo, patientId)


@router.patch("/{appId}")
def update(appId: str, body: AppointmentUpdate, user=Depends(get_current_user)):
    if user["role"] == "patient":
        # only their own appointments
        apps = service.query_appointments(patientId=user["userId"], limit=999)["items"]
        allowed = [a["id"] for a in apps]
        if appId not in allowed:
            raise HTTPException(403, "Forbidden")
        if body.staffAssigned:
            raise HTTPException(403, "Patient cannot assign staff")

    return service.update_appointment(appId, body)
