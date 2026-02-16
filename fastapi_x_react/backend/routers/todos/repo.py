from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import PyMongoError

from backend.data.schemas import TodoSchema
from backend.utils.errors import DatabaseError, NotFoundError
from backend.utils.sv_logger import sv_logger

TODO_COLL = "todos"

async def insert_todo(todo: TodoSchema, db: AsyncIOMotorDatabase) -> TodoSchema:
    try:
        await db.get_collection(TODO_COLL).insert_one(todo.model_dump())
        return todo
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to insert todo",
            extra={"collection": TODO_COLL, "todo_id": todo.id, "user_id": todo.userId},
        )
        raise DatabaseError(details={"collection": TODO_COLL}) from pe

async def fetch_active_todos(user_id: str, limit: int, skip: int, db: AsyncIOMotorDatabase) -> list[TodoSchema]:
    try:
        todos = await db.get_collection(TODO_COLL).find({"userId": user_id, "isActive": True}).skip(skip).limit(limit).to_list(length=limit)
        return [TodoSchema(**todo) for todo in todos]
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to fetch active todos",
            extra={"collection": TODO_COLL, "user_id": user_id},
        )
        raise DatabaseError(details={"collection": TODO_COLL}) from pe

async def fetch_completed_todos(user_id: str, limit: int, skip: int, db: AsyncIOMotorDatabase) -> list[TodoSchema]:
    try:
        todos = await db.get_collection(TODO_COLL).find({"userId": user_id, "isActive": False}).skip(skip).limit(limit).to_list(length=limit)
        return [TodoSchema(**todo) for todo in todos]
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to fetch completed todos",
            extra={"collection": TODO_COLL, "user_id": user_id},
        )
        raise DatabaseError(details={"collection": TODO_COLL}) from pe

async def fetch_todo_by_id(todo_id: str, db: AsyncIOMotorDatabase) -> TodoSchema:
    try:
        todo = await db.get_collection(TODO_COLL).find_one({"id": todo_id})
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to fetch todo",
            extra={"collection": TODO_COLL, "todo_id": todo_id},
        )
        raise DatabaseError(details={"collection": TODO_COLL}) from pe
    if not todo:
        raise NotFoundError("Todo not found", details={"todo_id": todo_id})
    return TodoSchema(**todo)

async def set_todo_title(todo_id: str, updated_title: str, db: AsyncIOMotorDatabase):
    try:
        result = await db.get_collection(TODO_COLL).update_one({"id": todo_id}, {"$set": {"title": updated_title}})
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to update todo title",
            extra={"collection": TODO_COLL, "todo_id": todo_id},
        )
        raise DatabaseError(details={"collection": TODO_COLL, "todo_id": todo_id}) from pe
    if result.matched_count == 0:
        raise NotFoundError("Todo not found", details={"todo_id": todo_id})

async def set_todo_active_status(todo_id: str, status: bool, db: AsyncIOMotorDatabase):
    try:
        result = await db.get_collection(TODO_COLL).update_one({"id": todo_id}, {"$set": {"isActive": status}})
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to update todo status",
            extra={"collection": TODO_COLL, "todo_id": todo_id, "status": status},
        )
        raise DatabaseError(details={"collection": TODO_COLL, "todo_id": todo_id}) from pe
    if result.matched_count == 0:
        raise NotFoundError("Todo not found", details={"todo_id": todo_id})

async def delete_todo(todo_id: str, db: AsyncIOMotorDatabase):
    try:
        result = await db.get_collection(TODO_COLL).delete_one({"id": todo_id})
    except PyMongoError as pe:
        sv_logger.error(
            "Failed to delete todo",
            extra={"collection": TODO_COLL, "todo_id": todo_id},
        )
        raise DatabaseError(details={"collection": TODO_COLL, "todo_id": todo_id}) from pe
    if result.deleted_count == 0:
        raise NotFoundError("Todo not found", details={"todo_id": todo_id})
