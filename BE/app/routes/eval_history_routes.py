from fastapi import APIRouter, Depends, HTTPException
from app.core.auth_jwt import get_current_user
from app.services.eval_history_service import get_evaluation_history

router = APIRouter(prefix="/patients", tags=["Evaluation History"])


@router.get("/{patientId}/evaluation-history")
def eval_history(patientId: str, user=Depends(get_current_user)):
    if user["role"] not in ["admin", "staff"] and user["userId"] != patientId:
        raise HTTPException(403, "Forbidden")

    return get_evaluation_history(patientId)
