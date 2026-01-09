import os
from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from app.core.firebase import db
from app.schemas.retrieval_batch_schema import (
    BatchCreate, BatchUpdate, BatchResponse, BatchResultSummary
)


# Create batch
def create_batch(data: BatchCreate, user_id: str):
    batch_ref = db.collection("retrievalBatches").document()

    batch_data = {
        "patientId": data.patientId,
        "notes": data.notes,
        "createdBy": user_id,
        "createdAt": datetime.utcnow(),
        "status": "pending",
        "resultSummary": {
            "totalFrames": 0,
            "mii": None,
            "mi": None,
            "evaluationReportURL": None
        }
    }

    batch_ref.set(batch_data)
    return {"id": batch_ref.id, **batch_data}


# Get single batch
def get_batch(batch_id: str):
    doc = db.collection("retrievalBatches").document(batch_id).get()
    if not doc.exists:
        raise HTTPException(404, "Batch not found")

    data = doc.to_dict()
    patient_id = data.get("patientId")
    
    # Fetch patient info
    patient_name = None
    patient_role = None
    if patient_id:
        patient_doc = db.collection("patients").document(patient_id).get()
        if patient_doc.exists:
            patient_data = patient_doc.to_dict()
            patient_name = patient_data.get("fullName")
            patient_role = patient_data.get("role")  # donor | recipient
    
    # Ensure status field exists
    if "status" not in data:
        data["status"] = "pending"
    
    # Count actual frames for this batch
    frames = db.collection("frames").where("batchId", "==", batch_id).stream()
    total_frames = sum(1 for _ in frames)
    
    # Count evaluated frames
    frames_for_count = db.collection("frames").where("batchId", "==", batch_id).stream()
    mii_count = 0
    mi_count = 0
    for frame in frames_for_count:
        frame_data = frame.to_dict()
        eval_result = frame_data.get("evaluationResult")
        if eval_result and isinstance(eval_result, dict):
            maturity = eval_result.get("maturity")
            if maturity == "MII":
                mii_count += 1
            elif maturity == "MI":
                mi_count += 1
    
    # Update data with actual counts
    data["totalFrames"] = total_frames
    if "resultSummary" not in data:
        data["resultSummary"] = {}
    data["resultSummary"]["total"] = total_frames
    data["resultSummary"]["mii"] = mii_count
    data["resultSummary"]["mi"] = mi_count
    
    # Calculate eligibility percentage and status (only if there are evaluated frames)
    eligibility_percentage = None
    suggested_eligibility = None
    if patient_role and total_frames > 0 and (mii_count > 0 or mi_count > 0):
        if patient_role == "donor":
            eligibility_percentage = (mii_count / total_frames) * 100 if total_frames > 0 else 0
            suggested_eligibility = "eligible" if eligibility_percentage >= 70 else "notEligible"
        elif patient_role == "recipient":
            eligibility_percentage = (mi_count / total_frames) * 100 if total_frames > 0 else 0
            suggested_eligibility = "eligible" if eligibility_percentage >= 90 else "notEligible"
        
        # Always update if we have evaluation results (mii_count or mi_count > 0)
        # This ensures the values are refreshed after AI evaluation
        db.collection("retrievalBatches").document(doc.id).update({
            "suggestedEligibility": suggested_eligibility,
            "eligibilityPercentage": eligibility_percentage,
            "eligibilityStatus": data.get("eligibilityStatus", "pending")
        })
        data["suggestedEligibility"] = suggested_eligibility
        data["eligibilityPercentage"] = eligibility_percentage
        data["eligibilityStatus"] = data.get("eligibilityStatus", "pending")
    
    result = {
        "id": doc.id,
        "patientName": patient_name,
        "patientRole": patient_role,
        "eligibilityPercentage": data.get("eligibilityPercentage") or eligibility_percentage,
        "suggestedEligibility": data.get("suggestedEligibility") or suggested_eligibility,
        **data
    }
    
    return result


# Get batches by patient
def get_batches_by_patient(patient_id: str):
    docs = db.collection("retrievalBatches").where("patientId", "==", patient_id).stream()
    batches = []
    for d in docs:
        data = d.to_dict()
        batch_id = d.id
        
        # Ensure status field exists
        if "status" not in data:
            data["status"] = "pending"
        
        # Count actual frames for this batch
        frames = db.collection("frames").where("batchId", "==", batch_id).stream()
        total_frames = sum(1 for _ in frames)
        
        # Count evaluated frames
        frames_for_count = db.collection("frames").where("batchId", "==", batch_id).stream()
        mii_count = 0
        mi_count = 0
        for frame in frames_for_count:
            frame_data = frame.to_dict()
            eval_result = frame_data.get("evaluationResult")
            if eval_result and isinstance(eval_result, dict):
                maturity = eval_result.get("maturity")
                if maturity == "MII":
                    mii_count += 1
                elif maturity == "MI":
                    mi_count += 1
        
        # Update data with actual counts
        data["totalFrames"] = total_frames
        if "resultSummary" not in data:
            data["resultSummary"] = {}
        data["resultSummary"]["total"] = total_frames
        data["resultSummary"]["mii"] = mii_count
        data["resultSummary"]["mi"] = mi_count
        
        batches.append({"id": batch_id, **data})
    return batches


# Update batch
def update_batch(batch_id: str, update_data: BatchUpdate):
    data = update_data.dict(exclude_none=True)
    data["updatedAt"] = datetime.utcnow()

    db.collection("retrievalBatches").document(batch_id).update(data)
    return {"status": "updated"}


# Delete batch permanently
def delete_batch(batch_id: str):
    # Remove associated frames
    frames = db.collection("frames").where("batchId", "==", batch_id).stream()
    for f in frames:
        f_data = f.to_dict()
        file_path = f_data["frameURL"]     # e.g., storage/{batch}/{frame}.jpg

        # remove file from local storage
        if os.path.exists(file_path):
            os.remove(file_path)

        db.collection("frames").document(f.id).delete()

    # Remove batch
    db.collection("retrievalBatches").document(batch_id).delete()
    return {"status": "deleted"}


# Approve or reject batch eligibility
def approve_batch_eligibility(batch_id: str, approved: bool, notes: Optional[str], approved_by: str):
    batch_doc = db.collection("retrievalBatches").document(batch_id).get()
    if not batch_doc.exists:
        raise HTTPException(404, "Batch not found")
    
    batch_data = batch_doc.to_dict()
    patient_id = batch_data.get("patientId")
    
    update_data = {
        "eligibilityStatus": "approved" if approved else "rejected",
        "approvedBy": approved_by,
        "approvedAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    if notes:
        update_data["notes"] = notes
    
    db.collection("retrievalBatches").document(batch_id).update(update_data)
    
    from app.services.egg_record_service import get_egg_records_by_batch
    egg_records = get_egg_records_by_batch(batch_id)
    if egg_records:
        record_id = egg_records[0]["id"]
        db.collection("eggRecords").document(record_id).update({
            "eligibilityStatus": "approved" if approved else "rejected",
            "approvedBy": approved_by,
            "approvedAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        })
    
    if approved:
        from app.services.patient_service import _update_patient_stage
        _update_patient_stage(patient_id, "eligibility")
    
    return {"status": "approved" if approved else "rejected", "batchId": batch_id}
