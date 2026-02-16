from typing import Optional

from pydantic import BaseModel, EmailStr


class SignUpModel(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: Optional[str]

class UserCredentials(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginOTPVerificationModel(BaseModel):
    email: EmailStr
    otp: str
    avatar: str
