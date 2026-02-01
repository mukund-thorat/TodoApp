from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import PyMongoError

from backend.database.schemas import TodoSchema
from backend.utils.sv_logger import sv_logger

TODO_COLL = "todos"

async def create_todo(todo: TodoSchema, db: AsyncIOMotorDatabase):
    try:
        await db.get_collection(TODO_COLL).insert_one(todo.model_dump())
        return True
    except PyMongoError as pe:
        sv_logger.error(f"Error while inserting into DB: {pe}")
        return False

async def get_active_todos(user_id: str, limit: int, skip: int, db: AsyncIOMotorDatabase) -> list[TodoSchema]:
    todos = await db.get_collection(TODO_COLL).find({"userId": user_id, "isActive": True}).skip(skip).limit(limit).to_list(length=limit)
    return [TodoSchema(**todo) for todo in todos]

async def get_completed_todos(user_id: str, limit: int, skip: int, db: AsyncIOMotorDatabase) -> list[TodoSchema]:
    todos = await db.get_collection(TODO_COLL).find({"userId": user_id, "isActive": False}).skip(skip).limit(limit).to_list(length=limit)
    return [TodoSchema(**todo) for todo in todos]

async def get_todo(todo_id: str, db: AsyncIOMotorDatabase) -> TodoSchema:
    todo = await db.get_collection(TODO_COLL).find_one({"id": todo_id})
    return TodoSchema(**todo)

async def todo_update_title(todo_id: str, updated_title: str, db: AsyncIOMotorDatabase) -> bool:
    try:
        await db.get_collection(TODO_COLL).update_one({"id": todo_id}, {"$set": {"title": updated_title}})
        return True
    except PyMongoError:
        return False

async def mark_todo(todo_id: str, mark: bool, db: AsyncIOMotorDatabase) -> bool:
    try:
        await db.get_collection(TODO_COLL).update_one({"id": todo_id}, {"$set": {"isActive": mark}})
        return True
    except PyMongoError:
        return False

async def delete(todo_id: str, db: AsyncIOMotorDatabase) -> bool:
    await db.get_collection(TODO_COLL).delete_one({"id": todo_id})

