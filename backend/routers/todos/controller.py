from fastapi import APIRouter, Request
from fastapi.params import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from .models import TodoModel
from .repo import fetch_active_todos, fetch_completed_todos, set_todo_title, set_todo_active_status, delete_todo
from .service import add_new_todo
from ...data.core import get_db
from ...data.schemas import TodoSchema, UserSchema
from ...utils.const import RATE_LIMIT
from ...utils.rate_limiting import limiter
from ...utils.response_model import ResponseModel, ResponseCode
from ...utils.security import get_current_user

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("/active")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_active_todos(_request: Request, limit: int = 15, skip: int = 0, db: AsyncIOMotorDatabase = Depends(get_db), user: UserSchema = Depends(get_current_user)) -> list[TodoSchema]:
    return await fetch_active_todos(user_id=user.userId, limit=limit, skip=skip, db=db)

@router.get("/inactive")
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_inactive_todos(_request: Request, limit: int = 15, skip: int = 0, db: AsyncIOMotorDatabase = Depends(get_db), user: UserSchema = Depends(get_current_user)) -> list[TodoSchema]:
    return await fetch_completed_todos(user_id=user.userId, limit=limit, skip=skip, db=db)

@router.post("/create", response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def create_todo(_request: Request, model: TodoModel, db: AsyncIOMotorDatabase = Depends(get_db), user: UserSchema = Depends(get_current_user)) -> dict:
    todo = await add_new_todo(user.userId, model, db)
    return ResponseModel(code=ResponseCode.CREATED, message="Created Todo Item successfully", details={"todo": todo})

@router.put("/update_title/{todo_id}", response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def update_title(_request: Request, todo_id: str, updated_title: str, db: AsyncIOMotorDatabase = Depends(get_db)) -> ResponseModel:
    await set_todo_title(todo_id=todo_id, updated_title=updated_title, db=db)
    return ResponseModel(code=ResponseCode.UPDATED, message="Updated title successfully", details={"todoId": todo_id})

@router.put("/update_status/{todo_id}", response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def update_status(_request: Request, todo_id: str, status: bool, db: AsyncIOMotorDatabase = Depends(get_db)) -> ResponseModel:
    await set_todo_active_status(todo_id=todo_id, status=status, db=db)
    return ResponseModel(code=ResponseCode.UPDATED, message="Updated status successfully", details={"status": status})

@router.delete("/remove/{todo_id}", response_model=ResponseModel)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def remove_todo(_request: Request, todo_id: str, db: AsyncIOMotorDatabase = Depends(get_db)) -> ResponseModel:
    await delete_todo(todo_id=todo_id, db=db)
    return ResponseModel(code=ResponseCode.DELETED, message="Deleted Todo Item successfully", details={"todoId": todo_id})
