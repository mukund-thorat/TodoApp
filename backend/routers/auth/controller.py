from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.params import Depends, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import EmailStr
from starlette.status import HTTP_201_CREATED, HTTP_406_NOT_ACCEPTABLE, HTTP_202_ACCEPTED, HTTP_401_UNAUTHORIZED, \
    HTTP_404_NOT_FOUND, HTTP_200_OK

from backend.database.core import get_db
from backend.database.schemas import UserSchema
from backend.database.user_service import get_user_by_refresh_token, update_refresh_token
from backend.routers.auth.model import UserCredentials, SignUpModel, OTPVerificationModel
from backend.routers.auth.otp_manager import OTPManager
from backend.routers.auth.service import authenticate_user, create_access_token, get_current_user, \
    create_refresh_token, store_temp_user
from backend.utils.const import ACCESS_TOKEN_EXPIRE_MINUTES, RATE_LIMIT
from backend.utils.rate_limiting import limiter

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", status_code=HTTP_202_ACCEPTED)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def login(request: Request, response: Response, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: AsyncIOMotorDatabase = Depends(get_db)):
    if form_data.username is None or form_data.password is None:
        raise HTTPException(status_code=HTTP_406_NOT_ACCEPTABLE, detail="Email or password is required")

    credentials = UserCredentials(email=form_data.username, password=form_data.password)
    user = await authenticate_user(credentials=credentials, db=db)

    if not user:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Authentication Failed!")

    return await login_process(response, user, db)

@router.get("/refresh")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def token_refresher(request: Request, response: Response, refresh_token: str = Cookie(None), db: AsyncIOMotorDatabase = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Refresh token missing")

    user = await get_user_by_refresh_token(refresh_token=refresh_token, db=db)

    if user is None:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Invalid refresh token!")

    new_refresh_token = create_refresh_token(user_id=user['userId'])
    access_token = create_access_token(email=user['email'], user_id=user['userId'], delta_expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    await update_refresh_token(email=user['email'], new_refresh_token=new_refresh_token, db=db)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=7 * 24 * 60 * 60
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_me(request: Request, user: UserSchema = Depends(get_current_user)):
    if user is None:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Authentication Failed!")
    return user

@router.post("/register", status_code=HTTP_202_ACCEPTED)
@limiter.limit(f'{RATE_LIMIT}/minute')
async def register_user(request: Request, signup_data: SignUpModel, db: AsyncIOMotorDatabase = Depends(get_db)):
    if signup_data.email is None or signup_data.password is None or signup_data is None:
        raise HTTPException(status_code=HTTP_406_NOT_ACCEPTABLE, detail="Invalid signup data")
    await store_temp_user(signup_data, db)
    return {"message": "User registered", "status": "SUCCESS"}

@router.post("/otp/request", status_code=HTTP_201_CREATED)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def otp_request(request: Request, email: EmailStr):
    otp_manager = OTPManager()
    is_send = otp_manager.send_otp(email)
    return {"msg": 'successfully sent OTP to {}'.format(email), 'status': 'SUCCESS'} if is_send else {"msg": 'failed to send OTP to {}'.format(email), 'status': 'FAILED'}

@router.post("/otp/verify_otp", status_code=HTTP_200_OK)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def otp_verifier(request: Request, otp_payload: OTPVerificationModel, db: AsyncIOMotorDatabase = Depends(get_db)):
    otp_manager = OTPManager()
    token = await otp_manager.verify_otp(otp_payload.email, otp_payload.otp, otp_payload.avatar, db)
    return {"login_token": token, "token_type": "bearer"}

@router.post("/token_login", status_code=HTTP_202_ACCEPTED)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def token_login(request: Request, response: Response, user: UserSchema = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Authentication Failed!")

    return await login_process(user, response, db)

async def login_process(response: Response, user: UserSchema, db: AsyncIOMotorDatabase):
    refresh_token = create_refresh_token(user_id=user.userId)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=7 * 24 * 60 * 60
    )

    await update_refresh_token(email=user.email, new_refresh_token=refresh_token, db=db)

    return {
        "access_token": create_access_token(email=user.email, user_id=user.userId,delta_expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)),
        "token_type": "bearer"
    }
