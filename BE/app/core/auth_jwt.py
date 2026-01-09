import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, Header
from app.config import settings
from firebase_admin import auth as firebase_auth

# -----------------------------------------
# JWT CREATE
# -----------------------------------------
def create_jwt_token(payload: dict):
    payload.update({
        "exp": datetime.utcnow() + settings.JWT_EXPIRES,
        "iat": datetime.utcnow()
    })
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


# -----------------------------------------
# JWT DECODE
# -----------------------------------------
def decode_jwt_token(token: str):
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")


# -----------------------------------------
# Dependency: Extract user from Authorization header
# -----------------------------------------
def get_current_user(authorization: str = Header(None, alias="Authorization")):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header format. Expected 'Bearer <token>'")

    token = authorization.split(" ")[1]
    if not token:
        raise HTTPException(status_code=401, detail="Missing token in Authorization header")
    
    return decode_jwt_token(token)
