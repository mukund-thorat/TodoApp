from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Request, Response
from fastapi.params import Depends
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import EmailStr
from starlette.status import HTTP_201_CREATED, HTTP_202_ACCEPTED, HTTP_200_OK

from backend.data.core import get_db
from backend.data.schemas import UserSchema, AuthServiceProvider
from backend.routers.auth.repo_user import set_user_timestamp
from backend.routers.auth.models import UserCredentials, SignUpModel, LoginOTPVerificationModel, Token
from backend.routers.auth.service import authenticate_user, store_pend_user, login_verification, tokens_generator
from backend.utils.const import RATE_LIMIT
from backend.utils.errors import ValidationError
from backend.utils.otp_manager import OTPManager, OTPPurpose
from backend.utils.rate_limiting import limiter
from backend.utils.response_model import ResponseModel, ResponseCode
from backend.utils.security import get_current_user, get_current_user_refresh_token
from backend.routers.auth.pass_recovery.controller import router as pass_recovery_router
from backend.routers.auth.google.controller import router as google_router


router = APIRouter(prefix="/auth", tags=["auth"])
router.include_router(pass_recovery_router)
router.include_router(google_router)


@router.post("/login", status_code=HTTP_202_ACCEPTED, response_model=Token)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def login(request: Request, response: Response, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: AsyncIOMotorDatabase = Depends(get_db)):
    if form_data.username is None or form_data.password is None:
        raise ValidationError("Email or password is required")

    credentials = UserCredentials(email=form_data.username, password=form_data.password)

    user = await authenticate_user(credentials=credentials, db=db)
    await set_user_timestamp(email=user.email, date_time_field="lastLogIn", new_date_time=datetime.now(), db=db)

    return await tokens_generator(response, user, db)


@router.get("/refresh", status_code=HTTP_201_CREATED)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def token_regenerator(request: Request, response: Response, user: UserSchema = Depends(get_current_user_refresh_token), db: AsyncIOMotorDatabase = Depends(get_db)):
    return await tokens_generator(response, user, db)


@router.get("/logout", status_code=HTTP_200_OK, response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def logout(request: Request, response: Response):
    response.delete_cookie(key="refresh_token")
    return ResponseModel(code=ResponseCode.ACK, message="Successfully Logged Out")


@router.post("/register", status_code=HTTP_202_ACCEPTED, response_model=ResponseModel)
@limiter.limit(f'{RATE_LIMIT}/minute')
async def register_user(request: Request, signup_data: SignUpModel, db: AsyncIOMotorDatabase = Depends(get_db)):
    await store_pend_user(signup_data, AuthServiceProvider.ME, db)
    return ResponseModel(code=ResponseCode.CREATED, message="Successfully Registered")


@router.post("/otp/request", status_code=HTTP_201_CREATED, response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def otp_request(request: Request, email: EmailStr):
    OTPManager().send_otp(email, purpose=OTPPurpose.LOGIN)
    return ResponseModel(code=ResponseCode.CREATED, message="Successfully sent OTP to the email")


@router.post("/otp/verify", status_code=HTTP_200_OK)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def otp_verifier(request: Request, payload: LoginOTPVerificationModel, db: AsyncIOMotorDatabase = Depends(get_db)):
    await OTPManager().verify_otp(payload.email, payload.otp, purpose=OTPPurpose.LOGIN)
    token = await login_verification(payload.email, payload.avatar, db)
    return {"loginToken": token, "tokenType": "bearer"}


@router.post("/token_login", status_code=HTTP_202_ACCEPTED, response_model=Token)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def token_login(request: Request, response: Response, user: UserSchema = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    await set_user_timestamp(email=user.email, date_time_field="lastLogIn", new_date_time=datetime.now(), db=db)
    return await tokens_generator(response, user, db)
