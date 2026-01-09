from fastapi import APIRouter, Depends
from app.core.permissions import require_role
from app.services.dashboard_service import get_admin_dashboard
from app.schemas.dashboard_schema import DashboardResponse

router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard"])


@router.get("", response_model=DashboardResponse, dependencies=[Depends(require_role(["admin", "staff"]))])
@router.get("/overview", response_model=DashboardResponse, dependencies=[Depends(require_role(["admin", "staff"]))])
def dashboard_overview():
    """
    Get admin dashboard overview
    
    Returns:
        - Total patients, batches, today appointments
        - Monthly trend (line chart): likely vs unlikely reproducible
        - Journey stages (bar chart): donor vs recipient by stage
    """
    return get_admin_dashboard()