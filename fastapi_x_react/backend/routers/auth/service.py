import uuid
from datetime import timedelta
from fastapi import Response
from sqlalchemy.ext.asyncio import AsyncSession

from routers.auth.repo_pend_user import fetch_pend_user, delete_pend_user, insert_pend_user
from data.schemas import User, PendingUser, AuthServiceProvider
from routers.auth.repo_user import insert_user, fetch_user_by_email, set_refresh_token
from routers.auth.models import UserCredentials, SignUpModel, Token
from utils.const import ACCESS_TOKEN_EXPIRE_MINUTES
from utils.errors import ValidationError, NotFoundError
from utils.security.hashing import get_password_hash, verify_password
from utils.security.tokens import create_access_token, create_refresh_token


async def login_verification(email, avatar: str, db: AsyncSession):
    pend_user = await fetch_pend_user(email, db)
    if pend_user is None:
        raise NotFoundError("User is not in registered (Not in Pending list)", details={"email": email})

    await insert_user(pend_user, avatar, db)
    await delete_pend_user(email, db)
    return create_access_token(email, "temp_id", timedelta(minutes=5))

async def store_pend_user(signup_data: SignUpModel, auth_s_p: AuthServiceProvider, db: AsyncSession):
    pend_schema = PendingUser(
        id=uuid.uuid4(),
        firstName=signup_data.firstName,
        lastName=signup_data.lastName,
        email=signup_data.email,
        passwordHash=get_password_hash(signup_data.password) if signup_data.password else None,
        authServiceProvider=auth_s_p
    )

    await insert_pend_user(pend_schema, db=db)


async def authenticate_user(credentials: UserCredentials, db: AsyncSession) -> User:
    user = await fetch_user_by_email(email=credentials.email, db=db)

    if user is None or not verify_password(credentials.password, user.passwordHash):
        raise ValidationError("Invalid email or password")
    return user


async def tokens_generator(response: Response, user: User, db: AsyncSession) -> Token:
    user_id = str(user.id)
    refresh_token = create_refresh_token(user_id=user_id)
    access_token = create_access_token(email=user.email, user_id=user_id, delta_expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

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
        access_token= access_token,
        token_type= "bearer"
    )
