# app/services/evaluation_service.py

from typing import Dict, List
from datetime import datetime
from app.config import settings


def evaluate_maturity(detections: List[Dict]) -> Dict:
    """
    Evaluate egg maturity based on detections (rule-based)
    
    Rule:
    - If oocyte has polar body ("polarbody") -> MII (likely reproducible)
    - If oocyte has no polar body -> MI (unlikely reproducible)
    
    Note: "Polar-Body" (original image) is NOT counted as actual polar body.
    Only "polarbody" class is used for MI/MII evaluation.
    
    Args:
        detections: List of detection dicts with "class" field
        
    Returns:
        {
            "maturity": "MII" | "MI",
            "quality": "likely reproducible" | "unlikely reproducible"
        }
    """
    has_oocyte = False
    has_polar_body = False
    
    for detection in detections:
        class_name = detection.get("class", "").lower()
        
        if class_name == "oocyte":
            has_oocyte = True
        elif class_name == "polarbody":  # Only "polarbody" counts, not "polar-body"
            has_polar_body = True
    
    if has_oocyte and has_polar_body:
        return {
            "maturity": "MII",
            "quality": "likely reproducible"
        }
    elif has_oocyte:
        return {
            "maturity": "MI",
            "quality": "unlikely reproducible"
        }
    else:
        # No oocyte detected - cannot classify properly
        return {
            "maturity": "MI",  # Default to MI if no oocyte
            "quality": "unlikely reproducible"
        }


def create_evaluation_result(detection_results: Dict) -> Dict:
    """
    Create evaluationResult from detectionResults
    
    Args:
        detection_results: {
            "detections": [...],
            "inferenceTimestamp": "..."
        }
        
    Returns:
        {
            "maturity": "MII" | "MI",
            "quality": "likely reproducible" | "unlikely reproducible",
            "evaluatedAt": datetime
        }
    """
    detections = detection_results.get("detections", [])
    evaluation = evaluate_maturity(detections)
    
    return {
        "maturity": evaluation["maturity"],
        "quality": evaluation["quality"],
        "evaluatedAt": datetime.utcnow()
    }