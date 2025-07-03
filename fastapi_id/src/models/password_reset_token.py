# src/models/password_reset_token.py

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID # UUID를 사용한다면
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from ..database import Base # Base 임포트 확인

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4) # 토큰 ID
    # user_id 컬럼이 User 모델의 ID를 참조하도록 외래 키로 설정
    user_id = Column(UUID(as_uuid=True), ForeignKey("Users.user_id"), nullable=False) # 'users'는 User 모델의 __tablename__
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # User 모델과의 관계 정의 (PasswordResetToken -> User)
    # 'user'는 이 토큰이 속한 User 객체를 나타냅니다.
    user = relationship("User", back_populates="reset_tokens") # 'User'는 User 클래스 이름