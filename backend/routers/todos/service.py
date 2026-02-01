import uuid
from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.database.schemas import TodoSchema
from backend.database.todo_service import create_todo
from backend.routers.todos.model import TodoModel


async def add_new_todo(user_id: str, todo_model: TodoModel, db: AsyncIOMotorDatabase) -> TodoSchema:
    todo_schema = TodoSchema(
        userId=user_id,
        id=str(uuid.uuid4()),
        title=todo_model.title,
        isActive=todo_model.isActive,
        priority=todo_model.priority,
        dueDate=todo_model.dueDate,
        createdAt=datetime.now(),
    )

    return await create_todo(todo_schema, db)
