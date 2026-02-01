from fastapi import APIRouter, Request
from fastapi.params import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.database.core import get_db
from backend.database.schemas import UserSchema
from backend.database.todo_service import get_active_todos
from backend.routers.auth.service import get_current_user_refresh_token
from backend.utils.template import templates

router = APIRouter()

@router.get("/")
async def welcome_page(request: Request):
    return templates.TemplateResponse('welcome/welcome.html', {"request": request})

@router.get("/signup")
async def signup(request: Request):
    return templates.TemplateResponse('signup/signup.html', {"request": request})

@router.get("/pick_avatar")
async def pick_avatar(request: Request):
    return templates.TemplateResponse('avatar/avatar.html', {"request": request})

@router.get("/verify_otp")
async def verify_otp(request: Request):
    return templates.TemplateResponse('otp/otp.html', {"request": request})

@router.get("/login")
async def login(request: Request):
    return templates.TemplateResponse('login/login.html', {"request": request})

@router.get("/app")
async def app_page(request: Request, user: UserSchema = Depends(get_current_user_refresh_token), db: AsyncIOMotorDatabase = Depends(get_db)):
    todos = await get_active_todos(user_id=user.userId, limit=15, skip=0, db=db)
    return templates.TemplateResponse('app/app.html', {"request": request, "user": user, "todos": todos})
