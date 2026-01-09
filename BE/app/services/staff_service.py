from firebase_admin import auth as firebase_auth
from fastapi import HTTPException
from app.core.firebase import db
from app.schemas.staff_schema import StaffCreate, StaffUpdate
from datetime import datetime


# --------------------------
# CREATE STAFF (admin only)
# --------------------------
def create_staff(data: StaffCreate):

    # create Firebase user
    try:
        fb_user = firebase_auth.create_user(
            email=data.email,
            password=data.password
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    now = datetime.utcnow()
    staff_data = {
        "email": data.email,
        "fullName": data.fullName,
        "phone": "",
        "role": data.role,          # admin | staff
        "status": "active",
        "createdAt": now,
        "updatedAt": now
    }

    db.collection("staffs").document(fb_user.uid).set(staff_data)

    staff_data["staffId"] = fb_user.uid
    return staff_data


# --------------------------
# GET ALL STAFF (admin only)
# --------------------------
def get_all_staff():
    docs = db.collection("staffs").stream()
    return [{ "staffId": d.id, **d.to_dict() } for d in docs]


# --------------------------
# GET ONE STAFF
# --------------------------
def get_staff_by_id(staffId: str):
    doc = db.collection("staffs").document(staffId).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Staff not found")
    return { "staffId": staffId, **doc.to_dict() }


# --------------------------
# UPDATE STAFF (admin only)
# --------------------------
def update_staff(staffId: str, data: StaffUpdate):

    doc = db.collection("staffs").document(staffId).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Staff not found")

    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    # Add updatedAt timestamp
    update_data["updatedAt"] = datetime.utcnow()

    db.collection("staffs").document(staffId).update(update_data)

    return { "staffId": staffId, **doc.to_dict(), **update_data }


# --------------------------
# DELETE STAFF (admin only, soft delete)
# --------------------------
def soft_delete_staff(staffId: str):
    doc = db.collection("staffs").document(staffId).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Staff not found")

    db.collection("staffs").document(staffId).update({
        "status": "inactive",
        "updatedAt": datetime.utcnow()
    })

    return {"message": "Staff deactivated"}
