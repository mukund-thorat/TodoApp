import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorClient

from backend.utils.errors import DatabaseError
from backend.utils.sv_logger import sv_logger

load_dotenv()

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def _get_mongo_uri() -> str:
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise DatabaseError("MONGO_URI is not configured")
    return mongo_uri


def _get_db_name() -> str:
    return os.getenv("MONGO_DB_NAME", "todoapp")


async def connect_to_db() -> None:
    global _client, _db
    if _client is not None and _db is not None:
        return

    try:
        _client = AsyncIOMotorClient(_get_mongo_uri())
        _db = _client.get_database(_get_db_name())
    except Exception as exc:
        sv_logger.error("Failed to connect to MongoDB")
        raise DatabaseError("Failed to connect to data") from exc


async def close_db() -> None:
    global _client, _db
    if _client is None:
        return
    _client.close()
    _client = None
    _db = None


async def get_db() -> AsyncIOMotorDatabase:
    if _db is None:
        raise DatabaseError("Database not initialized")
    return _db
