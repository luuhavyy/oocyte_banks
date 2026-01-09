from fastapi import APIRouter, Depends
from app.core.auth_jwt import get_current_user
from app.schemas.egg_record_schema import EggRecordCreate, EggRecordUpdate, EggRecordResponse
from app.services.egg_record_service import (
    create_egg_record,
    get_egg_record,
    get_egg_records_by_patient,
    get_egg_records_by_batch,
    update_egg_record,
    delete_egg_record
)

router = APIRouter(prefix="/egg-records", tags=["Egg Records"])


# Create (admin/staff only)
@router.post("/", response_model=EggRecordResponse)
def create_record(data: EggRecordCreate, user=Depends(get_current_user)):
    if user["role"] not in ["admin", "staff"]:
        raise HTTPException(403, "Forbidden")

    return create_egg_record(data)


# Get 1 record
@router.get("/{recordId}", response_model=EggRecordResponse)
def get_record(recordId: str):
    return get_egg_record(recordId)


# Get by patient (self + admin + staff)
@router.get("/patient/{patientId}")
def get_records_by_patient(patientId: str, user=Depends(get_current_user)):
    if user["role"] not in ["admin", "staff"] and user["userId"] != patientId:
        raise HTTPException(403, "Forbidden")

    return get_egg_records_by_patient(patientId)


# Get by batchId
@router.get("/batch/{batchId}")
def get_records_by_batch(batchId: str):
    return get_egg_records_by_batch(batchId)


# Update record (admin/staff only)
@router.patch("/{recordId}")
def update_record(recordId: str, data: EggRecordUpdate, user=Depends(get_current_user)):
    if user["role"] not in ["admin", "staff"]:
        raise HTTPException(403, "Forbidden")

    return update_egg_record(recordId, data)


# Delete record (admin/staff only)
@router.delete("/{recordId}")
def delete_record(recordId: str, user=Depends(get_current_user)):
    if user["role"] not in ["admin", "staff"]:
        raise HTTPException(403, "Forbidden")

    return delete_egg_record(recordId)
