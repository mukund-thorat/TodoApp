import random
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from smtplib import SMTPException

from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import EmailStr
from starlette.status import HTTP_406_NOT_ACCEPTABLE

from backend.routers.auth.model import SignUpModel
from backend.routers.auth.service import create_user


class OTPManager:
    OTP_LENGTH = 6
    EXPIRY_MINUTES = 5
    active_otp = {}

    def __init__(self, ):
        self.smtp_email = "api.gaku@gmail.com"
        self.smtp_password = "ehhj zlot cpil gzyg"

    def __generate_otp(self, signup_model: SignUpModel) -> str:
        otp = "".join([str(random.randint(0, 9)) for _ in range(self.OTP_LENGTH)])

        self.active_otp[signup_model.email] = {
            "otp": otp,
            "expires": datetime.now() + timedelta(minutes=self.EXPIRY_MINUTES),
            "data": signup_model.model_dump()
        }

        return otp

    def send_otp(self, signup_model: SignUpModel) -> bool:
        otp = self.__generate_otp(signup_model)

        msg = MIMEText(f"Your OTP is: {otp}\nThis OTP expires in {self.EXPIRY_MINUTES} minutes.")
        msg["Subject"] = "Your Gaku API OTP Code"
        msg["From"] = self.smtp_email
        msg["To"] = signup_model.email

        try:
            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()
            server.login(self.smtp_email, self.smtp_password)
            server.send_message(msg)
            server.quit()
            return True

        except SMTPException:
            return False

    async def verify_otp(self, email: EmailStr, otp: str, db: AsyncIOMotorDatabase) -> bool:
        if email not in self.active_otp:
            return False

        entry = self.active_otp[email]
        if datetime.now() > entry["expires"]:
            del self.active_otp[email]
            return False

        if entry["otp"] == otp:
            await self.__create_new_user(SignUpModel(**entry["data"]), db)
            del self.active_otp[email]
            return True
        return False

    @staticmethod
    async def __create_new_user(signup_model: SignUpModel, db: AsyncIOMotorDatabase):
        if signup_model.email is None or signup_model.password is None or signup_model is None:
            raise HTTPException(status_code=HTTP_406_NOT_ACCEPTABLE, detail="Invalid signup data")
        await create_user(signup_model, db=db)
