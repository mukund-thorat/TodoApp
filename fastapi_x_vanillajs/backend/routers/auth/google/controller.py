import os

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Request, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from starlette import status

from backend.data.core import get_db
from backend.routers.auth.google.service import login_or_create_user


router = APIRouter(prefix="/google", tags=["google_auth"])

oauth = OAuth()

oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

@router.get("/login", status_code=status.HTTP_202_ACCEPTED)
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback", name="google_callback")
async def google_callback(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    if not user_info:
        raise HTTPException(status_code=400, detail="Google authentication failed")

    email = user_info["email"]
    first_name = user_info.get("given_name")
    last_name = user_info.get("family_name")

    return await login_or_create_user(email=email, first_name=first_name, last_name=last_name, db=db)