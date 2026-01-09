from fastapi import HTTPException
from app.core.firebase import db
from datetime import datetime


def get_evaluation_history(patient_id: str):
    egg_docs = (
        db.collection("eggRecords")
        .where("patientId", "==", patient_id)
        .stream()
    )

    records = []
    for er in egg_docs:
        e = er.to_dict()
        batch_id = e["batchId"]
        
        eligibility_status = e.get("eligibilityStatus")
        if eligibility_status != "approved":
            continue

        batch_doc = db.collection("retrievalBatches").document(batch_id).get()
        if not batch_doc.exists:
            continue

        batch = batch_doc.to_dict()

        frames_docs = db.collection("frames").where("batchId", "==", batch_id).stream()
        frames = []
        for f in frames_docs:
            fr = f.to_dict()
            frames.append({
                "id": f.id,
                "frameURL": fr.get("frameURL", "")
            })

        retrieval_date = batch.get("createdAt")
        if hasattr(retrieval_date, "isoformat"):
            retrieval_date = retrieval_date.isoformat()
        elif isinstance(retrieval_date, str):
            pass
        else:
            retrieval_date = None

        records.append({
            "batchId": batch_id,
            "retrievalDate": retrieval_date,
            "miiEggs": e.get("miiEggs", 0),
            "miEggs": e.get("miEggs", 0),
            "suggestedEligibility": e.get("suggestedEligibility"),
            "frames": frames
        })

    return {
        "patientId": patient_id,
        "history": records
    }
