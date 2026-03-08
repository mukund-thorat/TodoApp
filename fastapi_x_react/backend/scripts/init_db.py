import asyncio

from data.core import Base, engine
from data.schemas import User, Todo, PendingUser


async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()
    print("Database tables created successfully.")


if __name__ == "__main__":
    asyncio.run(init())
