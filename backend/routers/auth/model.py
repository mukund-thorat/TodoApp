from pydantic import BaseModel, EmailStr

class SignUpModel(BaseModel):
    firstName: str
    lastName: str
    avatar: str
    email: EmailStr
    password: str

class UserCredentials(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    accessToken: str
    tokenType: str

class OTPVerificationModel(BaseModel):
    email: EmailStr
    otp: str
