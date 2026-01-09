from datetime import datetime
from fastapi import HTTPException
from app.core.firebase import db
from app.schemas.egg_record_schema import EggRecordCreate, EggRecordUpdate


# Create new eggRecord
def create_egg_record(data: EggRecordCreate):
    ref = db.collection("eggRecords").document()

    record_data = {
        "patientId": data.patientId,
        "batchId": data.batchId,
        "miiEggs": data.miiEggs,
        "miEggs": data.miEggs,
        "total": data.total,
        "suggestedEligibility": data.suggestedEligibility,
        "eligibilityStatus": data.eligibilityStatus or "pending",
        "approvedBy": data.approvedBy,
        "approvedAt": data.approvedAt,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }

    ref.set(record_data)
    return {"id": ref.id, **record_data}


# Get single eggRecord
def get_egg_record(record_id: str):
    doc = db.collection("eggRecords").document(record_id).get()

    if not doc.exists:
        raise HTTPException(404, "Egg record not found")

    return {"id": doc.id, **doc.to_dict()}


# Get eggRecords by patient
def get_egg_records_by_patient(patient_id: str):
    docs = db.collection("eggRecords") \
        .where("patientId", "==", patient_id) \
        .stream()

    return [{"id": d.id, **d.to_dict()} for d in docs]


# Get eggRecords by batchId
def get_egg_records_by_batch(batch_id: str):
    docs = db.collection("eggRecords") \
        .where("batchId", "==", batch_id) \
        .stream()

    return [{"id": d.id, **d.to_dict()} for d in docs]


# Update eggRecord (AI re-run)
def update_egg_record(record_id: str, data: EggRecordUpdate):
    update_data = data.dict(exclude_none=True)
    update_data["updatedAt"] = datetime.utcnow()

    db.collection("eggRecords").document(record_id).update(update_data)

    return {"status": "updated"}


# Delete eggRecord permanently
def delete_egg_record(record_id: str):
    doc = db.collection("eggRecords").document(record_id).get()

    if not doc.exists:
        raise HTTPException(404, "Egg record not found")

    db.collection("eggRecords").document(record_id).delete()
    return {"status": "deleted"}
