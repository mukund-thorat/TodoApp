from fastapi import APIRouter, Request
from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import Response

from data.core import get_db
from data.schemas import User
from routers.todos.repo import fetch_active_todos
from routers.web.service import render_or_redirect
from utils.security.tokens import get_current_user_refresh_token
from utils.template import templates

router = APIRouter()


@router.get("/")
async def welcome_page(request: Request) -> Response:
    return templates.TemplateResponse('welcome/welcome.html', {"request": request})

@router.get("/signup")
async def signup(request: Request, db: AsyncSession = Depends(get_db)) -> Response:
    return await render_or_redirect(request, "signup/signup.html", db)

@router.get("/pick_avatar")
async def pick_avatar(request: Request, db: AsyncSession = Depends(get_db)) -> Response:
    return await render_or_redirect(request, "avatar/avatar.html", db)

@router.get("/verify_otp")
async def verify_otp(request: Request, db: AsyncSession = Depends(get_db)) -> Response:
    return await render_or_redirect(request, "otp/otp.html", db)

@router.get("/login")
async def login(request: Request, db: AsyncSession = Depends(get_db)) -> Response:
    return await render_or_redirect(request, "login/login.html", db)

@router.get("/password_recovery")
async def password_recovery(request: Request, db: AsyncSession = Depends(get_db)) -> Response:
    return await render_or_redirect(request, "login/pass_recovery/pass_recovery.html", db)

@router.get("/app")
async def app_page(request: Request, user: User = Depends(get_current_user_refresh_token), db: AsyncSession = Depends(get_db)) -> Response:
    todos = await fetch_active_todos(user_id=user.id, limit=15, skip=0, db=db)
    return templates.TemplateResponse('app/app.html', {"request": request, "user": user, "todos": todos})

@router.get("/delete_account")
async def delete_account(request: Request, user: User = Depends(get_current_user_refresh_token)) -> Response:
    return templates.TemplateResponse('app/delete_account/delete.html', {"request": request, "email": user.email})

@router.get("/change_password")
async def change_password(request: Request, _: User = Depends(get_current_user_refresh_token)) -> Response:
    return templates.TemplateResponse('app/change_pass/change_pass.html', {"request": request})
