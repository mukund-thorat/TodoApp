from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import EmailStr
from pymongo.errors import PyMongoError

from backend.data.schemas import UserSchema

USER_COLL = "users"

async def fetch_user_by_email(email: EmailStr, db: AsyncIOMotorDatabase) -> Optional[UserSchema]:
    try:
        user = await db.get_collection(USER_COLL).find_one({"email": email})
    except PyMongoError:
        return None
    if user:
        return UserSchema(**user)
    return None
