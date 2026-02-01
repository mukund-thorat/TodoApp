from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class TodoSchema(BaseModel):
    userId: str
    id: str
    title: str
    priority: int
    isActive: bool
    dueDate: datetime
    createdAt: datetime

class UserSchema(BaseModel):
    userId: str
    firstName: str
    lastName: str
    email: EmailStr
    passwordHash: str
    avatar: str
    refreshToken: Optional[str]
    createdAt: datetime
    deletedAt: Optional[datetime]
    lastLogIn: Optional[datetime]

class PendingUserSchema(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    passwordHash: str
