import uuid

from sqlalchemy import delete, select, update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from data.schemas import Todo
from utils.errors import DatabaseError, NotFoundError, ValidationError
from utils.sv_logger import sv_logger

async def insert_todo(todo: Todo, db: AsyncSession) -> Todo:
    try:
        db.add(todo)
        await db.commit()
        await db.refresh(todo)
        return todo
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "Failed to insert todo",
            extra={"table": "todos", "todo_id": todo.id, "user_id": todo.userId},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "todos"}) from se

async def fetch_active_todos(user_id: str, limit: int, skip: int, db: AsyncSession) -> list[Todo]:
    if limit <= 0:
        raise ValidationError("limit must be greater than 0", details={"limit": limit})
    if skip < 0:
        raise ValidationError("skip must be greater than or equal to 0", details={"skip": skip})

    try:
        query = (
            select(Todo)
            .where(Todo.userId == user_id, Todo.isActive.is_(True))
            .offset(skip)
            .limit(limit)
        )
        results = (await db.execute(query)).scalars()
        return list(results)
    except SQLAlchemyError as se:
        sv_logger.error(
            "Failed to fetch active todos",
            extra={"table": "todos", "user_id": user_id},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "todos"}) from se

async def fetch_completed_todos(user_id: str, limit: int, skip: int, db: AsyncSession) -> list[Todo]:
    if limit <= 0:
        raise ValidationError("limit must be greater than 0", details={"limit": limit})
    if skip < 0:
        raise ValidationError("skip must be greater than or equal to 0", details={"skip": skip})

    try:
        query = (
            select(Todo)
            .where(Todo.userId == user_id, Todo.isActive.is_(False))
            .offset(skip)
            .limit(limit)
        )
        results = (await db.execute(query)).scalars()
        return list(results)
    except SQLAlchemyError as se:
        sv_logger.error(
            "Failed to fetch completed todos",
            extra={"table": "todos", "user_id": user_id},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "todos"}) from se

async def fetch_todo_by_id(todo_id: str, db: AsyncSession) -> Todo:
    try:
        result = await db.execute(select(Todo).where(Todo.id == todo_id))
    except SQLAlchemyError as se:
        sv_logger.error(
            "Failed to fetch todo",
            extra={"table": "todos", "todo_id": todo_id},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "todos"}) from se

    todo = result.scalar_one_or_none()
    if todo is None:
        raise NotFoundError("Todo not found", details={"todo_id": todo_id})

    return todo

async def set_todo_title(todo_id: str, updated_title: str, db: AsyncSession):
    try:
        updated_todo_id = (
            await db.execute(
                update(Todo)
                .where(Todo.id == todo_id)
                .values(title=updated_title)
                .returning(Todo.id)
            )
        ).scalar_one_or_none()
        if updated_todo_id is None:
            await db.rollback()
            sv_logger.warning(
                "Todo title update skipped; todo not found",
                extra={"operation": "update_title", "entity": "todos", "identifier": todo_id},
            )
            raise NotFoundError("Todo not found", details={"todo_id": todo_id})

        await db.commit()
        sv_logger.info(
            "Todo title updated successfully",
            extra={"operation": "update_title", "entity": "todos", "identifier": todo_id},
        )
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "Failed to update todo title",
            extra={"operation": "update_title", "entity": "todos", "identifier": todo_id},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "todos", "todo_id": todo_id}) from se


async def set_todo_active_status(todo_id: str, status: bool, db: AsyncSession):
    try:
        updated_todo_id = (
            await db.execute(
                update(Todo)
                .where(Todo.id == todo_id)
                .values(isActive=status)
                .returning(Todo.id)
            )
        ).scalar_one_or_none()
        if updated_todo_id is None:
            await db.rollback()
            sv_logger.warning(
                "Todo status update skipped; todo not found",
                extra={"operation": "update_status", "entity": "todos", "identifier": todo_id},
            )
            raise NotFoundError("Todo not found", details={"todo_id": todo_id})

        await db.commit()
        sv_logger.info(
            "Todo status updated successfully",
            extra={"operation": "update_status", "entity": "todos", "identifier": todo_id},
        )
    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "Failed to update todo status",
            extra={"operation": "update_status", "entity": "todos", "identifier": todo_id},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "todos", "todo_id": todo_id}) from se


async def delete_todo(todo_id: uuid.UUID, db: AsyncSession):
    try:
        result = await db.execute(
            delete(Todo).where(Todo.id == todo_id)
        )

        if result.rowcount == 0:
            await db.rollback()
            sv_logger.warning(
                "Delete skipped; todo not found",
                extra={"operation": "delete", "entity": "todos", "identifier": todo_id},
            )
            raise NotFoundError("Todo not found", details={"todo_id": todo_id})

        await db.commit()
        sv_logger.info(
            "Todo deleted successfully",
            extra={"operation": "delete", "entity": "todos", "identifier": todo_id},
        )

    except SQLAlchemyError as se:
        await db.rollback()
        sv_logger.error(
            "Failed to delete todo",
            extra={"operation": "delete", "entity": "todos", "identifier": todo_id},
            exc_info=True,
        )
        raise DatabaseError(details={"table": "todos", "todo_id": todo_id}) from se
