# app/services/frame_service.py

import os
from datetime import datetime
from fastapi import UploadFile, HTTPException
from app.core.firebase import db
from app.schemas.frame_schema import FrameUpdate

STORAGE_DIR = os.getenv("LOCAL_STORAGE_DIR", "storage")


# Save file to local storage
def save_frame_file(batch_id: str, frame_id: str, file: UploadFile) -> str:
    # Ensure batch directory exists
    batch_dir = os.path.join(STORAGE_DIR, batch_id)
    os.makedirs(batch_dir, exist_ok=True)

    # Only jpg allowed
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png"]:
        raise HTTPException(400, "Invalid file format")

    final_path = os.path.join(batch_dir, f"{frame_id}.jpg")

    # Save file
    with open(final_path, "wb") as buffer:
        buffer.write(file.file.read())

    return final_path


# Create frame
def create_frame(batch_id: str, patient_id: str, user_id: str, file: UploadFile):
    frame_ref = db.collection("frames").document()

    local_file_path = save_frame_file(batch_id, frame_ref.id, file)

    frame_data = {
        "batchId": batch_id,
        "patientId": patient_id,
        "uploadedBy": user_id,
        "uploadedAt": datetime.utcnow(),
        "frameURL": local_file_path,  # store actual local path
        "evaluationResult": None
    }

    frame_ref.set(frame_data)
    return {"id": frame_ref.id, **frame_data}


# Get frames in a batch
def get_frames_by_batch(batch_id: str):
    docs = db.collection("frames").where("batchId", "==", batch_id).stream()
    frames = []
    for doc in docs:
        data = doc.to_dict()
        
        # Remove status field if it exists (we only use evaluationResult.maturity)
        if "status" in data:
            del data["status"]
        
        # Extract maturity from evaluationResult if exists
        maturity = None
        if "evaluationResult" in data and data["evaluationResult"]:
            eval_result = data["evaluationResult"]
            if isinstance(eval_result, dict) and "maturity" in eval_result:
                maturity = eval_result["maturity"]
        
        frame_data = {
            "id": doc.id,
            "frameId": doc.id,  # Add frameId for compatibility
            "maturity": maturity,  # Set maturity from evaluationResult
            **data
        }
        frames.append(frame_data)
    return frames


# Update frame
def update_frame(frame_id: str, data: FrameUpdate):
    update_data = data.dict(exclude_none=True)

    # Set evaluatedAt timestamp for evaluationResult
    if "evaluationResult" in update_data and update_data["evaluationResult"]:
        if isinstance(update_data["evaluationResult"], dict):
            update_data["evaluationResult"]["evaluatedAt"] = datetime.utcnow()

    db.collection("frames").document(frame_id).update(update_data)
    return {"status": "updated"}


# Delete frame (permanent)
def delete_frame(frame_id: str):
    doc = db.collection("frames").document(frame_id).get()
    if not doc.exists:
        raise HTTPException(404, "Frame not found")

    data = doc.to_dict()
    file_path = data["frameURL"]

    if os.path.exists(file_path):
        os.remove(file_path)

    db.collection("frames").document(frame_id).delete()
    return {"status": "deleted"}