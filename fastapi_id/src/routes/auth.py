from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import Annotated 

from ..schemas.password_reset import ForgotPasswordRequest, ResetPasswordRequest, PasswordResetResponse
from ..services import password_reset_service 

# 중요한 부분: schemas.user에서 필요한 스키마들만 정확히 임포트합니다.
from ..schemas.user import (
    UserCreate, 
    UserLogin, 
    Token, 
    UserResponse, 
    UserDelete, 
    PasswordChangeRequest # 비밀번호 변경 요청 스키마
)
from ..models.user import User 
from ..utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user, 
)
from ..database import get_db 
from ..services import user_service 

router = APIRouter(tags=["authentication"])

# ----------------------------------------------------
# 1. 회원가입 엔드포인트 (POST /auth/signup)
# ----------------------------------------------------
@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_create: UserCreate, db: Annotated[Session, Depends(get_db)]):
    db_user = user_service.get_user_by_email(db, user_create.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Email already registered"
        )
    
    db_user_by_emp = user_service.get_user_by_emp_number(db, user_create.emp_number)
    if db_user_by_emp:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Employee number already registered"
        )

    new_user = user_service.create_user(db, user_create)
    return UserResponse.model_validate(new_user)


# ----------------------------------------------------
# 2. 로그인 엔드포인트 (POST /auth/login)
# ----------------------------------------------------
@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Annotated[Session, Depends(get_db)]):
    user = user_service.get_user_by_emp_number(db, user_credentials.emp_number)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사번 또는 비밀번호가 올바르지 않습니다.", 
        )

    if not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사번 또는 비밀번호가 올바르지 않습니다.", 
        )
    
    if user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Account is deactivated or deleted",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.emp_number}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# ----------------------------------------------------
# 3. 현재 사용자 정보 조회 엔드포인트 (GET /auth/me)
# ----------------------------------------------------
@router.get("/mypage", response_model=UserResponse)
async def get_user_me(current_user: Annotated[User, Depends(get_current_user)]):
    return UserResponse.model_validate(current_user)


# ----------------------------------------------------
# 4. 로그아웃 엔드포인트 (POST /auth/logout)
# ----------------------------------------------------
@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(current_user: Annotated[User, Depends(get_current_user)]):
    return 


# ----------------------------------------------------
# 5. 회원 탈퇴 엔드포인트 (DELETE /auth/withdrawal)
# ----------------------------------------------------
@router.delete("/withdrawal", status_code=status.HTTP_204_NO_CONTENT)
async def withdraw_user(
    user_delete: UserDelete, 
    current_user: Annotated[User, Depends(get_current_user)], 
    db: Annotated[Session, Depends(get_db)] 
):
    if not verify_password(user_delete.password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )
    
    if current_user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Account is already deactivated",
        )

    user_service.deactivate_user(db, current_user)
    return 

# ----------------------------------------------------
# 6. 비밀번호 재설정 요청 엔드포인트 (POST /auth/forgot_password)
# ----------------------------------------------------
@router.post("/forgot_password", response_model=PasswordResetResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Annotated[Session, Depends(get_db)]
):
    user = user_service.get_user_by_email(db, request.email)
    if not user:
        return PasswordResetResponse(
            message="If an account with that email exists, a password reset link has been sent."
        )
    
    if user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reset password for a deactivated account."
        )

    reset_token = password_reset_service.create_password_reset_token(db, user)
    
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send password reset email."
        )

    return PasswordResetResponse(
        message="If an account with that email exists, a password reset link has been sent.",
        detail="Check your email for the reset link."
    )


# ----------------------------------------------------
# 7. 비밀번호 재설정 완료 엔드포인트 (POST /auth/reset_password)
# ----------------------------------------------------
@router.post("/reset_password", response_model=UserResponse)
async def reset_password_confirm(
    request: ResetPasswordRequest,
    db: Annotated[Session, Depends(get_db)]
):
    user_to_reset = password_reset_service.verify_password_reset_token(db, request.token)
    if not user_to_reset:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )
    
    updated_user = password_reset_service.reset_password(db, user_to_reset, request.new_password)

    return UserResponse.model_validate(updated_user)

# ----------------------------------------------------
# 8. 비밀번호 변경 엔드포인트 (PUT /auth/change-password)
# ----------------------------------------------------
@router.put("/change-password", response_model=UserResponse)
async def change_password(
    password_change: PasswordChangeRequest, 
    current_user: Annotated[User, Depends(get_current_user)], 
    db: Annotated[Session, Depends(get_db)]
):
    if not verify_password(password_change.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="현재 비밀번호가 올바르지 않습니다.",
        )

    if password_change.new_password != password_change.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
        )

    if password_change.new_password == password_change.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="새 비밀번호는 현재 비밀번호와 달라야 합니다.",
        )

    import re
    if not re.match(r"^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{10,}$", password_change.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="새 비밀번호는 영문, 숫자, 특수문자를 포함하고 10자 이상이어야 합니다."
        )

    updated_user = user_service.update_user_password(
        db, user_id=current_user.user_id, new_password=password_change.new_password
    )
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="비밀번호 변경에 실패했습니다."
        )

    return UserResponse.model_validate(updated_user)


# ----------------------------------------------------
# 9. 비밀번호 확인 엔드포인트 (POST /auth/verify-password)
# ----------------------------------------------------
@router.post("/verify-password", status_code=status.HTTP_200_OK)
async def verify_user_password(
    payload: dict,
    current_user: Annotated[User, Depends(get_current_user)]
):
    password = payload.get("password")
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="비밀번호가 누락되었습니다."
        )

    if not verify_password(password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="비밀번호가 일치하지 않습니다."
        )

    return {"message": "비밀번호 확인 성공"}