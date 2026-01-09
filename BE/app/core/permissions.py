from fastapi import Depends, HTTPException
from app.core.auth_jwt import get_current_user

def require_role(roles: list[str]):
    def wrapper(user=Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Forbidden for your role")
        return user
    return wrapper


def require_self_or_role(roles: list[str]):
    def wrapper(doc_id: str, user=Depends(get_current_user)):
        if user.get("role") in roles or user.get("userId") == doc_id:
            return user
        raise HTTPException(status_code=403, detail="Unauthorized")
    return wrapper

def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user
