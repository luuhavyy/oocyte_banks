from datetime import datetime
from app.core.firebase import db
from typing import List, Dict


def get_admin_dashboard():
    """
    Get admin dashboard data
        
    Returns:
        Dashboard data with overview stats and charts
    """
    # Total patients
    total_patients = len(list(db.collection("patients").stream()))

    # Total batches
    total_batches = len(list(db.collection("retrievalBatches").stream()))

    # Today appointments - query by date range
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)
    
    # Fetch all appointments and filter in Python to avoid index requirements
    all_apps = db.collection("appointments").stream()
    today_count = 0
    for app_doc in all_apps:
        app_data = app_doc.to_dict()
        app_date = app_data.get("appointmentDate")
        if app_date and hasattr(app_date, "replace"):
            # Firestore Timestamp
            app_date_dt = app_date.replace(tzinfo=None) if app_date.tzinfo else app_date
            if today_start <= app_date_dt <= today_end:
                today_count += 1
        elif isinstance(app_date, str):
            # ISO string
            try:
                app_date_dt = datetime.fromisoformat(app_date.replace("Z", "+00:00"))
                app_date_dt = app_date_dt.replace(tzinfo=None)
                if today_start <= app_date_dt <= today_end:
                    today_count += 1
            except:
                pass

    # Monthly trend (last 6 months) - likely vs unlikely reproducible
    monthly_trend = get_monthly_trend()
    
    # Journey stages distribution (donor vs recipient)
    journey_stages = get_journey_stages()
    
    # Calculate metadata fields
    patients_growth_percent = calculate_patients_growth()
    last_batches_update_time = get_last_batches_update_time()
    next_appointment_time = get_next_appointment_time()
    total_eggs = calculate_total_eggs()

    return {
        "totalPatients": total_patients,
        "totalBatches": total_batches,
        "todayAppointments": today_count,
        "monthlyTrend": monthly_trend,
        "journeyStages": journey_stages,
        "patientsGrowthPercent": patients_growth_percent,
        "lastBatchesUpdateTime": last_batches_update_time.isoformat() if last_batches_update_time else None,
        "nextAppointmentTime": next_appointment_time.isoformat() if next_appointment_time else None,
        "totalEggs": total_eggs
    }


def get_monthly_trend(months: int = 6) -> List[Dict]:
    """
    Get monthly trend data for line chart (likely vs unlikely reproducible)
    
    Args:
        months: Number of months to return (default: 6)
        
    Returns:
        List of monthly data with likelyReproducible (MII) and unlikelyReproducible (MI)
    """
    egg_docs = db.collection("eggRecords").stream()

    trend = {}
    for d in egg_docs:
        e = d.to_dict()
        ts = e.get("createdAt")
        if not ts:
            continue
            
        # Handle Firestore Timestamp
        if hasattr(ts, "timestamp"):
            ts = datetime.utcfromtimestamp(ts.timestamp())
        elif isinstance(ts, str):
            try:
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except:
                continue
        
        month = ts.strftime("%Y-%m")

        if month not in trend:
            trend[month] = {"likelyReproducible": 0, "unlikelyReproducible": 0}

        # ONLY use new fields (miiEggs/miEggs)
        if "miiEggs" in e:
            trend[month]["likelyReproducible"] += e.get("miiEggs", 0)
        
        if "miEggs" in e:
            trend[month]["unlikelyReproducible"] += e.get("miEggs", 0)

    # Convert to array sorted by month desc (last N months)
    trend_list = [
        {"month": k, "likelyReproducible": v["likelyReproducible"], "unlikelyReproducible": v["unlikelyReproducible"]}
        for k, v in sorted(trend.items(), reverse=True)[:months]
    ]
    
    # Reverse to show oldest first
    trend_list.reverse()
    
    return trend_list


def get_journey_stages() -> List[Dict]:
    """
    Get patient count by journey stage (donor vs recipient)
    
    Returns:
        List of stage counts with donor and recipient counts
    """
    patients_ref = db.collection("patients")
    patients = patients_ref.stream()
    
    # Initialize stage counts
    stages = {
        "registration": {"donor": 0, "recipient": 0},
        "medicalHistory": {"donor": 0, "recipient": 0},
        "appointment": {"donor": 0, "recipient": 0},
        "retrieval": {"donor": 0, "recipient": 0},
        "eligibility": {"donor": 0, "recipient": 0}
    }
    
    for patient_doc in patients:
        patient_data = patient_doc.to_dict()
        patient_id = patient_doc.id  # Use document ID as patient_id
        role = patient_data.get("role", "").lower()  # donor or recipient
        
        if role not in ["donor", "recipient"]:
            continue
        
        # Determine current stage based on patient data and ID
        stage = determine_patient_stage(patient_id, patient_data)
        
        if stage in stages:
            stages[stage][role] += 1
    
    # Convert to list format
    journey_stages_list = [
        {
            "stage": stage,
            "donor": counts["donor"],
            "recipient": counts["recipient"]
        }
        for stage, counts in stages.items()
    ]
    
    return journey_stages_list


def determine_patient_stage(patient_id: str, patient_data: Dict) -> str:
    db_stage = patient_data.get("stage")
    if db_stage and db_stage in ["registration", "medicalHistory", "appointment", "retrieval", "eligibility"]:
        return db_stage
    
    role = patient_data.get("role", "").lower()
    if role in ["donor", "recipient"]:
        egg_docs = db.collection("eggRecords").where("patientId", "==", patient_id).stream()
        egg_records = []
        
        for egg_doc in egg_docs:
            egg_data = egg_doc.to_dict()
            egg_records.append(egg_data)
        
        if egg_records:
            # Sort by createdAt to get latest record (same logic as journey_service)
            def get_created_at(record):
                created_at = record.get("createdAt")
                if isinstance(created_at, str):
                    try:
                        return datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                    except:
                        return datetime.min
                elif hasattr(created_at, "timestamp"):
                    return datetime.utcfromtimestamp(created_at.timestamp())
                return datetime.min
            
            latest = sorted(egg_records, key=get_created_at, reverse=True)[0]
            
            # Use new field names: miiEggs (likely reproducible) and miEggs (unlikely reproducible)
            mii = latest.get("miiEggs", 0) or 0
            mi = latest.get("miEggs", 0) or 0
            total = latest.get("total", 0) or (mii + mi) or 1
            
            if total > 0:
                if role == "donor":
                    # Donor is eligible at ≥70% likely reproducible (MII) eggs
                    e_score = mii / total
                    if e_score >= 0.7:
                        return "eligibility"
                elif role == "recipient":
                    # Recipient is eligible at ≥90% unlikely reproducible (MI) eggs
                    e_score = mi / total
                    if e_score >= 0.9:
                        return "eligibility"
    
    # Check retrieval
    batches = db.collection("retrievalBatches").where("patientId", "==", patient_id).limit(1).stream()
    if list(batches):
        return "retrieval"
    
    # Check appointment
    appointments = db.collection("appointments").where("patientId", "==", patient_id).limit(1).stream()
    if list(appointments):
        return "appointment"
    
    # Check medicalHistory
    medical_history = patient_data.get("medicalHistory", {})
    if medical_history and len(medical_history) > 0:
        return "medicalHistory"
    
    # Default: registration (patient exists)
    return "registration"


def get_recent_batches(limit: int = 5) -> List[Dict]:
    """
    Get recent batches with patient name and summary
    
    Args:
        limit: Number of batches to return
        
    Returns:
        List of recent batch data with mii/mi (no old fields, no frozen status)
    """
    batches_ref = db.collection("retrievalBatches")
    batches = batches_ref.order_by("createdAt", direction="DESCENDING").limit(limit).stream()
    
    recent_batches = []
    
    for batch_doc in batches:
        batch_data = batch_doc.to_dict()
        batch_id = batch_doc.id
        
        # Skip frozen batches
        status = batch_data.get("status", "pending")
        if status == "frozen":
            continue
        
        # Get patient name
        patient_id = batch_data.get("patientId")
        patient_name = "Unknown"
        if patient_id:
            patient_doc = db.collection("patients").document(patient_id).get()
            if patient_doc.exists:
                patient_data = patient_doc.to_dict()
                patient_name = patient_data.get("fullName", "Unknown")
        
        # Get result summary - ONLY use new fields (mii/mi)
        result_summary = batch_data.get("resultSummary", {})
        mii = result_summary.get("mii", 0) or 0
        mi = result_summary.get("mi", 0) or 0
        total = result_summary.get("totalFrames", 0) or (mii + mi)
        
        # Get date
        created_at = batch_data.get("createdAt")
        if hasattr(created_at, "timestamp"):
            created_at = datetime.utcfromtimestamp(created_at.timestamp())
        elif isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            except:
                created_at = datetime.utcnow()
        elif created_at is None:
            created_at = datetime.utcnow()
        
        recent_batches.append({
            "batchId": batch_id,
            "patient": patient_name,
            "date": created_at,
            "mii": mii,
            "mi": mi,
            "total": total,
            "status": status
        })
    
    return recent_batches


def get_recent_patients(limit: int = 5) -> List[Dict]:
    """
    Get recent patients
    
    Args:
        limit: Number of patients to return
        
    Returns:
        List of recent patient data
    """
    patients_ref = db.collection("patients")
    patients = patients_ref.order_by("createdAt", direction="DESCENDING").limit(limit).stream()
    
    recent_patients = []
    
    for patient_doc in patients:
        patient_data = patient_doc.to_dict()
        patient_id = patient_doc.id
        
        recent_patients.append({
            "patientId": patient_id,
            "name": patient_data.get("fullName", "Unknown"),
            "role": patient_data.get("role", "unknown"),
            "status": patient_data.get("status", "active")
        })
    
    return recent_patients


def calculate_patients_growth() -> float:
    """
    Calculate patients growth percentage compared to last month
    
    Returns:
        Growth percentage (can be negative), 0 if not enough data
    """
    now = datetime.utcnow()
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Get last month start
    if this_month_start.month == 1:
        last_month_start = this_month_start.replace(year=this_month_start.year - 1, month=12)
    else:
        last_month_start = this_month_start.replace(month=this_month_start.month - 1)
    
    # Count patients
    all_patients = db.collection("patients").stream()
    last_month_end_count = 0  # Patients by end of last month (created < this_month_start)
    total_count = 0  # Total patients now
    
    for patient_doc in all_patients:
        patient_data = patient_doc.to_dict()
        created_at = patient_data.get("createdAt")
        
        if not created_at:
            total_count += 1  # Count anyway
            continue
        
        # Handle Firestore Timestamp
        if hasattr(created_at, "timestamp"):
            created_at_dt = datetime.utcfromtimestamp(created_at.timestamp())
        elif isinstance(created_at, str):
            try:
                created_at_dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            except:
                total_count += 1  # Count anyway
                continue
        else:
            total_count += 1  # Count anyway
            continue
        
        # Count all patients
        total_count += 1
        
        # Count patients created before this month (end of last month)
        if created_at_dt < this_month_start:
            last_month_end_count += 1
    
    if last_month_end_count == 0:
        return 0.0
    
    # Growth = ((current total - last month end total) / last month end total) * 100
    growth_percent = ((total_count - last_month_end_count) / last_month_end_count) * 100
    return round(growth_percent, 1)


def get_last_batches_update_time() -> datetime | None:
    """
    Get the most recent batch update time
    
    Returns:
        Datetime of last update, or None if no batches
    """
    batches_ref = db.collection("retrievalBatches")
    batches = batches_ref.order_by("updatedAt", direction="DESCENDING").limit(1).stream()
    
    for batch_doc in batches:
        batch_data = batch_doc.to_dict()
        updated_at = batch_data.get("updatedAt") or batch_data.get("createdAt")
        
        if not updated_at:
            continue
        
        # Handle Firestore Timestamp
        if hasattr(updated_at, "timestamp"):
            return datetime.utcfromtimestamp(updated_at.timestamp())
        elif isinstance(updated_at, str):
            try:
                return datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
            except:
                pass
    
    return None


def get_next_appointment_time() -> datetime | None:
    """
    Get the next appointment time for today
    
    Returns:
        Datetime of next appointment today, or None if no appointments
    """
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    # Get all appointments
    all_apps = db.collection("appointments").stream()
    today_appointments = []
    
    for app_doc in all_apps:
        app_data = app_doc.to_dict()
        app_date = app_data.get("appointmentDate")
        
        if not app_date:
            continue
        
        # Handle Firestore Timestamp
        if hasattr(app_date, "timestamp"):
            app_date_dt = datetime.utcfromtimestamp(app_date.timestamp())
        elif isinstance(app_date, str):
            try:
                app_date_dt = datetime.fromisoformat(app_date.replace("Z", "+00:00"))
            except:
                continue
        else:
            continue
        
        # Check if appointment is today and in the future
        if today_start <= app_date_dt <= today_end and app_date_dt > now:
            today_appointments.append(app_date_dt)
    
    if not today_appointments:
        return None
    
    # Return earliest appointment
    return min(today_appointments)


def calculate_total_eggs() -> int:
    """
    Calculate total eggs from all egg records (mii + mi)
    
    Returns:
        Total number of eggs
    """
    egg_docs = db.collection("eggRecords").stream()
    total = 0
    
    for egg_doc in egg_docs:
        egg_data = egg_doc.to_dict()
        total += egg_data.get("miiEggs", 0) + egg_data.get("miEggs", 0)
    
    return total