# src/utils/email_sender.py

import smtplib
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

load_dotenv() # .env 파일 로드

# TODO: .env 파일에 다음 환경 변수들을 설정해야 합니다!
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587)) # 대부분의 SMTP는 587 (TLS) 또는 465 (SSL)
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD") # 앱 비밀번호 (앱 암호) 사용 권장

# 이메일 발신 주소
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "your_email@example.com") # 보내는 사람 이메일 주소

def send_email(to_email: str, subject: str, body: str):
    """
    지정된 이메일 주소로 이메일을 전송합니다.
    """
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("경고: SMTP 사용자 이름 또는 비밀번호가 설정되지 않아 이메일을 보낼 수 없습니다.")
        return False # 이메일 전송 실패

    try:
        msg = MIMEText(body, 'html') # HTML 형식으로 보낼 수 있도록 'html' 지정
        msg['Subject'] = subject
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls() # TLS 보안 시작
            server.login(SMTP_USERNAME, SMTP_PASSWORD) # SMTP 서버 로그인
            server.send_message(msg) # 이메일 전송
        print(f"이메일 전송 성공: '{subject}' to {to_email}")
        return True
    except Exception as e:
        print(f"이메일 전송 실패: {e}")
        return False

# 사용 예시 (개발 테스트용)
if __name__ == "__main__":
    # .env 파일에 SMTP 설정이 되어있어야 합니다.
    # SENDGRID/MAILGUN 대신 Gmail을 사용하는 경우, Google 계정에서 "앱 비밀번호"를 생성하여 사용해야 합니다.
    # 2단계 인증을 켠 후: Google 계정 관리 -> 보안 -> 앱 비밀번호
    # "메일" 앱, "기기" 컴퓨터 선택 후 생성된 16자리 코드 사용
    test_email = "recipient@example.com" # 실제 이메일 주소로 변경
    test_subject = "비밀번호 재설정 테스트"
    test_body = "<p>안녕하세요. 이것은 테스트 이메일입니다. <a href='http://localhost:8000/reset?token=abc'>비밀번호 재설정</a></p>"
    send_email(test_email, test_subject, test_body)