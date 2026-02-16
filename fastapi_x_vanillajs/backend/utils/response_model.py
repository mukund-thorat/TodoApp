from enum import Enum
from typing import Optional
from pydantic import BaseModel


class ResponseCode(str, Enum):
    CREATED = "Created",
    DELETED = "Deleted",
    UPDATED = "Updated",
    FETCHED = "Fetched",
    ACK = "Acknowledged"


class ResponseModel(BaseModel):
    code: ResponseCode
    message: str
    details: Optional[dict] = None
