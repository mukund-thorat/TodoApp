import os
import random
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from enum import Enum
from smtplib import SMTPException

from fastapi import HTTPException
from starlette.status import HTTP_408_REQUEST_TIMEOUT

from backend.utils.errors import ValidationError, NotFoundError

class OTPPurpose(str, Enum):
    LOGIN = "LOGIN",
    DEL_ACC = "DELETE_ACCOUNT"
    PASS_CHANGE = "PASSWORD_CHANGE"
    PASS_RECOVER = "PASSWORD_RECOVER"

class OTPManager:
    OTP_LENGTH = 6
    EXPIRY_MINUTES = 5
    active_otp = {}

    def __init__(self, ):
        self.smtp_email = os.getenv("SMTP_EMAIL")
        self.smtp_password = os.getenv("SMTP_PASS")


    def __generate_otp(self, email: str, purpose: OTPPurpose) -> str:
        otp = "".join([str(random.randint(0, 9)) for _ in range(self.OTP_LENGTH)])

        self.active_otp[f'{purpose}:{email}'] = {
            "otp": otp,
            "expires": datetime.now() + timedelta(minutes=self.EXPIRY_MINUTES),
        }

        return otp


    def send_otp(self, email: str, purpose: OTPPurpose):
        otp = self.__generate_otp(email, purpose)

        msg = MIMEText(f"Your OTP is: {otp}\nThis OTP expires in {self.EXPIRY_MINUTES} minutes.")
        msg["Subject"] = "OTP - Todo By Mukund"
        msg["From"] = self.smtp_email
        msg["To"] = email

        try:
            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()
            server.login(self.smtp_email, self.smtp_password)
            server.send_message(msg)
            server.quit()
        except SMTPException:
            raise HTTPException(status_code=500, detail="Failed to send OTP email.")


    async def verify_otp(self, email: str, otp: str, purpose: OTPPurpose):
        if f"{purpose}:{email}" not in self.active_otp:
            raise NotFoundError("User didn't requested OTP!")

        entry = self.active_otp[f"{purpose}:{email}"]

        if datetime.now() > entry["expires"]:
            del self.active_otp[f"{purpose}:{email}"]
            raise HTTPException(status_code=HTTP_408_REQUEST_TIMEOUT, detail="OTP expired.")

        if entry["otp"] != otp:
            raise ValidationError("Wrong OTP")
        del self.active_otp[f"{purpose}:{email}"]
