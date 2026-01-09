from fastapi import APIRouter, Depends, HTTPException
from app.core.auth_jwt import get_current_user
from app.schemas.retrieval_batch_schema import BatchCreate, BatchUpdate, BatchResponse
from app.schemas.eligibility_schema import ApproveEligibilityRequest
from app.services.retrieval_batch_service import (
    create_batch, get_batch, get_batches_by_patient, update_batch, delete_batch, approve_batch_eligibility
)

router = APIRouter(prefix="/batches", tags=["Retrieval Batches"])


@router.post("/", response_model=BatchResponse)
def create_batch_route(data: BatchCreate, user=Depends(get_current_user)):
    return create_batch(data, user["userId"])


@router.get("/{batchId}", response_model=BatchResponse)
def get_batch_route(batchId: str):
    return get_batch(batchId)


@router.get("/patient/{patientId}")
def get_batches_of_patient(patientId: str):
    return get_batches_by_patient(patientId)


@router.patch("/{batchId}")
def update_batch_route(batchId: str, data: BatchUpdate):
    return update_batch(batchId, data)


@router.delete("/{batchId}")
def delete_batch_route(batchId: str, user=Depends(get_current_user)):
    if user["role"] not in ["admin", "staff"]:
        raise HTTPException(403, "Forbidden")
    return delete_batch(batchId)


@router.post("/{batch_id}/approve-eligibility")
def approve_batch_eligibility_route(
    batch_id: str,
    body: ApproveEligibilityRequest,
    user=Depends(get_current_user)
):
    if user["role"] not in ["admin", "staff"]:
        raise HTTPException(403, "Forbidden")
    return approve_batch_eligibility(batch_id, body.approved, body.notes, user["userId"])
