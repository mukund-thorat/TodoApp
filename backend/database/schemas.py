from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class TodoSchema(BaseModel):
    id: str
    title: str
    description: str
    priority: int
    isCompleted: bool
    dueDate: datetime
    createdAt: datetime

class UserSchema(BaseModel):
    userId: str
    firstName: str
    lastName: str
    email: EmailStr
    passwordHash: str
    refreshToken: Optional[str]
    createdAt: datetime
    deletedAt: Optional[datetime]
    lastLogIn: Optional[datetime]