from datetime import timedelta

from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import EmailStr

from backend.routers.auth.repo_user import set_user_password
from backend.utils.security import create_access_token, get_current_user, get_password_hash


async def generate_recovery_token(email: EmailStr) -> str:
    return {
        "recoveryToken": create_access_token(email=email, user_id="RECOVERY", delta_expires=timedelta(minutes=5)),
        "tokenType": "bearer"
    }


async def change_user_password_by_token(token: str, new_password: str, db: AsyncIOMotorDatabase) -> bool:
    user = await get_current_user(token=token, db=db)
    return await set_user_password(user.email, get_password_hash(new_password), db)
