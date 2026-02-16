from pydantic import BaseModel


class OTPVerificationModel(BaseModel):
    otp: str
