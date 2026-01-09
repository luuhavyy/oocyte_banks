from fastapi import APIRouter, Depends
from app.core.auth_jwt import get_current_user
from app.schemas.journey_schema import JourneyResponse
from app.services.journey_service import get_patient_journey

router = APIRouter(prefix="/journey", tags=["Journey"])


@router.get("/me", response_model=JourneyResponse)
def get_my_journey(user=Depends(get_current_user)):
    return get_patient_journey(user["userId"])
