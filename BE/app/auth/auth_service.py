import requests
from fastapi import HTTPException, status, Depends
from firebase_admin import auth as firebase_auth
from app.core.firebase import db
from app.core.auth_jwt import create_jwt_token, get_current_user
from app.config import settings
from app.schemas.auth_schema import RegisterPatient, LoginRequest, LoginResponse, ChangePasswordSchema, ForgotPasswordSchema
from datetime import datetime
import os

FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY")
FIREBASE_REST_URL = f"https://identitytoolkit.googleapis.com/v1/accounts"
# -------------------------------------
# REGISTER PATIENT
# -------------------------------------
def register_patient(data: RegisterPatient) -> LoginResponse:
    """
    Registers a new patient (Donor/Recipient) in Firebase Auth and creates 
    the corresponding patient document in Firestore.
    """
    if data.role not in ["donor", "recipient"]:
        raise HTTPException(status_code=400, detail="Invalid role specified. Must be 'donor' or 'recipient'.")

    try:
        # 1. Create user in Firebase Auth
        fb_user = firebase_auth.create_user(
            email=data.email,
            password=data.password
        )
    except Exception as e:
        # Firebase Auth exceptions often contain helpful detail
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Firebase Auth error: {e}")

    # 2. Create corresponding patient document in Firestore
    now = datetime.utcnow()
    patient_doc = {
        "email": data.email,
        "fullName": data.fullName,
        "role": data.role,
        "status": "active",
        "stage": "registration",
        "medicalHistory": {},
        "dob": data.dob,
        "phone": data.phone,
        "address": data.address,
        "createdAt": now,
        "updatedAt": now
    }

    # Use the Firebase UID as the Document ID (Crucial for synchronization)
    db.collection("patients").document(fb_user.uid).set(patient_doc)

    # 3. Create Custom JWT Token for the application
    jwt_token = create_jwt_token({
        "userId": fb_user.uid,
        "role": "patient",
        "subrole": data.role
    })

    return LoginResponse(
        access_token=jwt_token,
        userId=fb_user.uid,
        role="patient",
        subrole=data.role
    )


# -------------------------------------
# LOGIN (password verified by Google)
# -------------------------------------
def login_user(data: LoginRequest) -> LoginResponse:
    """
    Backend login by verifying password via Google Identity Toolkit REST API.
    Retrieves user's role from Firestore and generates a custom JWT.
    """

    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={settings.FIREBASE_API_KEY}"

    payload = {
        "email": data.email,
        "password": data.password,
        "returnSecureToken": True
    }

    # 1. Call Google Identity Toolkit REST API for password verification
    try:
        resp = requests.post(url, json=payload)
    except requests.exceptions.RequestException:
        # Handle connection errors
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="External authentication service unavailable")

    if resp.status_code != 200:
        # Invalid email/password is handled here
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    g_data = resp.json()
    firebase_uid = g_data["localId"]
    
    # 2. Check user in Firestore (patients)

    # Check if patient
    p_doc = db.collection("patients").document(firebase_uid).get()
    if p_doc.exists:
        p_data = p_doc.to_dict()
        subrole = p_data.get("role") # donor or recipient
        
        jwt_token = create_jwt_token({
            "userId": firebase_uid,
            "role": "patient",
            "subrole": subrole
        })
        return LoginResponse(
            access_token=jwt_token,
            userId=firebase_uid,
            role="patient",
            subrole=subrole
        )


    # If Firebase Auth success but no matching record in Firestore
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User record found in Auth but not synchronized in Firestore.")

def login_admin(data: LoginRequest) -> LoginResponse:
    """
    Backend login by verifying password via Google Identity Toolkit REST API.
    Retrieves user's role from Firestore and generates a custom JWT.
    """

    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={settings.FIREBASE_API_KEY}"

    payload = {
        "email": data.email,
        "password": data.password,
        "returnSecureToken": True
    }

    # 1. Call Google Identity Toolkit REST API for password verification
    try:
        resp = requests.post(url, json=payload)
    except requests.exceptions.RequestException:
        # Handle connection errors
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="External authentication service unavailable")

    if resp.status_code != 200:
        # Invalid email/password is handled here
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    g_data = resp.json()
    firebase_uid = g_data["localId"]
    
    # 2. Check staffs in Firestore (only staffs can login here)

    s_doc = db.collection("staffs").document(firebase_uid).get()
    if s_doc.exists:
        s_data = s_doc.to_dict()
        role = s_data.get("role") # staff or admin

        jwt_token = create_jwt_token({
            "userId": firebase_uid,
            "role": role, # staff or admin
        })
        return LoginResponse(
            access_token=jwt_token,
            userId=firebase_uid,
            role=role,
            subrole=None
        )

    # If Firebase Auth success but no matching record in Firestore
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User record found in Auth but not synchronized in Firestore.")


# -------------------
# CHANGE PASSWORD
# -------------------
def change_password(uid: str, old_pass: str, new_pass: str, user = Depends(get_current_user)):
    # 1. Reauth using REST API
    if user.get("role") == "patient": 
        collection_name = "patients"
    else:               
        collection_name = "staffs"
    
    user_doc = db.collection(collection_name).document(uid).get()
    email = user_doc.to_dict()["email"]

    url = f"{FIREBASE_REST_URL}:signInWithPassword?key={FIREBASE_WEB_API_KEY}"
    payload = {
        "email": email,
        "password": old_pass,
        "returnSecureToken": True
    }

    res = requests.post(url, json=payload)
    if res.status_code != 200:
        raise HTTPException(401, "Old password incorrect")

    # 2. Update password using Firebase Admin SDK
    firebase_auth.update_user(uid, password=new_pass)

    return {"status": "password_changed"}


# -------------------
# FORGOT PASSWORD (SEND RESET EMAIL)
# -------------------
def send_password_reset(email: str):
    url = f"{FIREBASE_REST_URL}:sendOobCode?key={FIREBASE_WEB_API_KEY}"
    payload = {
        "requestType": "PASSWORD_RESET",
        "email": email
    }

    res = requests.post(url, json=payload)

    if res.status_code != 200:
        raise HTTPException(400, "Email not found")

    return {"status": "reset_link_sent"}


