import os
from datetime import timedelta, datetime

import jwt
from fastapi import Depends, HTTPException, Cookie
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
from passlib.context import CryptContext
from pydantic import EmailStr
from starlette.status import HTTP_401_UNAUTHORIZED

from backend.data.core import get_db
from backend.data.schemas import UserSchema
from backend.routers.auth.repo_user import fetch_user_by_email, fetch_user_by_refresh_token_and_user_id
from backend.utils.const import REFRESH_TOKEN_EXPIRATION_DAYS
from backend.utils.errors import NotFoundError, ValidationError

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_password_hash(password: str) -> str:
    return bcrypt_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt_context.verify(plain_password, hashed_password)


def create_access_token(email: EmailStr, user_id: str, delta_expires: timedelta):
    payload = {
        "email": email,
        "userId": user_id,
        "exp": datetime.now() + delta_expires,
    }

    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm=os.getenv("ALGORITHM"))

def decode_token(token: str):
    return jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])

def create_refresh_token(user_id: str):
    payload = {
        "userId": user_id,
        "exp": datetime.now() + timedelta(days=REFRESH_TOKEN_EXPIRATION_DAYS),
    }

    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm=os.getenv("ALGORITHM"))


async def get_current_user(token: str = Depends(oauth2_bearer), db: AsyncIOMotorDatabase = Depends(get_db)) -> UserSchema:
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        email: str = payload.get("email")
        user_id: str = payload.get("userId")

        if email is None or user_id is None:
            raise ValidationError("Invalid Credentials", details={"WWW-Authenticate": "Bearer"})

        user = await fetch_user_by_email(email, db)
        if not user:
            raise NotFoundError("User not found", details={"email": user.email})

        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Token has expired", headers={"WWW-Authenticate": "Bearer"})
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail=f"Could not validate credentials.")


async def get_current_user_refresh_token(refresh_token: str = Cookie(None), db: AsyncIOMotorDatabase = Depends(get_db)) -> UserSchema:
    if not refresh_token:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = jwt.decode(refresh_token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        user_id = payload.get("userId")

        if not user_id:
            raise ValidationError("Invalid Refresh token", details={"userId": user_id})

        user = await fetch_user_by_refresh_token_and_user_id(user_id, refresh_token, db)
        if not user:
            raise NotFoundError("User not found", details={"email": user.email})

        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Session expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid session")
