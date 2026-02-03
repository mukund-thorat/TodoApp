from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import EmailStr
from pymongo.errors import PyMongoError

from backend.data.schemas import UserSchema
from backend.utils.errors import DatabaseError, NotFoundError
from backend.utils.sv_logger import sv_logger

USER_COLL = "users"

async def insert_user(user_schema: UserSchema, db: AsyncIOMotorDatabase):
    try:
        await db.get_collection(USER_COLL).insert_one(user_schema.model_dump())
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to insert user",
            extra={"collection": USER_COLL, "email": user_schema.email},
        )
        raise DatabaseError(details={"collection": USER_COLL}) from pe

async def fetch_user_by_email(email: EmailStr, db: AsyncIOMotorDatabase) -> UserSchema:
    try:
        user = await db.get_collection(USER_COLL).find_one({"email": email})
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to fetch user by email",
            extra={"collection": USER_COLL, "email": email},
        )
        raise DatabaseError(details={"collection": USER_COLL}) from pe
    if user:
        return UserSchema(**user)
    raise NotFoundError("User not found", details={"email": email})

async def delete_user(email: EmailStr, db: AsyncIOMotorDatabase):
    try:
        result = await db.get_collection(USER_COLL).delete_one({"email": email})
        if result.deleted_count == 0:
            raise NotFoundError("User not found", details={"email": email})
        return True
    except Exception as e:
        sv_logger.error(
            "Failed to delete user",
            extra={"collection": USER_COLL, "email": email},
        )
        raise DatabaseError(details={"collection": USER_COLL, "email": email}) from e

async def set_user_password(email: EmailStr, new_hashed_password: str, db: AsyncIOMotorDatabase):
    try:
        response = await db.get_collection(USER_COLL).update_one({"email": email}, {"$set": {"passwordHash": new_hashed_password}})
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to update user password",
            extra={"collection": USER_COLL, "email": email},
        )
        raise DatabaseError(details={"collection": USER_COLL, "email": email}) from pe
    if response.modified_count == 0:
        raise NotFoundError("User not found", details={"email": email})

async def set_user_timestamp(email: EmailStr, date_time_field: str, new_date_time: datetime, db: AsyncIOMotorDatabase):
    try:
        await db.get_collection(USER_COLL).update_one({"email": email}, {"$set": {date_time_field: new_date_time}})
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to update user records",
            extra={"collection": USER_COLL, "email": email, "field": date_time_field},
        )
        raise DatabaseError(details={"collection": USER_COLL, "email": email}) from pe

async def set_refresh_token(email: EmailStr, new_refresh_token: str, db: AsyncIOMotorDatabase):
    try:
        await db.get_collection(USER_COLL).update_one({"email": email}, {"$set": {"refreshToken": new_refresh_token}})
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to update refresh token",
            extra={"collection": USER_COLL, "email": email},
        )
        raise DatabaseError(details={"collection": USER_COLL, "email": email}) from pe

async def fetch_user_by_refresh_token(refresh_token: str, db: AsyncIOMotorDatabase) -> UserSchema:
    try:
        user = await db.get_collection(USER_COLL).find_one({"refreshToken": refresh_token})
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to fetch user by refresh token",
            extra={"collection": USER_COLL},
        )
        raise DatabaseError(details={"collection": USER_COLL}) from pe
    if user:
        return UserSchema(**user)
    raise NotFoundError("User not found")

async def fetch_user_by_refresh_token_and_user_id(user_id: str, refresh_token: str, db: AsyncIOMotorDatabase) -> UserSchema:
    try:
        user = await db.get_collection(USER_COLL).find_one({"refreshToken": refresh_token, "userId": user_id})
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to fetch user by refresh token and user id",
            extra={"collection": USER_COLL, "user_id": user_id},
        )
        raise DatabaseError(details={"collection": USER_COLL, "user_id": user_id}) from pe
    if user:
        return UserSchema(**user)
    raise NotFoundError("User not found", details={"userId": user_id})
