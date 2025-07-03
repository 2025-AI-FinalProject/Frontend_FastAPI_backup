from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID # UUID 타입 임포트

# 회원가입 요청시 클라이언트가 보내는 데이터
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    emp_number: str = Field(..., alias="empNumber")

    class Config:
        populate_by_name = True
        from_attributes = True

# 로그인 요청시 클라이언트가 보내는 데이터
class UserLogin(BaseModel):
    emp_number: str
    password: str

    class Config:
        from_attributes = True

# JWT 토큰 응답 스키마
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# 토큰 데이터 스키마 (JWT 디코딩 후 사용)
class TokenData(BaseModel):
    sub: Optional[str] = None 

# 사용자 정보 응답 스키마
class UserResponse(BaseModel):
    user_id: UUID 
    emp_number: str
    email: EmailStr
    name: str
    phone: str
    created_at: datetime
    is_deleted: bool
    # updated_at: datetime # User 모델에 updated_at이 있다면 여기도 추가

    class Config:
        from_attributes = True

# 사용자 정보 업데이트 요청 스키마
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None 
    phone: Optional[str] = None
    emp_number: Optional[str] = None

    class Config:
        from_attributes = True

# 회원 탈퇴 요청 스키마
class UserDelete(BaseModel):
    password: str

# 비밀번호 변경 요청 스키마
class PasswordChangeRequest(BaseModel):
    current_password: str 
    new_password: str     
    confirm_password: str