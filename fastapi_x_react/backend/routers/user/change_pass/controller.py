from fastapi import APIRouter, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_200_OK, HTTP_201_CREATED

from data.core import get_db
from data.schemas import User
from routers.auth.models import UserCredentials
from routers.auth.repo_user import set_user_password
from routers.auth.service import authenticate_user
from routers.user.change_pass.models import PasswordChangeModel
from utils.const import RATE_LIMIT
from utils.response_model import ResponseModel, ResponseCode
from utils.security.hashing import get_password_hash
from utils.security.otp_manager import OTPPurpose, OTPManager
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_user

router = APIRouter(prefix="/change_password", tags=["User Password Change"])


@router.post("/verify_password", response_model=ResponseModel, status_code=HTTP_201_CREATED)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def verify_password(request: Request, credentials: UserCredentials, _: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await authenticate_user(credentials=credentials, db=db)
    await OTPManager().send_otp(email=credentials.email, purpose=OTPPurpose.PASS_CHANGE)
    return ResponseModel(code=ResponseCode.CREATED, message="OTP sent to the email")


@router.post("/otp/verify", status_code=HTTP_200_OK, response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def verify_otp(request: Request, payload: PasswordChangeModel, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await OTPManager().verify_otp(user.email, payload.otp, purpose=OTPPurpose.PASS_CHANGE)
    await set_user_password(user.email, get_password_hash(payload.newPassword), db)
    return ResponseModel(code=ResponseCode.UPDATED, message="Password Changed successfully!", details={"email": user.email})
