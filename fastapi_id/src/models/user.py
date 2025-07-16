# src/models/user.py

from sqlalchemy import Column, String, DateTime, Boolean, func
from sqlalchemy.orm import relationship # relationship 임포트 추가
from ..database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid

class User(Base):
    __tablename__ = "Users"

    user_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    password_hash = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    emp_number = Column(String(20), nullable=False, unique=True, index=True)
    
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # PasswordResetToken과의 관계 설정
    reset_tokens = relationship("PasswordResetToken", back_populates="user") # 'user'는 PasswordResetToken에서 정의될 이름

    def __repr__(self):
        return (
            f"<User(user_id={self.user_id}, emp_number='{self.emp_number}', name='{self.name}', "
            f"email='{self.email}', is_deleted={self.is_deleted}, created_at='{self.created_at}')>"
        )