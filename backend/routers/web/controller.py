from fastapi import APIRouter, Request
from fastapi.params import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.database.core import get_db
from backend.database.schemas import UserSchema
from backend.database.todo_service import get_active_todos
from backend.routers.auth.service import get_current_user_refresh_token
from backend.routers.web.service import redirect_logged_in_user
from backend.utils.template import templates

router = APIRouter()

@router.get("/")
async def welcome_page(request: Request):
    return templates.TemplateResponse('welcome/welcome.html', {"request": request})

@router.get("/signup")
async def signup(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)):
    is_present = await redirect_logged_in_user(request.cookies.get("refresh_token"), db)
    return is_present if is_present else templates.TemplateResponse('signup/signup.html', {"request": request})

@router.get("/pick_avatar")
async def pick_avatar(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)):
    is_present = await redirect_logged_in_user(request.cookies.get("refresh_token"), db)
    return is_present if is_present else templates.TemplateResponse('avatar/avatar.html', {"request": request})

@router.get("/verify_otp")
async def verify_otp(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)):
    is_present = await redirect_logged_in_user(request.cookies.get("refresh_token"), db)
    return is_present if is_present else templates.TemplateResponse('otp/otp.html', {"request": request})

@router.get("/login")
async def login(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)):
    is_present = await redirect_logged_in_user(request.cookies.get("refresh_token"), db)
    return is_present if is_present else templates.TemplateResponse('login/login.html', {"request": request})

@router.get("/app")
async def app_page(request: Request, user: UserSchema = Depends(get_current_user_refresh_token), db: AsyncIOMotorDatabase = Depends(get_db)):
    todos = await get_active_todos(user_id=user.userId, limit=15, skip=0, db=db)
    return templates.TemplateResponse('app/app.html', {"request": request, "user": user, "todos": todos})

@router.get("/delete_account")
async def app_page(request: Request, user: UserSchema = Depends(get_current_user_refresh_token)):
    return templates.TemplateResponse('app/delete_account/delete.html', {"request": request, "email": user.email})
