# app/services/appointment_service.py
from fastapi import HTTPException
from app.core.firebase import db
from app.schemas.appointment_schema import AppointmentCreate, AppointmentUpdate
from datetime import datetime
from google.cloud.firestore_v1 import SERVER_TIMESTAMP
from typing import Optional


def _iso_to_ts(iso_str: str):
    try:
        dt = datetime.fromisoformat(iso_str)
        return dt
    except:
        raise HTTPException(400, "Invalid datetime format")


# CHECK MEDICAL HISTORY
def _check_medical_history(patient_id: str):
    doc = db.collection("patients").document(patient_id).get()
    if not doc.exists:
        raise HTTPException(404, "Patient not found")

    mh = doc.to_dict().get("medicalHistory")
    if not mh:
        raise HTTPException(400, "Complete medical history first")


# CREATE
def create_appointment(patient_id: str, body: AppointmentCreate):
    _check_medical_history(patient_id)

    new_doc = {
        "patientId": patient_id,
        "appointmentDate": _iso_to_ts(body.appointmentDate),
        "type": body.type,
        "notes": body.notes,
        "status": "pending",
        "staffAssigned": None,
        "createdAt": SERVER_TIMESTAMP
    }

    ref = db.collection("appointments").add(new_doc)
    return {"id": ref[1].id, **_serialize(new_doc)}


# UPDATE
def update_appointment(app_id: str, body: AppointmentUpdate):
    doc_ref = db.collection("appointments").document(app_id)
    snap = doc_ref.get()

    if not snap.exists:
        raise HTTPException(404, "Appointment not found")

    update_data = {}
    appointment_data = snap.to_dict()

    if body.appointmentDate:
        update_data["appointmentDate"] = _iso_to_ts(body.appointmentDate)
        update_data["status"] = "pending"

    if body.status:
        update_data["status"] = body.status

    if body.staffAssigned:
        update_data["staffAssigned"] = body.staffAssigned

    if body.notes is not None:
        update_data["notes"] = body.notes

    doc_ref.update(update_data)

    if body.status == "completed":
        from app.services.patient_service import _update_patient_stage
        patient_id = appointment_data.get("patientId")
        appointment_type = appointment_data.get("type")
        
        if appointment_type == "retrieval":
            _update_patient_stage(patient_id, "retrieval")
        elif appointment_type == "checkup":
            _update_patient_stage(patient_id, "appointment")

    return {"id": app_id, "updated": _serialize(update_data)}


# PAGINATION / FILTER
def query_appointments(
    limit: int = 10,
    cursor: Optional[str] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    patientId: Optional[str] = None
):
    """
    Query appointments with filters.
    Note: To avoid Firestore index requirements, we fetch all matching docs and sort in Python.
    For production, create composite indexes or use simpler queries.
    """
    ref = db.collection("appointments")

    # Apply filters (avoid multiple where + order_by to prevent index error)
    # Strategy: Use single where clause in Firestore, filter rest in Python
    # Use patientId as primary filter if available (most common case)
    if patientId:
        ref = ref.where("patientId", "==", patientId)
    elif type:
        ref = ref.where("type", "==", type)
    elif status:
        ref = ref.where("status", "==", status)

    # Fetch all matching docs (with reasonable limit to avoid memory issues)
    max_fetch = 1000
    docs = list(ref.limit(max_fetch).stream())
    
    items = [_serialize_doc(d) for d in docs]
    
    # Apply remaining filters in Python to avoid index requirements
    if type and not (patientId and any(d.to_dict().get("type") == type for d in docs)):
        items = [item for item in items if item.get("type") == type]
    if status and not (patientId and any(d.to_dict().get("status") == status for d in docs)):
        items = [item for item in items if item.get("status") == status]
    
    # Date filters in Python
    if date_from:
        date_from_ts = _iso_to_ts(date_from)
        items = [item for item in items if item.get("appointmentDate") and 
                datetime.fromisoformat(item["appointmentDate"].replace("Z", "+00:00")) >= date_from_ts]
    if date_to:
        date_to_ts = _iso_to_ts(date_to)
        items = [item for item in items if item.get("appointmentDate") and 
                datetime.fromisoformat(item["appointmentDate"].replace("Z", "+00:00")) <= date_to_ts]
    
    # Sort by appointmentDate in Python
    items.sort(key=lambda x: x.get("appointmentDate", ""), reverse=False)
    
    # Apply pagination
    if cursor:
        try:
            cursor_idx = next(i for i, item in enumerate(items) if item["id"] == cursor)
            items = items[cursor_idx + 1:]
        except StopIteration:
            items = []
    
    # Limit results
    paginated_items = items[:limit]
    next_cursor = paginated_items[-1]["id"] if len(paginated_items) == limit and len(items) > limit else None

    return {"items": paginated_items, "nextCursor": next_cursor, "hasMore": next_cursor is not None}


# UTIL: Serialize Firestore Timestamp → ISO
def _serialize_doc(doc):
    data = doc.to_dict()
    data["id"] = doc.id
    return _serialize(data)


def _serialize(data: dict):
    out = {}
    for k, v in data.items():
        if hasattr(v, "isoformat"):  # Firestore Timestamp -> Python datetime -> iso
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out
