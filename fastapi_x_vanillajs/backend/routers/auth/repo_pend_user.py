from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import EmailStr
from pymongo.errors import PyMongoError

from backend.data.schemas import PendingUserSchema, UserSchema
from backend.utils.errors import DatabaseError
from backend.utils.sv_logger import sv_logger

PEND_USER = "pending_users"

async def insert_pend_user(pend_user_schema: PendingUserSchema, db: AsyncIOMotorDatabase):
    try:
        await db.get_collection(PEND_USER).insert_one(pend_user_schema.model_dump())
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to insert pending user",
            extra={"collection": PEND_USER, "email": pend_user_schema.email},
        )
        raise DatabaseError(details={"email", pend_user_schema.email}) from pe

async def delete_pend_user(email: EmailStr, db: AsyncIOMotorDatabase):
    try:
        await db.get_collection(PEND_USER).delete_one({"email": email})
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to remove pending user",
            extra={"collection": PEND_USER, "email": email},
        )
        raise DatabaseError(details={"email": email}) from pe

async def fetch_pend_user(email: EmailStr, db: AsyncIOMotorDatabase) -> UserSchema | None:
    try:
        result = await db.get_collection(PEND_USER).find_one({"email": email})
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to fetch pending user",
            extra={"collection": PEND_USER, "email": email},
        )
        raise DatabaseError(details={"email": email}) from pe
    if result:
        return PendingUserSchema(**result)
    return None
