import uuid

from datetime import datetime, timedelta
from fastapi import Depends, Response
from jwt import ExpiredSignatureError, InvalidTokenError
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.data.core import get_db
from backend.routers.auth.repo_pend_user import fetch_pend_user, delete_pend_user
from backend.data.schemas import UserSchema, PendingUserSchema
from backend.routers.auth.repo_user import insert_user, fetch_user_by_email, fetch_user_by_refresh_token_and_user_id, \
    set_refresh_token
from backend.routers.auth.models import UserCredentials, SignUpModel, Token
from backend.utils.const import ACCESS_TOKEN_EXPIRE_MINUTES
from backend.utils.errors import ValidationError, NotFoundError
from backend.utils.security import get_password_hash, verify_password, decode_token, create_access_token, \
    create_refresh_token


async def login_verification(email, avatar: str, db: AsyncIOMotorDatabase):
    pend_user = await fetch_pend_user(email, db)
    if pend_user is None:
        raise NotFoundError("User is not in registered (Not in Pending list)", details={"email": email})

    await create_user(pend_user, avatar, db)
    await delete_pend_user(email, db)
    return create_access_token(email, "temp_id", timedelta(minutes=5))


async def create_user(pend_user_schema: PendingUserSchema, avatar: str, db: AsyncIOMotorDatabase):
    user_schema = UserSchema(
        userId=str(uuid.uuid4()),
        firstName=pend_user_schema.firstName,
        lastName=pend_user_schema.lastName,
        email=pend_user_schema.email,
        avatar=avatar,
        passwordHash=pend_user_schema.passwordHash,
        refreshToken=None,
        createdAt=datetime.now(),
        deletedAt=None,
        lastLogIn=None,
    )

    await insert_user(user_schema, db)


async def store_pend_user(signup_data: SignUpModel, db: AsyncIOMotorDatabase):
    pend_schema = PendingUserSchema(
        firstName=signup_data.firstName,
        lastName=signup_data.lastName,
        email=signup_data.email,
        passwordHash=get_password_hash(signup_data.password),
    )

    await insert_user(pend_schema, db=db)


async def authenticate_user(credentials: UserCredentials, db: AsyncIOMotorDatabase) -> UserSchema:
    user = await fetch_user_by_email(email=credentials.email, db=db)

    if user is None or not verify_password(credentials.password, user.passwordHash):
        raise ValidationError("Invalid email or password")
    return user


async def tokens_generator(response: Response, user: UserSchema, db: AsyncIOMotorDatabase) -> Token:
    refresh_token = create_refresh_token(user_id=user.userId)
    access_token = create_access_token(email=user.email, user_id=user.userId, delta_expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    await set_refresh_token(email=user.email, new_refresh_token=refresh_token, db=db)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=7 * 24 * 60 * 60
    )

    return Token(
        accessToken= access_token,
        tokenType= "bearer"
    )