from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import EmailStr
from pymongo.errors import PyMongoError

from backend.database.schemas import PendingUserSchema, UserSchema
from backend.utils.sv_logger import sv_logger

PEND_USER = "pending_users"

async def add_temp_user(pend_user_schema: PendingUserSchema, db: AsyncIOMotorDatabase):
    try:
        await db.get_collection(PEND_USER).insert_one(pend_user_schema.model_dump())
    except PyMongoError as pe:
        sv_logger.error(f"Error while inserting into DB: {pe}")

async def remove_temp_user(email: EmailStr, db: AsyncIOMotorDatabase):
    await db.get_collection(PEND_USER).delete_one({"email": email})

async def get_temp_user(email: EmailStr, db: AsyncIOMotorDatabase) -> UserSchema | None:
    result = await db.get_collection(PEND_USER).find_one({"email": email})
    if result:
        return PendingUserSchema(**result)
    return None