from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import EmailStr

from backend.routers.auth.repo_user import set_user_timestamp, delete_user


async def remove_user(email: EmailStr, db: AsyncIOMotorDatabase):
    response = await delete_user(email, db)
    await set_user_timestamp(email, "deletedAt", datetime.now(), db)
    return response
