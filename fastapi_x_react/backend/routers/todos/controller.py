import uuid

from fastapi import APIRouter, Request
from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.status import HTTP_200_OK, HTTP_201_CREATED

from routers.todos.models import TodoModel
from routers.todos.repo import fetch_active_todos, fetch_completed_todos, set_todo_title, set_todo_active_status, delete_todo
from routers.todos.service import add_new_todo
from data.core import get_db
from utils.const import RATE_LIMIT
from utils.pydantic_cm import UserModel
from utils.response_model import ResponseModel, ResponseCode
from utils.security.rate_limiting import limiter
from utils.security.tokens import get_current_user
from utils.sql_pydantic_parser import todo_2_p

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("/active", response_model=list[TodoModel], status_code=HTTP_200_OK)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_active_todos(request: Request, limit: int = 15, skip: int = 0, db: AsyncSession = Depends(get_db), user: UserModel = Depends(get_current_user)) -> list[TodoModel]:
    todos = await fetch_active_todos(user_id=user.id, limit=limit, skip=skip, db=db)
    return [todo_2_p(todo) for todo in todos]

@router.get("/inactive", response_model=list[TodoModel], status_code=HTTP_200_OK)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def get_inactive_todos(request: Request, limit: int = 15, skip: int = 0, db: AsyncSession = Depends(get_db), user: UserModel = Depends(get_current_user)) -> list[TodoModel]:
    todos = await fetch_completed_todos(user_id=user.id, limit=limit, skip=skip, db=db)
    return [todo_2_p(todo) for todo in todos]

@router.post("/create", response_model=ResponseModel, status_code=HTTP_201_CREATED)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def create_todo(request: Request, model: TodoModel, db: AsyncSession = Depends(get_db), user: UserModel = Depends(get_current_user)) -> ResponseModel:
    await add_new_todo(user.id, model, db)
    return ResponseModel(code=ResponseCode.CREATED, message="Created Todo Item successfully")

@router.put("/update_title/{todo_id}", response_model=ResponseModel, status_code=HTTP_200_OK)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def update_title(request: Request, todo_id: str, updated_title: str, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_user)) -> ResponseModel:
    await set_todo_title(todo_id=todo_id, updated_title=updated_title, db=db)
    return ResponseModel(code=ResponseCode.UPDATED, message="Updated title successfully", details={"todoId": todo_id})

@router.put("/update_status/{todo_id}", response_model=ResponseModel, status_code=HTTP_200_OK)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def update_status(request: Request, todo_id: str, status: bool, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_user)) -> ResponseModel:
    await set_todo_active_status(todo_id=todo_id, status=status, db=db)
    return ResponseModel(code=ResponseCode.UPDATED, message="Updated status successfully", details={"status": status})

@router.delete("/remove/{todo_id}", response_model=ResponseModel, status_code=HTTP_200_OK)
@limiter.limit(f"{RATE_LIMIT}/minute")
async def remove_todo(request: Request, todo_id: uuid.UUID, db: AsyncSession = Depends(get_db), _: UserModel = Depends(get_current_user)) -> ResponseModel:
    await delete_todo(todo_id=todo_id, db=db)
    return ResponseModel(code=ResponseCode.DELETED, message="Deleted Todo Item successfully", details={"todoId": todo_id})
