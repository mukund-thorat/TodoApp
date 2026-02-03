from fastapi import APIRouter, Request, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from starlette.status import HTTP_200_OK, HTTP_201_CREATED

from backend.data.core import get_db
from backend.data.schemas import UserSchema
from backend.routers.auth.models import UserCredentials
from backend.routers.auth.service import authenticate_user
from backend.routers.user.delete_account.models import OTPVerificationModel
from backend.routers.user.delete_account.service import remove_user
from backend.utils.const import RATE_LIMIT
from backend.utils.otp_manager import OTPManager, OTPPurpose
from backend.utils.rate_limiting import limiter
from backend.utils.response_model import ResponseModel, ResponseCode
from backend.utils.security import get_current_user

router = APIRouter(prefix="/delete_account", tags=["user_delete_account"])


@router.post("/verify_password", response_model=ResponseModel, status_code=HTTP_201_CREATED)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def verify_password(_request: Request, credentials: UserCredentials, _: UserSchema = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    await authenticate_user(credentials=credentials, db=db)
    OTPManager().send_otp(email=credentials.email, purpose=OTPPurpose.DEL_ACC)
    return ResponseModel(code=ResponseCode.CREATED, message="OTP sent to the email")

@router.post("/otp/verify", status_code=HTTP_200_OK, response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def verify_otp(_request: Request, payload: OTPVerificationModel, user: UserSchema = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    await OTPManager().verify_otp(user.email, payload.otp, purpose=OTPPurpose.DEL_ACC)
    await remove_user(email=user.email, db=db)
    return ResponseModel(code=ResponseCode.ACK, message="Account deleted successfully!", details={"email": user.email})
