from pydantic import BaseModel, EmailStr

class SignUpModel(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str

class UserCredentials(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    accessToken: str
    tokenType: str

class LoginOTPVerificationModel(BaseModel):
    email: EmailStr
    otp: str
    avatar: str

class DeleteOTPVerificationModel(BaseModel):
    email: EmailStr
    otp: str
