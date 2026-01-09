from fastapi import APIRouter, Depends
from app.schemas.auth_schema import RegisterPatient, LoginRequest, LoginResponse, ChangePasswordSchema, ForgotPasswordSchema
from app.auth.auth_service import register_patient, login_user, change_password, send_password_reset, login_admin
from app.core.auth_jwt import get_current_user



router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=LoginResponse)
def register(data: RegisterPatient):
    return register_patient(data)

@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest):
    return login_user(data)

@router.post("/admin/login", response_model=LoginResponse)
def login_admin_user(data: LoginRequest):
    return login_admin(data)

# CHANGE PASSWORD (requires login)
@router.post("/change-password")
def change_pw(body: ChangePasswordSchema, user=Depends(get_current_user)):
    return change_password(
        uid=user["userId"],
        old_pass=body.oldPassword,
        new_pass=body.newPassword
    )


# FORGOT PASSWORD
@router.post("/forgot-password")
def forgot_pw(data: ForgotPasswordSchema):
    return send_password_reset(data.email)