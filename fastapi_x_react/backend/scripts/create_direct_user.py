import asyncio
import uuid
from datetime import datetime

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from data.core import AsyncSessionLocal
from data.schemas import User, AuthServiceProvider
from utils.security.hashing import get_password_hash


async def insert_user(user: User, db: AsyncSession):
    try:
        db.add(user)
        await db.commit()
        await db.refresh(user)
    except SQLAlchemyError as se:
        await db.rollback()
        raise Exception(f"Failed to insert user {se}") from se

async def main():
    async with AsyncSessionLocal() as db:
        user = User(
            id=uuid.uuid4(),
            firstName="John",
            lastName="Doe",
            email="john@example.com",
            passwordHash=get_password_hash("john"),
            authServiceProvider=AuthServiceProvider.ME,
            avatar="",
            createdAt=datetime.now()
        )

        await insert_user(user, db)

if __name__ == "__main__":
    asyncio.run(main())