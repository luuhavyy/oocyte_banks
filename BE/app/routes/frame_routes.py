from fastapi import APIRouter, Depends, UploadFile, HTTPException, Query
from fastapi.responses import FileResponse
from app.core.auth_jwt import get_current_user
from app.schemas.frame_schema import FrameUpdate, FrameResponse
from app.services.frame_service import (
    create_frame, get_frames_by_batch, update_frame, delete_frame
)
from app.core.firebase import db
from typing import Optional, Dict, Any
import os

router = APIRouter(prefix="/frames", tags=["Frames"])


@router.post("/{batchId}", response_model=FrameResponse)
def upload_frame(batchId: str, file: UploadFile, user=Depends(get_current_user)):
    # Get patient_id from batch
    batch_doc = db.collection("retrievalBatches").document(batchId).get()
    if not batch_doc.exists:
        raise HTTPException(status_code=404, detail="Batch not found")
    batch_data = batch_doc.to_dict()
    patient_id = batch_data.get("patientId")
    if not patient_id:
        raise HTTPException(status_code=400, detail="Batch has no patient ID")
    return create_frame(batchId, patient_id, user["userId"], file)


@router.get("/batch/{batchId}", response_model=list[FrameResponse])
def get_batch_frames(batchId: str):
    return get_frames_by_batch(batchId)


@router.patch("/{frameId}")
def update_frame_route(frameId: str, data: FrameUpdate):
    return update_frame(frameId, data)


@router.delete("/{frameId}")
def delete_frame_route(frameId: str):
    return delete_frame(frameId)


@router.get("/view/{frame_id}")
async def get_frame_image(
    frame_id: str,
    t: Optional[int] = Query(None, description="Timestamp for cache busting"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Serves a frame image from the local file system based on frame ID.
    
    Args:
        frame_id: The ID of the frame to retrieve
        t: Optional timestamp for cache busting
        current_user: The authenticated user
        
    Returns:
        The frame image file
    """
    try:
        # Get frame data from Firestore
        frame_doc = db.collection('frames').document(frame_id).get()
        
        if not frame_doc.exists:
            raise HTTPException(status_code=404, detail="Frame not found")
        
        frame_data = frame_doc.to_dict()
        frame_url = frame_data.get('frameURL')
        
        if not frame_url:
            raise HTTPException(status_code=404, detail="Frame URL not found")
        
        # Get absolute file path
        # frameURL format: "storage/batchId/frameId.jpg"
        if frame_url.startswith('storage/'):
            # Remove 'storage/' prefix and get local path
            relative_path = frame_url.replace('storage/', '')
            from app.config import settings
            file_path = os.path.join(settings.LOCAL_STORAGE_DIR, relative_path)
        else:
            # If absolute path already
            file_path = frame_url
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Frame file not found: {file_path}")
        
        # Return file with proper headers
        return FileResponse(
            file_path,
            media_type="image/jpeg",
            headers={
                "Cache-Control": "public, max-age=3600",
                "Access-Control-Allow-Origin": "*"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving frame: {str(e)}")
