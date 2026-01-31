from fastapi import APIRouter, Request
from fastapi.params import Depends

from backend.routers.auth.service import get_current_user_from_cookie
from backend.utils.template import templates

router = APIRouter()

@router.get("/")
async def welcome_page(request: Request):
    return templates.TemplateResponse('welcome/welcome.html', {"request": request})

@router.get("/login")
async def login(request: Request):
    return templates.TemplateResponse('login/login.html', {"request": request})

@router.get("/signup")
async def signup(request: Request):
    return templates.TemplateResponse('signup/signup.html', {"request": request})

@router.get("/app")
async def app_page(request: Request, _: dict = Depends(get_current_user_from_cookie)):
    return templates.TemplateResponse('app/app.html', {"request": request})

@router.get("/pick_avatar")
async def pick_avatar(request: Request):
    return templates.TemplateResponse('avatar/avatar.html', {"request": request})

@router.get("/verify_otp")
async def pick_avatar(request: Request):
    return templates.TemplateResponse('otp/otp.html', {"request": request})