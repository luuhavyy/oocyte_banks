from fastapi import APIRouter, Depends
from app.schemas.staff_schema import StaffCreate, StaffUpdate
from app.services.staff_service import (
    create_staff, get_all_staff, get_staff_by_id,
    update_staff, soft_delete_staff
)
from app.core.permissions import require_admin

router = APIRouter(prefix="/staffs", tags=["Staffs"])


# ------------------------------
# CREATE
# ------------------------------
@router.post("/", dependencies=[Depends(require_admin)])
def create_staff_route(data: StaffCreate):
    return create_staff(data)


# ------------------------------
# GET ALL
# ------------------------------
@router.get("/", dependencies=[Depends(require_admin)])
def get_all_route():
    return get_all_staff()


# ------------------------------
# GET BY ID
# ------------------------------
@router.get("/{staffId}", dependencies=[Depends(require_admin)])
def get_one_route(staffId: str):
    return get_staff_by_id(staffId)


# ------------------------------
# UPDATE
# ------------------------------
@router.patch("/{staffId}", dependencies=[Depends(require_admin)])
def update_staff_route(staffId: str, data: StaffUpdate):
    return update_staff(staffId, data)


# ------------------------------
# SOFT DELETE
# ------------------------------
@router.delete("/{staffId}", dependencies=[Depends(require_admin)])
def delete_staff_route(staffId: str):
    return soft_delete_staff(staffId)
