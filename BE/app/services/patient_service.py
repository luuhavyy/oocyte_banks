from fastapi import HTTPException
from app.core.firebase import db
from datetime import datetime
import math

# ------------------------------------
# GET SELF
# ------------------------------------
def get_patient_self(user_id: str):
    doc = db.collection("patients").document(user_id).get()
    if not doc.exists:
        raise HTTPException(404, "Patient not found")

    data = doc.to_dict()
    # Handle backward compatibility: old patients might not have dob, phone, address, timestamps
    result = {"id": doc.id, **data}
    return result


# ------------------------------------
# GET ALL (admin/staff only)
# ------------------------------------

def get_all_patients(page: int, limit: int, role: str | None, status: str | None, search: str | None):
    collection = db.collection("patients")
    query = collection

    # --- Firestore filterable fields ---
    if role:
        query = query.where("role", "==", role)

    if status:
        query = query.where("status", "==", status)

    docs = query.stream()

    # Convert to list for further soft filtering
    items = [{"id": d.id, **d.to_dict()} for d in docs]

    # --- Search filter (soft filter - Firestore doesn't support OR) ---
    if search:
        search_lower = search.lower()
        items = [
            p for p in items
            if search_lower in p.get("email", "").lower()
            or search_lower in p.get("fullName", "").lower()
        ]

    # --- Pagination ---
    total_items = len(items)
    total_pages = math.ceil(total_items / limit)
    start = (page - 1) * limit
    end = start + limit

    paginated = items[start:end]

    return {
        "page": page,
        "limit": limit,
        "total_items": total_items,
        "total_pages": total_pages,
        "items": paginated,
    }


# ------------------------------------
# GET ONE (admin/staff/self)
# ------------------------------------
def get_patient_by_id(patient_id: str):
    doc = db.collection("patients").document(patient_id).get()
    if not doc.exists:
        raise HTTPException(404, "Patient not found")

    return {"id": doc.id, **doc.to_dict()}


# ------------------------------------
# UPDATE PATIENT
# ------------------------------------
def _update_patient_stage(patient_id: str, new_stage: str):
    doc = db.collection("patients").document(patient_id).get()
    if not doc.exists:
        return
    
    current_data = doc.to_dict()
    current_stage = current_data.get("stage", "registration")
    
    stage_order = {
        "registration": 1,
        "medicalHistory": 2,
        "appointment": 3,
        "retrieval": 4,
        "eligibility": 5
    }
    
    current_level = stage_order.get(current_stage, 0)
    new_level = stage_order.get(new_stage, 0)
    
    if new_level > current_level:
        db.collection("patients").document(patient_id).update({
            "stage": new_stage,
            "updatedAt": datetime.utcnow()
        })


def _has_complete_medical_history(medical_history):
    if not medical_history:
        return False
    if isinstance(medical_history, dict):
        for key, value in medical_history.items():
            if value and (isinstance(value, dict) and value or isinstance(value, str) and value.strip()):
                return True
    return False


def update_patient_data(patient_id: str, data: dict):
    data["updatedAt"] = datetime.utcnow()
    
    if "medicalHistory" in data and data["medicalHistory"]:
        doc = db.collection("patients").document(patient_id).get()
        if doc.exists:
            existing_data = doc.to_dict()
            existing_medical_history = existing_data.get("medicalHistory", {}) or {}
            
            if isinstance(existing_medical_history, dict) and isinstance(data["medicalHistory"], dict):
                merged_medical_history = existing_medical_history.copy()
                for key, value in data["medicalHistory"].items():
                    if key in merged_medical_history and isinstance(merged_medical_history[key], dict) and isinstance(value, dict):
                        merged_medical_history[key].update(value)
                    else:
                        merged_medical_history[key] = value
                data["medicalHistory"] = merged_medical_history
        
        if _has_complete_medical_history(data["medicalHistory"]):
            _update_patient_stage(patient_id, "medicalHistory")
    
    db.collection("patients").document(patient_id).update(data)
    return {"status": "updated"}


# ------------------------------------
# SOFT DELETE
# ------------------------------------
def soft_delete_patient(patient_id: str):
    db.collection("patients").document(patient_id).update({
        "status": "inactive",
        "updatedAt": datetime.utcnow()
    })
    return {"status": "soft-deleted"}
