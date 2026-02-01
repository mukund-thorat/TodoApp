from datetime import datetime

from pydantic import BaseModel


class TodoModel(BaseModel):
    title: str
    priority: int = 3
    isActive: bool = False
    dueDate: datetime | None = None
