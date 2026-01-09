# app/routes/evaluation_routes.py

from fastapi import APIRouter, Depends, HTTPException
from app.core.permissions import require_role
from app.core.auth_jwt import get_current_user
from app.core.firebase import db
from datetime import datetime
from app.schemas.evaluation_request_schema import (
    EvaluationRequestCreate,
    EvaluationRequestResponse
)

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])


def _get_evaluate_batch_task():
    """Lazy import to avoid importing detectron2 in FastAPI server"""
    from app.tasks.inference_tasks import evaluate_batch, re_evaluate_batch
    return evaluate_batch, re_evaluate_batch


@router.post("/batch/{batch_id}/start", dependencies=[Depends(require_role(["staff", "admin"]))])
def start_batch_evaluation(
    batch_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Start evaluation for a batch (first time)
    
    Creates evaluation request and triggers Celery task to process all frames
    """
    # Check if batch exists
    batch_doc = db.collection("retrievalBatches").document(batch_id).get()
    if not batch_doc.exists:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Check if evaluation request already exists
    existing = db.collection("evaluationRequests").where("batchId", "==", batch_id).limit(1).stream()
    if list(existing):
        raise HTTPException(status_code=400, detail="Evaluation already started for this batch. Use /re-evaluate to re-run.")
    
    # Create evaluation request
    eval_req_data = {
        "batchId": batch_id,
        "initiatedBy": current_user["userId"],
        "createdAt": datetime.utcnow(),
        "status": "pending",
        "frameList": [],
        "errorLog": None,
        "reportSummary": None
    }
    
    eval_req_ref = db.collection("evaluationRequests").document()
    eval_req_ref.set(eval_req_data)
    
    # Lazy import task
    evaluate_batch, _ = _get_evaluate_batch_task()
    
    # Start Celery task
    task = evaluate_batch.delay(batch_id)
    
    return {
        "evaluationRequestId": eval_req_ref.id,
        "taskId": task.id,
        "status": "started"
    }


@router.post("/batch/{batch_id}/re-evaluate", dependencies=[Depends(require_role(["staff", "admin"]))])
def re_evaluate_batch_route(
    batch_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Re-evaluate a batch (overwrite existing results)
    
    This will re-process all frames in the batch and overwrite existing detectionResults and evaluationResult
    """
    # Check if batch exists
    batch_doc = db.collection("retrievalBatches").document(batch_id).get()
    if not batch_doc.exists:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Find existing evaluation request or create new one
    existing_req = db.collection("evaluationRequests").where("batchId", "==", batch_id).limit(1).stream()
    eval_req_id = None
    for req in existing_req:
        eval_req_id = req.id
        break
    
    if eval_req_id:
        # Update existing evaluation request
        db.collection("evaluationRequests").document(eval_req_id).update({
            "status": "pending",
            "initiatedBy": current_user["userId"],
            "updatedAt": datetime.utcnow(),
            "errorLog": None,
            "frameList": []
        })
    else:
        # Create new evaluation request
        eval_req_data = {
            "batchId": batch_id,
            "initiatedBy": current_user["userId"],
            "createdAt": datetime.utcnow(),
            "status": "pending",
            "frameList": [],
            "errorLog": None,
            "reportSummary": None
        }
        eval_req_ref = db.collection("evaluationRequests").document()
        eval_req_ref.set(eval_req_data)
        eval_req_id = eval_req_ref.id
    
    # Lazy import task
    _, re_evaluate_batch = _get_evaluate_batch_task()
    
    # Start Celery task for re-evaluation
    task = re_evaluate_batch.delay(batch_id)
    
    return {
        "evaluationRequestId": eval_req_id,
        "taskId": task.id,
        "status": "re-evaluation_started",
        "message": "All frames will be re-processed and results will be overwritten"
    }


@router.get("/batch/{batch_id}/status")
def get_evaluation_status(batch_id: str):
    """
    Get evaluation status for a batch
    
    Returns:
        {
            "id": str,
            "batchId": str,
            "status": "pending" | "processing" | "completed" | "failed",
            "frameList": [...],
            "reportSummary": ...,
            "totalFrames": int,
            "completedFrames": int,
            "failedFrames": int,
            "progress": float,  # 0.0 - 1.0
            "batchStatus": str | None
        }
    """
    # 1) Load evaluation request (if any)
    eval_req_stream = db.collection("evaluationRequests").where(
        "batchId", "==", batch_id
    ).limit(1).stream()

    eval_doc = None
    for req in eval_req_stream:
        eval_doc = req
        break

    if not eval_doc:
        raise HTTPException(status_code=404, detail="Evaluation request not found")

    eval_data = eval_doc.to_dict() or {}

    # 2) Derive progress primarily from evaluationRequest.frameList (task-driven)
    frame_list = eval_data.get("frameList") or []
    total_frames = len(frame_list)
    completed_frames = 0
    failed_frames = 0

    if frame_list:
        for item in frame_list:
            status_val = str(item.get("status", "")).lower()
            if status_val in ("completed", "done"):
                completed_frames += 1
            elif status_val == "failed":
                failed_frames += 1

    # Fallback: if no frameList, derive from frames collection
    if total_frames == 0:
        frames_stream = db.collection("frames").where("batchId", "==", batch_id).stream()
        for fr in frames_stream:
            frame_data = fr.to_dict() or {}
            total_frames += 1

            # Completed if we already have evaluationResult or detectionResults
            if frame_data.get("evaluationResult") or frame_data.get("detectionResults"):
                completed_frames += 1
            elif frame_data.get("error"):
                failed_frames += 1

    progress = 0.0
    if total_frames > 0:
        # Treat both completed and failed as "processed"
        progress = (completed_frames + failed_frames) / total_frames

    # 3) Derive evaluation status (pending/processing/completed/failed)
    status = eval_data.get("status", "pending")

    # If not explicitly failed, derive from frames
    if status != "failed":
        if total_frames == 0:
            status = "pending"
        elif completed_frames == 0:
            status = "pending"
        elif completed_frames < total_frames:
            status = "processing"
        else:
            status = "completed"

    # 4) Also expose current batch status for UI
    batch_status = None
    batch_doc = db.collection("retrievalBatches").document(batch_id).get()
    if batch_doc.exists:
        batch_status = batch_doc.to_dict().get("status", status)

    # 5) Return enriched evaluation status
    return {
        "id": eval_doc.id,
        **eval_data,
        "status": status,
        "totalFrames": total_frames,
        "completedFrames": completed_frames,
        "failedFrames": failed_frames,
        "progress": progress,
        "batchStatus": batch_status,
    }