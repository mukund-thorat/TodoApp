from fastapi import APIRouter, Request, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from starlette.status import HTTP_200_OK, HTTP_201_CREATED

from backend.data.core import get_db
from backend.data.schemas import UserSchema
from backend.routers.auth.models import UserCredentials
from backend.routers.auth.repo_user import set_user_password
from backend.routers.auth.service import authenticate_user
from backend.routers.user.change_pass.models import PasswordChangeModel
from backend.utils.const import RATE_LIMIT
from backend.utils.otp_manager import OTPManager, OTPPurpose
from backend.utils.rate_limiting import limiter
from backend.utils.response_model import ResponseModel, ResponseCode
from backend.utils.security import get_current_user, get_password_hash

router = APIRouter(prefix="/change_password", tags=["User Password Change"])


@router.post("/verify_password", response_model=ResponseModel, status_code=HTTP_201_CREATED)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def verify_password(_request: Request, credentials: UserCredentials, _: UserSchema = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    await authenticate_user(credentials=credentials, db=db)
    OTPManager().send_otp(email=credentials.email, purpose=OTPPurpose.PASS_CHANGE)
    return ResponseModel(code=ResponseCode.CREATED, message="OTP sent to the email")


@router.post("/otp/verify", status_code=HTTP_200_OK, response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def verify_otp(_request: Request, payload: PasswordChangeModel, user: UserSchema = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    await OTPManager().verify_otp(user.email, payload.otp, purpose=OTPPurpose.PASS_CHANGE)
    await set_user_password(user.email, get_password_hash(payload.newPassword), db)
    return ResponseModel(code=ResponseCode.UPDATED, message="Password Changed successfully!", details={"email": user.email})
