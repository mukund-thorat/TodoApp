from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import EmailStr
from pymongo.errors import PyMongoError

from backend.database.schemas import UserSchema
from backend.utils.sv_logger import sv_logger

USER_COLL = "users"

async def add_new_user(user_schema: UserSchema, db: AsyncIOMotorDatabase):
    try:
        await db.get_collection(USER_COLL).insert_one(user_schema.model_dump())
    except PyMongoError as pe:
        sv_logger.error(f"Error while inserting into DB: {pe}")

async def get_user_by_email(email: EmailStr, db: AsyncIOMotorDatabase) -> UserSchema | None:
    user = await db.get_collection(USER_COLL).find_one({"email": email})
    if user:
        return UserSchema(**user)
    return None

async def remove_user(user_schema: UserSchema, db: AsyncIOMotorDatabase):
    await db.get_collection(USER_COLL).delete_one({"email": user_schema.email})

async def update_user_password(email: EmailStr, new_hashed_password: str, db: AsyncIOMotorDatabase):
    await db.get_collection(USER_COLL).update_one({"email": email}, {"$set": {"passwordHash": new_hashed_password}})

async def update_user_records(email: EmailStr, date_time_field: str, new_date_time: datetime, db: AsyncIOMotorDatabase):
    await db.get_collection(USER_COLL).update_one({"email": email}, {"$set": {date_time_field: new_date_time}})

async def update_refresh_token(email: EmailStr, new_refresh_token: str, db: AsyncIOMotorDatabase):
    await db.get_collection(USER_COLL).update_one({"email": email}, {"$set": {"refreshToken": new_refresh_token}})

async def get_user_by_refresh_token(refresh_token: str, db: AsyncIOMotorDatabase) -> UserSchema | None:
    user = await db.get_collection(USER_COLL).find_one({"refreshToken": refresh_token})
    if user:
        return UserSchema(**user)
    return None

async def get_user_by_rt_and_user_id(user_id: str, refresh_token: str, db: AsyncIOMotorDatabase) -> UserSchema | None:
    user = await db.get_collection(USER_COLL).find_one({"refreshToken": refresh_token, "userId": user_id})
    if user:
        return UserSchema(**user)
    return None
