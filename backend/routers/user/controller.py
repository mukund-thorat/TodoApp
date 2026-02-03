from fastapi import APIRouter, Request, Depends
from starlette.status import HTTP_200_OK

from backend.data.schemas import UserSchema
from backend.utils.const import RATE_LIMIT
from backend.utils.rate_limiting import limiter
from backend.utils.security import get_current_user
from backend.routers.user.change_pass.controller import router as change_pass_router
from backend.routers.user.delete_account.controller import router as delete_account_router

router = APIRouter(prefix="/user", tags=["user"])
router.include_router(change_pass_router)
router.include_router(delete_account_router)

@router.get("/email", status_code=HTTP_200_OK)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_user_email(_request: Request, user: UserSchema = Depends(get_current_user)):
    return {"email": user.email}
