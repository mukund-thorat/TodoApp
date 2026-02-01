import os
import random
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from smtplib import SMTPException

from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from starlette.status import HTTP_406_NOT_ACCEPTABLE, HTTP_404_NOT_FOUND, HTTP_408_REQUEST_TIMEOUT, \
    HTTP_401_UNAUTHORIZED

from backend.database.pend_user_service import get_temp_user, remove_temp_user
from backend.database.schemas import PendingUserSchema
from backend.routers.auth.service import create_user, create_access_token


class OTPManager:
    OTP_LENGTH = 6
    EXPIRY_MINUTES = 5
    active_otp = {}

    def __init__(self, ):
        self.smtp_email = os.getenv("SMTP_EMAIL")
        self.smtp_password = os.getenv("SMTP_PASS")

    def __generate_otp(self, email: str) -> str:
        otp = "".join([str(random.randint(0, 9)) for _ in range(self.OTP_LENGTH)])

        self.active_otp[email] = {
            "otp": otp,
            "expires": datetime.now() + timedelta(minutes=self.EXPIRY_MINUTES),
        }

        return otp

    def send_otp(self, email: str) -> bool:
        otp = self.__generate_otp(email)

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
            return True

        except SMTPException:
            return False

    async def verify_otp(self, email: str, otp: str, avatar: str, db: AsyncIOMotorDatabase) -> str:
        if email not in self.active_otp:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="User didn't requested an OTP.")

        entry = self.active_otp[email]
        if datetime.now() > entry["expires"]:
            del self.active_otp[email]
            raise HTTPException(status_code=HTTP_408_REQUEST_TIMEOUT, detail="OTP expired.")

        if entry["otp"] == otp:
            pend_user = await get_temp_user(email, db)
            if pend_user is None:
                raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="User is not registered, Direct OTP request is now allowed!")

            await self.__create_new_user(pend_user, avatar, db)
            await remove_temp_user(email, db)
            del self.active_otp[email]
            return create_access_token(email, "temp_id", timedelta(minutes=5))

        return HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Wrong OTP.")

    @staticmethod
    async def __create_new_user(pend_user_shema: PendingUserSchema, avatar: str, db: AsyncIOMotorDatabase):
        if pend_user_shema.email is None or pend_user_shema.passwordHash is None or pend_user_shema is None:
            raise HTTPException(status_code=HTTP_406_NOT_ACCEPTABLE, detail="Invalid signup data")
        await create_user(pend_user_shema, avatar, db=db)
