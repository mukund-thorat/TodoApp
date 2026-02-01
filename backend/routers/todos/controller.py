from fastapi import APIRouter, Request
from fastapi.params import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from .model import TodoModel
from .service import add_new_todo
from ..auth.service import get_current_user
from ...database.core import get_db
from ...database.schemas import TodoSchema, UserSchema
from ...database.todo_service import get_active_todos, delete, mark_todo, get_completed_todos, todo_update_title
from ...utils.const import RATE_LIMIT
from ...utils.rate_limiting import limiter

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("/active_todos")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def fetch_all_active_todos(request: Request, limit: int = 15, skip: int = 0, db: AsyncIOMotorDatabase = Depends(get_db), user: UserSchema = Depends(get_current_user)) -> list[TodoSchema]:
    return await get_active_todos(user_id=user.userId, limit=limit, skip=skip, db=db)

@router.get("/inactive_todos")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def fetch_all_active_todos(request: Request, limit: int = 15, skip: int = 0, db: AsyncIOMotorDatabase = Depends(get_db), user: UserSchema = Depends(get_current_user)) -> list[TodoSchema]:
    return await get_completed_todos(user_id=user.userId, limit=limit, skip=skip, db=db)

@router.post("/create")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def create_todo(request: Request, model: TodoModel, db: AsyncIOMotorDatabase = Depends(get_db), user: UserSchema = Depends(get_current_user)) -> dict:
    response = await add_new_todo(user.userId, model, db)
    return {"message": "Todo created successfully."} if response else {"message": "Failed to create todo."}

@router.put("/update_title/{todo_id}")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def update_title(request: Request, todo_id: str, updated_title: str, db: AsyncIOMotorDatabase = Depends(get_db)) -> dict:
    response = await todo_update_title(todo_id=todo_id, updated_title=updated_title, db=db)
    return {"message": "Todo updated successfully."} if response else {"message": "Failed to update todo."}

@router.put("/todo_marker/{todo_id}")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def todo_marker(request: Request, todo_id: str, mark: bool, db: AsyncIOMotorDatabase = Depends(get_db)) -> dict:
    response = await mark_todo(todo_id=todo_id, mark=mark, db=db)
    return {"message": f"Todo marked as {mark}"} if response else {"message": f"Failed to update todo."}

@router.delete("/delete/{todo_id}")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def delete_todo(request: Request, todo_id: str, db: AsyncIOMotorDatabase = Depends(get_db)) -> dict:
    response = await delete(todo_id=todo_id, db=db)
    return {"message": "Todo deleted successfully."} if response is None else {"message": "Failed to delete todo."}
