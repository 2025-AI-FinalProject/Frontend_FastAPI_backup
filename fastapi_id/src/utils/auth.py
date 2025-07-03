from datetime import datetime, timedelta
from typing import Optional, Annotated

from jose import JWTError, jwt # JWT (JSON Web Token) 처리를 위한 라이브러리
from passlib.context import CryptContext # 비밀번호 해싱을 위한 라이브러리
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer # OAuth2 패스워드 플로우를 위한 유틸리티

from ..schemas.user import TokenData # JWT 페이로드 스키마 임포트
from ..database import get_db # DB 세션을 가져오는 함수 임포트
from ..models.user import User # DB 모델 임포트 (get_current_user에서 사용)
from sqlalchemy.orm import Session # Session 타입 힌트
import os
from dotenv import load_dotenv
load_dotenv()

# --- 1. 비밀번호 해싱 및 검증 설정 ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """주어진 비밀번호를 해싱하여 반환합니다."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """평문 비밀번호와 해싱된 비밀번호를 비교하여 일치 여부를 반환합니다."""
    return pwd_context.verify(plain_password, hashed_password)

# --- 2. JWT (JSON Web Token) 설정 ---
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """JWT 액세스 토큰을 생성합니다."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # UTC 시간을 기준으로 만료 시간을 설정합니다.
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire}) # "exp" (expiration time) 클레임 추가
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- 3. 현재 사용자 가져오기 (인증 및 인가) ---
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], # 헤더에서 토큰 추출
    db: Annotated[Session, Depends(get_db)] # DB 세션 주입
) -> User:
    """
    JWT 토큰을 검증하고, 토큰에서 사용자 정보를 추출하여
    현재 인증된 사용자(User ORM 모델 인스턴스)를 반환합니다.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # 토큰 디코딩 및 검증
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Pydantic 모델로 페이로드 유효성 검사
        token_data = TokenData.model_validate(payload)

        # 'sub' 클레임이 없거나 비어있으면 유효하지 않은 토큰으로 간주
        if token_data.sub is None:
            raise credentials_exception

    except JWTError: # 토큰이 유효하지 않거나 만료되었을 때
        raise credentials_exception

    # JWT의 'sub' 클레임 (emp_number)를 사용하여 DB에서 사용자 조회
    user = db.query(User).filter(User.emp_number == token_data.sub).first()
    
    # 사용자가 없거나, 삭제된 계정이라면 인증 실패
    if user is None or user.is_deleted:
        raise credentials_exception

    return user