import os
import uuid

from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import Depends, HTTPException
from fastapi.params import Cookie
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
from passlib.context import CryptContext
from pydantic import EmailStr
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_404_NOT_FOUND

from backend.database.core import get_db
from backend.database.crud import add_new_user, get_user_by_email, get_user_by_rt_and_user_id
from backend.database.schemas import UserSchema
from backend.routers.auth.model import UserCredentials, SignUpModel
from backend.utils.const import REFRESH_TOKEN_EXPIRATION_DAYS

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def create_user(sign_up_model: SignUpModel, db: AsyncIOMotorDatabase):
    user_schema = UserSchema(
        userId=str(uuid.uuid4()),
        firstName=sign_up_model.firstName,
        lastName=sign_up_model.lastName,
        email=sign_up_model.email,
        passwordHash=bcrypt_context.hash(sign_up_model.password),
        refreshToken=None,
        createdAt=datetime.now(),
        deletedAt=None,
        lastLogIn=None,
    )

    await add_new_user(user_schema, db)

async def authenticate_user(credentials: UserCredentials, db: AsyncIOMotorDatabase) -> UserSchema | None:
    user: Optional[UserSchema] = await get_user_by_email(email=credentials.email, db=db)

    if user is None or not bcrypt_context.verify(credentials.password, user.passwordHash):
        return None
    return user

def create_access_token(email: EmailStr, user_id: str, delta_expires: timedelta):
    payload = {
        "email": email,
        "userId": user_id,
        "exp": datetime.now() + delta_expires,
    }

    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm=os.getenv("ALGORITHM"))

def create_refresh_token(user_id: str):
    payload = {
        "userId": user_id,
        "exp": datetime.now() + timedelta(days=REFRESH_TOKEN_EXPIRATION_DAYS),
    }

    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm=os.getenv("ALGORITHM"))

async def get_current_user(token: str = Depends(oauth2_bearer)) -> dict:
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        email: str = payload.get("email")
        user_id: str = payload.get("userId")

        if email is None or user_id is None:
            raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid jwt encoded data", headers={"WWW-Authenticate": "Bearer"})

        return {"email": email, "userId": user_id}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Token has expired", headers={"WWW-Authenticate": "Bearer"})
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail=f"Could not validate credentials.")

async def get_current_user_from_cookie(refresh_token: str = Cookie(None), db: AsyncIOMotorDatabase = Depends(get_db)) -> dict:
    if not refresh_token:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = jwt.decode(refresh_token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        user_id = payload.get("userId")

        if not user_id:
            raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid session")

        user = await get_user_by_rt_and_user_id(user_id, refresh_token, db)
        if not user:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="User does not exist")

        return {"userId": user_id}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Session expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid session")