# app/services/model_service.py

import os
import cv2
import torch
import numpy as np
from typing import Dict, Optional
from app.config import settings
from datetime import datetime

# Global model instance (singleton)
_predictor: Optional[object] = None

# Model class names (4 classes from training)
CLASS_NAMES = ["Polar-Body", "cytoplasm", "oocyte", "polarbody"]

# Mapping for normalized class names
CLASS_MAPPING = {
    "Polar-Body": "polar-body",  # Original image, not actual PB
    "polarbody": "polarbody",     # Actual polar body for MI/MII evaluation
    "cytoplasm": "cytoplasm",
    "oocyte": "oocyte"
}


def _import_detectron2():
    """Lazy import detectron2 - only when needed"""
    try:
        from detectron2.config import get_cfg
        from detectron2.engine import DefaultPredictor
        from detectron2 import model_zoo
        return get_cfg, DefaultPredictor, model_zoo
    except ImportError:
        raise ImportError(
            "detectron2 is not installed. "
            "Please install it in the Celery worker environment, not in FastAPI server."
        )


def load_model():
    """
    Load Detectron2 model (singleton pattern)
    Model is loaded once and reused for all inference requests
    
    Returns:
        DefaultPredictor instance
    """
    global _predictor
    
    if _predictor is not None:
        return _predictor
    
    # Lazy import detectron2
    get_cfg, DefaultPredictor, model_zoo = _import_detectron2()
    
    if not os.path.exists(settings.MODEL_PATH):
        raise FileNotFoundError(f"Model not found: {settings.MODEL_PATH}")
    
    cfg = get_cfg()
    cfg.merge_from_file(
        model_zoo.get_config_file("COCO-InstanceSegmentation/mask_rcnn_R_101_FPN_3x.yaml")
    )
    
    cfg.MODEL.ROI_HEADS.NUM_CLASSES = 4
    cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = settings.MODEL_CONFIDENCE_THRESHOLD
    cfg.MODEL.WEIGHTS = settings.MODEL_PATH
    cfg.MODEL.DEVICE = settings.MODEL_DEVICE
    cfg.INPUT.MIN_SIZE_TEST = 1024
    cfg.INPUT.MAX_SIZE_TEST = 1600
    
    _predictor = DefaultPredictor(cfg)
    return _predictor


def run_inference(image_path: str) -> Dict:
    """
    Run inference on a single image
    
    Args:
        image_path: Path to image file
        
    Returns:
        {
            "detections": [
                {
                    "class": "oocyte" | "pb" | "polarbody" | "cytoplasm" | "polar-body",
                    "confidence": float,
                    "bbox": {"x1": float, "y1": float, "x2": float, "y2": float}
                }
            ],
            "inferenceTimestamp": datetime ISO string
        }
        
    Raises:
        ValueError: If image cannot be read
        FileNotFoundError: If model not found
    """
    predictor = load_model()
    
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")
    
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Run inference
    outputs = predictor(img)
    instances = outputs["instances"].to("cpu")
    
    # Extract detections
    detections = []
    pred_classes = instances.pred_classes.numpy()
    scores = instances.scores.numpy()
    boxes = instances.pred_boxes.tensor.numpy()
    
    for i in range(len(instances)):
        class_id = pred_classes[i]
        class_name = CLASS_NAMES[class_id]
        
        # Normalize class name using mapping
        normalized_class = CLASS_MAPPING.get(class_name, class_name.lower())
        
        # Get bounding box (x1, y1, x2, y2)
        box = boxes[i]
        x1, y1, x2, y2 = float(box[0]), float(box[1]), float(box[2]), float(box[3])
        
        detections.append({
            "class": normalized_class,
            "confidence": float(scores[i]),
            "bbox": {
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2
            }
        })
    
    return {
        "detections": detections,
        "inferenceTimestamp": datetime.utcnow().isoformat() + "Z"
    }