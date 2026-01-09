from fastapi import HTTPException
from app.core.firebase import db
from datetime import datetime


def get_patient_journey(user_id: str):
    doc = db.collection("patients").document(user_id).get()
    if not doc.exists:
        raise HTTPException(404, "Patient not found")

    p = doc.to_dict()
    role = p.get("role")
    current_stage = p.get("stage", "registration")

    stage = {
        "registration": "done",
        "medicalHistory": "pending",
        "appointment": "pending",
        "retrieval": "pending",
        "eligibility": "pending"
    }

    stage_order = ["registration", "medicalHistory", "appointment", "retrieval", "eligibility"]
    current_index = stage_order.index(current_stage) if current_stage in stage_order else 0
    
    for i in range(current_index + 1):
        stage[stage_order[i]] = "done"

    appointments = []
    app_docs = db.collection("appointments").where("patientId", "==", user_id).stream()
    for d in app_docs:
        a = d.to_dict()
        serialized = {"id": d.id}
        for k, v in a.items():
            if hasattr(v, "isoformat"):
                serialized[k] = v.isoformat()
            else:
                serialized[k] = v
        appointments.append(serialized)

    # --------------------------------------
    # Retrieval Batches
    # --------------------------------------
    batches = []
    batch_docs = (
        db.collection("retrievalBatches")
        .where("patientId", "==", user_id)
        .stream()
    )

    for d in batch_docs:
        b = d.to_dict()
        # Serialize datetime fields and ensure status exists
        serialized = {"id": d.id, "status": b.get("status", "pending")}
        for k, v in b.items():
            if hasattr(v, "isoformat"):  # Firestore Timestamp
                serialized[k] = v.isoformat()
            elif k == "resultSummary" and isinstance(v, dict):
                serialized[k] = v  # Keep dict as is
            else:
                serialized[k] = v
        batches.append(serialized)

    if not batches:
        stage["retrieval"] = "pending"
    else:
        # Sort by createdAt (handle both datetime and ISO string)
        def get_created_at(batch):
            created_at = batch.get("createdAt")
            if isinstance(created_at, str):
                try:
                    return datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                except:
                    return datetime.min
            elif hasattr(created_at, "isoformat"):
                return created_at
            return datetime.min
        
        latest_batch = sorted(batches, key=get_created_at, reverse=True)[0]
        if latest_batch.get("status") == "completed":
            stage["retrieval"] = "done"
        else:
            stage["retrieval"] = "active"

    # --------------------------------------
    # Egg Records
    # --------------------------------------
    egg_records = []
    egg_docs = (
        db.collection("eggRecords")
        .where("patientId", "==", user_id)
        .stream()
    )

    for d in egg_docs:
        r = d.to_dict()
        # Serialize datetime fields
        serialized = {"id": d.id}
        for k, v in r.items():
            if hasattr(v, "isoformat"):  # Firestore Timestamp
                serialized[k] = v.isoformat()
            else:
                serialized[k] = v
        egg_records.append(serialized)

    # --------------------------------------
    # Eligibility logic (donor vs recipient)
    # --------------------------------------
    e_score = None
    e_rule = None

    if not egg_records:
        stage["eligibility"] = "pending"
    else:
        # Sort by createdAt (handle both datetime and ISO string)
        def get_created_at(record):
            created_at = record.get("createdAt")
            if isinstance(created_at, str):
                try:
                    return datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                except:
                    return datetime.min
            elif hasattr(created_at, "isoformat"):
                return created_at
            return datetime.min
        
        latest = sorted(egg_records, key=get_created_at, reverse=True)[0]

        # Use new field names: miiEggs (likely reproducible) and miEggs (unlikely reproducible)
        mii = latest.get("miiEggs", 0) or 0
        mi = latest.get("miEggs", 0) or 0
        total = latest.get("total", 0) or (mii + mi) or 1

        # Check if eligibilityStatus is approved - if yes, always "done"
        eligibility_status = latest.get("eligibilityStatus")
        if eligibility_status == "approved":
            stage["eligibility"] = "done"
            
            if role == "donor":
                e_score = mii / total if total > 0 else 0
                e_rule = "Donor is eligible at ≥70% likely reproducible eggs"
            elif role == "recipient":
                e_score = mi / total if total > 0 else 0
                e_rule = "Recipient is eligible at ≥90% unlikely reproducible eggs"
            else:
                e_score = None
                e_rule = None
        else:
            # If not approved yet, keep as pending (will be overridden by stage_order logic if current_stage >= eligibility)
            stage["eligibility"] = "pending"
            e_score = None
            e_rule = None

    return {
        "patientId": user_id,
        "fullName": p.get("fullName"),
        "role": role,
        "stage": stage,
        "appointments": appointments,
        "batches": batches,
        "eggRecords": egg_records,
        "eligibilityScore": e_score,
        "eligibilityRule": e_rule
    }
