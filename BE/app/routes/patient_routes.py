from fastapi import APIRouter, Depends, HTTPException
from app.core.auth_jwt import get_current_user
from app.core.permissions import require_role
from app.schemas.patient_schema import PatientUpdate, PatientResponse
from app.services.patient_service import (
    get_patient_self,
    get_all_patients,
    get_patient_by_id,
    update_patient_data,
    soft_delete_patient
)
from app.services.eval_history_service import get_evaluation_history

router = APIRouter(prefix="/patients", tags=["Patients"])


# --------------------------
# GET /patients/me
# --------------------------
@router.get("/me", response_model=PatientResponse)
def get_me(user=Depends(get_current_user)):
    if user["role"] != "patient":
        raise HTTPException(403, "Not a patient")
    return get_patient_self(user["userId"])


# --------------------------
# GET /patients (admin/staff)
# --------------------------
@router.get("/", dependencies=[Depends(require_role(["admin", "staff"]))])
def list_patients(
    page: int = 1,
    limit: int = 20,
    role: str | None = None,
    status: str | None = None,
    search: str | None = None,
):
    return get_all_patients(page, limit, role, status, search)


# --------------------------
# GET /patients/{id}/evaluation-history (must be before /{patientId} route)
# --------------------------
@router.get("/{patientId}/evaluation-history")
def eval_history(patientId: str, user=Depends(get_current_user)):
    if user["role"] not in ["admin", "staff"] and user["userId"] != patientId:
        raise HTTPException(403, "Forbidden")
    
    return get_evaluation_history(patientId)


# --------------------------
# GET /patients/{id}
# --------------------------
@router.get("/{patientId}", response_model=PatientResponse)
def get_patient(patientId: str, user=Depends(get_current_user)):
    if user["role"] not in ["admin", "staff"] and user["userId"] != patientId:
        raise HTTPException(403, "Forbidden")

    return get_patient_by_id(patientId)


# --------------------------
# PATCH /patients/{id}
# --------------------------
@router.patch("/{patientId}")
def update_patient(patientId: str, data: PatientUpdate, user=Depends(get_current_user)):
    if user["role"] not in ["admin", "staff"] and user["userId"] != patientId:
        raise HTTPException(403, "Forbidden")

    return update_patient_data(patientId, data.dict(exclude_none=True))


# --------------------------
# DELETE /patients/{id}
# --------------------------
@router.delete("/{patientId}", dependencies=[Depends(require_role(["admin", "staff"]))])
def delete_patient(patientId: str):
    return soft_delete_patient(patientId)
