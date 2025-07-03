

from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from ..models.user import User # User ORM 모델
from ..models.password_reset_token import PasswordResetToken # 새로 정의한 토큰 모델
from ..utils.email_sender import send_email # 이메일 전송 유틸리티
from ..utils.auth import get_password_hash # 비밀번호 해싱 유틸리티

RESET_TOKEN_EXPIRE_MINUTES = 15 # 비밀번호 재설정 토큰 유효 시간 (분)
PASSWORD_RESET_BASE_URL = "http://localhost:3000/reset-password" # TODO: 실제 프론트엔드 URL로 변경

# 1. 비밀번호 재설정 토큰 생성 및 이메일 전송
def create_password_reset_token(db: Session, user: User) -> Optional[PasswordResetToken]:
    # 기존 토큰이 있다면 삭제 (옵션)
    existing_token = db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.emp_number).first()
    if existing_token:
        db.delete(existing_token)
        db.commit()

    token = str(uuid.uuid4()) # 고유한 UUID를 토큰으로 사용
    # now() 대신 utcnow()를 사용했듯이, now(timezone.utc)를 사용하여 시간대 인식 객체로 만듭니다.
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    # 또는 datetime.utcnow().replace(tzinfo=timezone.utc) 로 명시적으로 UTC 타임존 정보 추가
    # Pydantic v2에서 datetime.utcnow()는 deprecated 되었으므로 datetime.now(timezone.utc)를 권장합니다.

    db_token = PasswordResetToken(
        token=token,
        user_id=user.emp_number,
        expires_at=expires_at # 이제 expires_at은 offset-aware 입니다.
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)

    # 이메일 전송
    reset_link = f"{PASSWORD_RESET_BASE_URL}?token={token}"
    subject = "[당신의 서비스 이름] 비밀번호 재설정 링크 안내"
    body = f"""
    <p>안녕하세요, {user.name}님.</p>
    <p>비밀번호 재설정 요청을 받았습니다. 아래 링크를 클릭하여 비밀번호를 재설정하세요:</p>
    <p><a href="{reset_link}">비밀번호 재설정하기</a></p>
    <p>이 링크는 {RESET_TOKEN_EXPIRE_MINUTES}분 동안 유효합니다. 만약 본인이 요청하지 않았다면, 이 이메일을 무시해주세요.</p>
    <p>감사합니다.</p>
    """
    
    # 실제 이메일 전송
    email_sent = send_email(user.email, subject, body)
    
    if not email_sent:
        # 이메일 전송 실패 시, 생성된 토큰을 삭제하거나 별도 로깅
        db.delete(db_token)
        db.commit()
        return None # 토큰 생성 실패로 간주

    return db_token

# 2. 토큰 유효성 검증
def verify_password_reset_token(db: Session, token: str) -> Optional[User]:
    db_token = db.query(PasswordResetToken).filter(PasswordResetToken.token == token).first()

    if not db_token:
        return None

    # 현재 시간을 UTC 기준으로 시간대 인식 객체로 만듭니다.
    # db_token.expires_at (offset-aware)와 datetime.now(timezone.utc) (offset-aware)를 비교합니다.
    if db_token.expires_at < datetime.now(timezone.utc): # <-- 이 부분을 수정
        db.delete(db_token) # 만료된 토큰 삭제
        db.commit()
        return None

    # 토큰에 연결된 사용자 조회
    user = db.query(User).filter(User.emp_number == db_token.emp_number).first()
    
    # 사용자가 없거나, 삭제된 계정이라면 토큰 무효화
    if not user or user.is_deleted:
        db.delete(db_token) # 유효하지 않은 사용자이므로 토큰 삭제
        db.commit()
        return None

    return user # 유효한 토큰에 해당하는 사용자 반환

# 3. 비밀번호 재설정 (실제 비밀번호 업데이트)
def reset_password(db: Session, user: User, new_password: str) -> User:
    hashed_password = get_password_hash(new_password)
    user.password_hash = hashed_password
    db.add(user) # 변경 감지
    
    # 비밀번호 재설정 후 모든 관련 토큰 삭제 (보안 강화)
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.emp_number).delete()
    
    db.commit()
    db.refresh(user)
    return user