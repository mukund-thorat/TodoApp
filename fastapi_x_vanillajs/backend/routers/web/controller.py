from fastapi import APIRouter, Request
from fastapi.params import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from starlette.responses import Response

from backend.data.core import get_db
from backend.data.schemas import UserSchema
from backend.routers.todos.repo import fetch_active_todos
from backend.routers.web.service import render_or_redirect
from backend.utils.security import get_current_user_refresh_token
from backend.utils.template import templates

router = APIRouter()


@router.get("/")
async def welcome_page(request: Request) -> Response:
    return templates.TemplateResponse('welcome/welcome.html', {"request": request})

@router.get("/signup")
async def signup(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)) -> Response:
    return await render_or_redirect(request, "signup/signup.html", db)

@router.get("/pick_avatar")
async def pick_avatar(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)) -> Response:
    return await render_or_redirect(request, "avatar/avatar.html", db)

@router.get("/verify_otp")
async def verify_otp(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)) -> Response:
    return await render_or_redirect(request, "otp/otp.html", db)

@router.get("/login")
async def login(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)) -> Response:
    return await render_or_redirect(request, "login/login.html", db)

@router.get("/password_recovery")
async def password_recovery(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)) -> Response:
    return await render_or_redirect(request, "login/pass_recovery/pass_recovery.html", db)

@router.get("/app")
async def app_page(request: Request, user: UserSchema = Depends(get_current_user_refresh_token), db: AsyncIOMotorDatabase = Depends(get_db)) -> Response:
    todos = await fetch_active_todos(user_id=user.userId, limit=15, skip=0, db=db)
    return templates.TemplateResponse('app/app.html', {"request": request, "user": user, "todos": todos})

@router.get("/delete_account")
async def delete_account(request: Request, user: UserSchema = Depends(get_current_user_refresh_token)) -> Response:
    return templates.TemplateResponse('app/delete_account/delete.html', {"request": request, "email": user.email})

@router.get("/change_password")
async def change_password(request: Request, _: UserSchema = Depends(get_current_user_refresh_token)) -> Response:
    return templates.TemplateResponse('app/change_pass/change_pass.html', {"request": request})
