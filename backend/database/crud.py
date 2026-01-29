from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import EmailStr
from pymongo.errors import PyMongoError

from .schemas import UserSchema
from ..database.schemas import TodoSchema
from ..utils.sv_logger import sv_logger

TODO_COLL = "todos"
USER_COLL = "users"

async def create_todo(todo: TodoSchema, db: AsyncIOMotorDatabase):
    try:
        await db.get_collection(TODO_COLL).insert_one(todo.model_dump())
        return True
    except PyMongoError as pe:
        sv_logger.error(f"Error while inserting into DB: {pe}")
        return False

async def get_todos(limit: int, sort_by: tuple[str, int], db: AsyncIOMotorDatabase) -> list[TodoSchema]:
    todos = await db.get_collection(TODO_COLL).find({}).limit(limit).sort(*sort_by).to_list(length=limit)
    return [TodoSchema(**todo) for todo in todos]

async def get_todo(todo_id: str, db: AsyncIOMotorDatabase) -> TodoSchema:
    todo = await db.get_collection(TODO_COLL).find_one({"id": todo_id})
    return TodoSchema(**todo)

async def update(todo_id: str, new_todo: TodoSchema, db: AsyncIOMotorDatabase) -> bool:
    try:
        await db.get_collection(TODO_COLL).update_one({"id": todo_id}, {"$set": new_todo.model_dump()})
        return True
    except PyMongoError:
        return False

async def delete(todo_id: str, db: AsyncIOMotorDatabase) -> bool:
    await db.get_collection(TODO_COLL).delete_one({"id": todo_id})

async def add_new_user(user_schema: UserSchema, db: AsyncIOMotorDatabase):
    try:
        await db.get_collection(USER_COLL).insert_one(user_schema.model_dump())
    except PyMongoError as pe:
        print(f"Error at Inserting User:\n{pe}")

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