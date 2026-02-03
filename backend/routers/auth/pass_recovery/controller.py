from fastapi import APIRouter, Depends, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import EmailStr
from starlette.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_202_ACCEPTED

from backend.data.core import get_db
from backend.routers.auth.pass_recovery.models import PassRecoveryOTPVerificationModel, PasswordRecoveryModel
from backend.routers.auth.pass_recovery.service import change_user_password_by_token, generate_recovery_token
from backend.routers.auth.repo_user import fetch_user_by_email
from backend.utils.const import RATE_LIMIT
from backend.utils.otp_manager import OTPManager, OTPPurpose
from backend.utils.rate_limiting import limiter
from backend.utils.response_model import ResponseModel, ResponseCode

router = APIRouter(prefix="/recovery", tags=["User Password Recovery"])


@router.get("/otp/request", status_code=HTTP_201_CREATED, response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def generate_otp(_request: Request, email: EmailStr, db: AsyncIOMotorDatabase = Depends(get_db)):
    await fetch_user_by_email(email=email, db=db)
    OTPManager().send_otp(email, purpose=OTPPurpose.PASS_RECOVER)
    return ResponseModel(code=ResponseCode.CREATED, message="Successfully sent OTP to the email")


@router.post("/otp/verify", status_code=HTTP_200_OK)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def verify_otp(_request: Request, payload: PassRecoveryOTPVerificationModel):
    await OTPManager().verify_otp(payload.email, payload.otp, purpose=OTPPurpose.PASS_RECOVER)
    return await generate_recovery_token(payload.email)


@router.post("/change_password", status_code=HTTP_202_ACCEPTED)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def change_password(_request: Request, payload: PasswordRecoveryModel, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await change_user_password_by_token(token=payload.recoveryToken, new_password=payload.newPassword, db=db)
