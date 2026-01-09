# app/tasks/inference_tasks.py

import os
from typing import Dict, List
from datetime import datetime
from celery import Task
from app.tasks.celery_app import celery_app
from app.core.firebase import db
from app.config import settings

# Import services (model_service will lazy import detectron2)
from app.services.model_service import run_inference
from app.services.evaluation_service import create_evaluation_result


class InferenceTask(Task):
    """Base task class with error handling"""
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        # Update frame with error on failure (no status field)
        frame_id = args[0] if args else kwargs.get("frame_id")
        if frame_id:
            try:
                db.collection("frames").document(frame_id).update({
                    "error": str(exc),
                    "updatedAt": datetime.utcnow()
                })
            except:
                pass


@celery_app.task(base=InferenceTask, name="process_single_frame")
def process_single_frame(frame_id: str, frame_path: str, force: bool = False):
    """
    Process a single frame: inference + evaluation
    
    Args:
        frame_id: Firestore frame document ID
        frame_path: Local path to frame image
        force: If True, overwrite existing results
        
    Returns:
        {
            "frame_id": str,
            "status": "completed",
            "maturity": "MII" | "MI"
        }
    """
    try:
        # Run inference (detectron2 will be imported here)
        detection_results = run_inference(frame_path)
        detection_results["modelVersion"] = settings.MODEL_VERSION
        
        # Create evaluation result
        evaluation_result = create_evaluation_result(detection_results)
        
        # Determine maturity status
        maturity = evaluation_result["maturity"]
        
        # Update frame in Firestore (will overwrite existing results)
        # Note: maturity is stored in evaluationResult.maturity, not in status field
        update_data = {
            "detectionResults": detection_results,
            "evaluationResult": evaluation_result,
            "updatedAt": datetime.utcnow()
        }
        
        db.collection("frames").document(frame_id).update(update_data)
        
        return {
            "frame_id": frame_id,
            "status": "completed",
            "maturity": maturity
        }
        
    except Exception as e:
        # Update frame with error (no status field, only error message)
        db.collection("frames").document(frame_id).update({
            "error": str(e),
            "updatedAt": datetime.utcnow()
        })
        raise


@celery_app.task(name="process_batch_frames")
def process_batch_frames(batch_id: str, frame_ids: List[str], force: bool = False):
    """
    Process all frames in a batch at once (faster than processing one by one)
    Model is loaded once and reused for all frames
    
    Args:
        batch_id: Batch ID
        frame_ids: List of frame IDs to process
        force: If True, overwrite existing results
        
    Returns:
        {
            "batch_id": str,
            "processed_count": int,
            "success_count": int,
            "failed_count": int
        }
    """
    processed_count = 0
    success_count = 0
    failed_count = 0

    # Try to load evaluation request once so we can update per-frame status for progress
    eval_req_id = None
    eval_frame_list: List[Dict] = []
    try:
        eval_req_stream = db.collection("evaluationRequests").where(
            "batchId", "==", batch_id
        ).limit(1).stream()
        for req in eval_req_stream:
            eval_req_id = req.id
            data = req.to_dict() or {}
            eval_frame_list = data.get("frameList", []) or []
            break
    except Exception as e:
        print(f"Warning: Failed to load evaluationRequest for batch {batch_id}: {e}")
    
    # Pre-load frame paths and check which frames need processing
    frame_paths = {}
    frames_to_process = []
    
    if not force:
        for frame_id in frame_ids:
            frame_doc = db.collection("frames").document(frame_id).get()
            if frame_doc.exists:
                frame_data = frame_doc.to_dict()
                if "detectionResults" in frame_data:
                    processed_count += 1
                    continue
            frames_to_process.append(frame_id)
            frame_paths[frame_id] = get_frame_path(frame_id)
    else:
        frames_to_process = frame_ids
        for frame_id in frame_ids:
            frame_paths[frame_id] = get_frame_path(frame_id)
    
    # Process all frames in batch (model will be loaded once via singleton)
    for frame_id in frames_to_process:
        try:
            frame_path = frame_paths[frame_id]
            
            # Run inference (reuses loaded model)
            detection_results = run_inference(frame_path)
            detection_results["modelVersion"] = settings.MODEL_VERSION
            
            # Create evaluation result
            evaluation_result = create_evaluation_result(detection_results)
            
            # Update frame in Firestore
            update_data = {
                "detectionResults": detection_results,
                "evaluationResult": evaluation_result,
                "updatedAt": datetime.utcnow()
            }
            
            db.collection("frames").document(frame_id).update(update_data)
            success_count += 1

            # Update in-memory frameList (don't write to DB yet - optimize: write once at the end)
            if eval_req_id and eval_frame_list:
                for item in eval_frame_list:
                    if item.get("frameId") == frame_id:
                        item["status"] = "completed"
                        break
                        
        except Exception as e:
            # Update frame with error
            try:
                db.collection("frames").document(frame_id).update({
                    "error": str(e),
                    "updatedAt": datetime.utcnow()
                })
            except Exception:
                pass
            failed_count += 1

            # Update in-memory frameList (don't write to DB yet)
            if eval_req_id and eval_frame_list:
                for item in eval_frame_list:
                    if item.get("frameId") == frame_id:
                        item["status"] = "failed"
                        break
    
    # OPTIMIZATION: Update evaluationRequest only ONCE after all frames processed
    if eval_req_id and eval_frame_list:
        try:
            db.collection("evaluationRequests").document(eval_req_id).update({
                "frameList": eval_frame_list,
                "updatedAt": datetime.utcnow(),
            })
        except Exception as e:
            print(f"Warning: Failed to update evaluationRequest frame status: {e}")
    
    batch_status = "pending"
    if failed_count == 0 and success_count > 0:
        batch_status = "completed"
    elif failed_count > 0 and success_count == 0:
        batch_status = "failed"
    elif success_count > 0:
        batch_status = "completed"
    
    try:
        db.collection("retrievalBatches").document(batch_id).update({
            "status": batch_status,
            "updatedAt": datetime.utcnow()
        })
    except Exception as e:
        print(f"Warning: Failed to update batch status: {e}")
    
    if batch_status == "completed" and success_count > 0:
        try:
            batch_doc = db.collection("retrievalBatches").document(batch_id).get()
            batch_data = batch_doc.to_dict() if batch_doc.exists else {}
            patient_id = batch_data.get("patientId")
            
            if not patient_id:
                print(f"Warning: No patientId found for batch {batch_id}")
            else:
                patient_doc = db.collection("patients").document(patient_id).get()
                patient_role = None
                if patient_doc.exists:
                    patient_role = patient_doc.to_dict().get("role")
                
                frames_for_count = db.collection("frames").where("batchId", "==", batch_id).stream()
                mii_count = 0
                mi_count = 0
                total_frames = 0
                for frame in frames_for_count:
                    total_frames += 1
                    frame_data = frame.to_dict()
                    eval_result = frame_data.get("evaluationResult")
                    if eval_result and isinstance(eval_result, dict):
                        maturity = eval_result.get("maturity")
                        if maturity == "MII":
                            mii_count += 1
                        elif maturity == "MI":
                            mi_count += 1
                
                if total_frames > 0:
                    eligibility_percentage = None
                    suggested_eligibility = None
                    
                    if patient_role:
                        if patient_role == "donor":
                            eligibility_percentage = (mii_count / total_frames) * 100
                            suggested_eligibility = "eligible" if eligibility_percentage >= 70 else "notEligible"
                        elif patient_role == "recipient":
                            eligibility_percentage = (mi_count / total_frames) * 100
                            suggested_eligibility = "eligible" if eligibility_percentage >= 90 else "notEligible"
                        
                        if suggested_eligibility:
                            try:
                                db.collection("retrievalBatches").document(batch_id).update({
                                    "suggestedEligibility": suggested_eligibility,
                                    "eligibilityPercentage": eligibility_percentage,
                                    "eligibilityStatus": "pending"
                                })
                            except Exception as e:
                                print(f"Warning: Failed to update batch suggestedEligibility: {e}")
                    
                    existing_records = db.collection("eggRecords").where("batchId", "==", batch_id).stream()
                    record_list = list(existing_records)
                    
                    try:
                        if record_list:
                            record_id = record_list[0].id
                            update_data = {
                                "miiEggs": mii_count,
                                "miEggs": mi_count,
                                "total": total_frames,
                                "eligibilityStatus": "pending",
                                "updatedAt": datetime.utcnow()
                            }
                            if suggested_eligibility:
                                update_data["suggestedEligibility"] = suggested_eligibility
                            db.collection("eggRecords").document(record_id).update(update_data)
                            print(f"Updated eggRecord {record_id} for batch {batch_id}")
                        else:
                            from app.schemas.egg_record_schema import EggRecordCreate
                            record_data = {
                                "patientId": patient_id,
                                "batchId": batch_id,
                                "miiEggs": mii_count,
                                "miEggs": mi_count,
                                "total": total_frames,
                                "eligibilityStatus": "pending"
                            }
                            if suggested_eligibility:
                                record_data["suggestedEligibility"] = suggested_eligibility
                            from app.services.egg_record_service import create_egg_record
                            result = create_egg_record(EggRecordCreate(**record_data))
                            print(f"Created eggRecord {result.get('id')} for batch {batch_id}")
                    except Exception as e:
                        print(f"Error: Failed to create/update eggRecord for batch {batch_id}: {e}")
                        import traceback
                        traceback.print_exc()
        except Exception as e:
            print(f"Error: Failed to process batch completion for {batch_id}: {e}")
            import traceback
            traceback.print_exc()
    
    try:
        eval_req = db.collection("evaluationRequests").where("batchId", "==", batch_id).limit(1).stream()
        eval_req_id = None
        for req in eval_req:
            eval_req_id = req.id
            break
        
        if eval_req_id:
            if failed_count == 0 and success_count > 0:
                status = "completed"
            elif failed_count > 0 and success_count == 0:
                status = "failed"
            elif success_count > 0:
                status = "completed"
            else:
                status = "processing"
            
            db.collection("evaluationRequests").document(eval_req_id).update({
                "status": status,
                "updatedAt": datetime.utcnow()
            })
    except Exception as e:
        print(f"Warning: Failed to update evaluationRequest status: {e}")
    
    return {
        "batch_id": batch_id,
        "processed_count": processed_count,
        "success_count": success_count,
        "failed_count": failed_count
    }


@celery_app.task(name="evaluate_batch")
def evaluate_batch(batch_id: str):
    """
    Evaluate entire batch: process all frames and generate summary
    Only processes frames that don't have detectionResults yet
    
    Args:
        batch_id: Batch ID
        
    Returns:
        {
            "batch_id": str,
            "frames_to_process": int,
            "total_frames": int
        }
    """
    try:
        # Get all frames for batch
        frames_ref = db.collection("frames")
        frames = frames_ref.where("batchId", "==", batch_id).stream()
        
        frame_list = []
        frame_ids = []
        
        for frame in frames:
            frame_data = frame.to_dict()
            frame_id = frame.id
            
            # Check if frame needs processing (only if no detectionResults)
            if "detectionResults" not in frame_data:
                frame_ids.append(frame_id)
            
            # Determine status from evaluationResult
            status = "pending"
            if "evaluationResult" in frame_data and frame_data["evaluationResult"]:
                status = "completed"
            elif "error" in frame_data:
                status = "failed"
            
            frame_list.append({
                "frameId": frame_id,
                "frameURL": frame_data.get("frameURL", ""),
                "status": status
            })
        
        # Update evaluation request with frame list
        eval_req = db.collection("evaluationRequests").where("batchId", "==", batch_id).limit(1).stream()
        eval_req_id = None
        for req in eval_req:
            eval_req_id = req.id
            break
        
        if eval_req_id:
            db.collection("evaluationRequests").document(eval_req_id).update({
                "frameList": frame_list,
                "status": "processing",
                "updatedAt": datetime.utcnow()
            })
        
        # Update batch status to processing when evaluation starts
        try:
            db.collection("retrievalBatches").document(batch_id).update({
                "status": "processing",
                "updatedAt": datetime.utcnow()
            })
        except Exception as e:
            print(f"Warning: Failed to update batch status to processing: {e}")
        
        # Process frames that need inference
        if frame_ids:
            process_batch_frames.delay(batch_id, frame_ids, force=False)
        elif len(frame_list) > 0:
            # All frames already processed, mark as completed
            try:
                db.collection("retrievalBatches").document(batch_id).update({
                    "status": "completed",
                    "updatedAt": datetime.utcnow()
                })
                if eval_req_id:
                    db.collection("evaluationRequests").document(eval_req_id).update({
                        "status": "completed",
                        "updatedAt": datetime.utcnow()
                    })
            except Exception as e:
                print(f"Warning: Failed to update batch status: {e}")
        
        return {
            "batch_id": batch_id,
            "frames_to_process": len(frame_ids),
            "total_frames": len(frame_list)
        }
        
    except Exception as e:
        # Update evaluation request with error
        if eval_req_id:
            db.collection("evaluationRequests").document(eval_req_id).update({
                "status": "failed",
                "errorLog": str(e),
                "updatedAt": datetime.utcnow()
            })
        raise


@celery_app.task(name="re_evaluate_batch")
def re_evaluate_batch(batch_id: str):
    """
    Re-evaluate entire batch: process ALL frames and overwrite existing results
    
    Args:
        batch_id: Batch ID
        
    Returns:
        {
            "batch_id": str,
            "frames_to_process": int,
            "total_frames": int
        }
    """
    try:
        # Get all frames for batch
        frames_ref = db.collection("frames")
        frames = frames_ref.where("batchId", "==", batch_id).stream()
        
        frame_list = []
        frame_ids = []
        
        for frame in frames:
            frame_data = frame.to_dict()
            frame_id = frame.id
            
            # Re-process ALL frames (force=True)
            frame_ids.append(frame_id)
            
            frame_list.append({
                "frameId": frame_id,
                "frameURL": frame_data.get("frameURL", ""),
                "status": "pending"  # Status for evaluation request tracking
            })
        
        # Update evaluation request with frame list
        eval_req = db.collection("evaluationRequests").where("batchId", "==", batch_id).limit(1).stream()
        eval_req_id = None
        for req in eval_req:
            eval_req_id = req.id
            break
        
        if eval_req_id:
            db.collection("evaluationRequests").document(eval_req_id).update({
                "frameList": frame_list,
                "status": "processing",
                "updatedAt": datetime.utcnow()
            })
        
        # Process ALL frames with force=True to overwrite
        if frame_ids:
            process_batch_frames.delay(batch_id, frame_ids, force=True)
        
        return {
            "batch_id": batch_id,
            "frames_to_process": len(frame_ids),
            "total_frames": len(frame_list),
            "re_evaluation": True
        }
        
    except Exception as e:
        # Update evaluation request with error
        if eval_req_id:
            db.collection("evaluationRequests").document(eval_req_id).update({
                "status": "failed",
                "errorLog": str(e),
                "updatedAt": datetime.utcnow()
            })
        raise


def get_frame_path(frame_id: str) -> str:
    """
    Get local file path for frame
    
    Args:
        frame_id: Frame document ID
        
    Returns:
        Local file path
    """
    frame_doc = db.collection("frames").document(frame_id).get()
    if not frame_doc.exists:
        raise ValueError(f"Frame {frame_id} not found")
    
    frame_data = frame_doc.to_dict()
    frame_url = frame_data.get("frameURL", "")
    
    # Convert storage path to local path if needed
    if frame_url.startswith("storage/"):
        return os.path.join(settings.LOCAL_STORAGE_DIR, frame_url.replace("storage/", ""))
    
    return frame_url