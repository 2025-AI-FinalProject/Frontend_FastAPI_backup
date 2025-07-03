from sqlalchemy.orm import Session
from ..models.user import User 
from ..schemas.user import UserCreate, UserUpdate 
from ..utils.auth import get_password_hash # get_password_hash 임포트 확인
from typing import Optional
import uuid 
from datetime import datetime # datetime 임포트 추가

# 사용자 생성 서비스
def create_user(db: Session, user_create: UserCreate) -> User:
    # 🚨 DEBUG: 함수 시작 로그
    print(f"DEBUG: create_user 함수 시작 - 이메일: {user_create.email}, 사번: {user_create.emp_number}")
    
    hashed_password = get_password_hash(user_create.password)
    # 🚨 DEBUG: 비밀번호 해싱 완료 로그
    print(f"DEBUG: 비밀번호 해싱 완료.")
    
    # ORM 모델 User 인스턴스 생성 및 모든 필수 컬럼 값 할당
    db_user = User(
        user_id=str(uuid.uuid4()), # UUID로 고유 ID 생성 (VARCHAR(50)에 적합)
        password_hash=hashed_password,
        email=user_create.email,
        name=user_create.name,
        phone=user_create.phone,
        emp_number=user_create.emp_number,
        # created_at과 is_deleted는 DB의 DEFAULT 값으로 자동 채워지므로 명시적으로 넣지 않음.
        # db.refresh(db_user) 시 최신 값으로 업데이트 됩니다.
    )
    
    # 🚨 DEBUG: DB User 객체 생성 확인 로그
    print(f"DEBUG: DB User 객체 생성 (커밋 전): user_id={db_user.user_id}, emp_number={db_user.emp_number}, email={db_user.email}")

    try:
        db.add(db_user) # 세션에 사용자 추가
        # 🚨 DEBUG: DB 세션에 추가 완료 로그
        print("DEBUG: DB 세션에 사용자 추가 완료 (아직 DB 저장 전).")
        
        db.commit()      # 변경 사항 DB에 커밋
        # 🚨 DEBUG: DB 커밋 완료 로그 (데이터가 이때 실제 DB에 저장됨)
        print("DEBUG: DB 커밋 완료. 데이터베이스에 저장됨.")
        
        db.refresh(db_user) # DB에 저장된 최신 상태(created_at 등)로 객체 업데이트
        # 🚨 DEBUG: DB User 객체 새로고침 완료 로그
        print(f"DEBUG: DB User 객체 새로고침 완료. user_id={db_user.user_id}, created_at={db_user.created_at}, is_deleted={db_user.is_deleted}")
        
        return db_user
    except Exception as e:
        db.rollback() # 오류 발생 시 롤백하여 데이터 일관성 유지
        # 🚨 ERROR: 예외 발생 시 상세 로그 (가장 중요한 부분!)
        print(f"ERROR: create_user 함수에서 DB 저장 중 심각한 오류 발생: {e}")
        # 예외를 다시 발생시켜 FastAPI의 상위 핸들러로 전달
        raise 

# 이메일로 사용자 조회
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

# 사원번호로 사용자 조회 (emp_number가 UNIQUE이므로)
def get_user_by_emp_number(db: Session, emp_number: str) -> Optional[User]:
    return db.query(User).filter(User.emp_number == emp_number).first()

# 사용자 정보 업데이트 서비스
def update_user(db: Session, db_user: User, user_update: UserUpdate) -> User:
    # 각 필드가 None이 아닐 때만 업데이트를 적용
    if user_update.name is not None:
        db_user.name = user_update.name
    if user_update.email is not None:
        db_user.email = user_update.email
    if user_update.password is not None:
        db_user.password_hash = get_password_hash(user_update.password) # 새 비밀번호 해싱
    if user_update.phone is not None:
        db_user.phone = user_update.phone
    if user_update.emp_number is not None:
        db_user.emp_number = user_update.emp_number
    
    db_user.updated_at = datetime.utcnow() # 업데이트 시각 갱신
    db.add(db_user) 
    db.commit()     
    db.refresh(db_user) 
    return db_user

# 사용자 탈퇴 (소프트 삭제) 서비스
def deactivate_user(db: Session, db_user: User):
    db_user.is_deleted = True 
    db_user.updated_at = datetime.utcnow() # 업데이트 시각 갱신
    db.add(db_user) 
    db.commit()     
    db.refresh(db_user)

# 🚨 새로 추가된: 사용자 비밀번호 업데이트 서비스
from uuid import UUID # user_id 타입에 따라 UUID 또는 str 임포트

def update_user_password(db: Session, user_id: UUID, new_password: str) -> Optional[User]:
    """주어진 user_id에 해당하는 사용자의 비밀번호를 업데이트합니다."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if user:
        user.password_hash = get_password_hash(new_password)
        user.updated_at = datetime.utcnow() # 비밀번호 변경 시 updated_at 업데이트
        # user.lastPasswordChange = datetime.utcnow() # 만약 모델에 lastPasswordChange 컬럼이 있다면 이 줄을 추가
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    return None