import uuid
from contextlib import asynccontextmanager

import os

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from starlette.staticfiles import StaticFiles

from .data.core import connect_to_db, close_db
from .routers.todos.controller import router as todo_router
from .routers.auth.controller import router as auth_router
from .routers.user.controller import router as user_router
from .routers.web.controller import router as web_router
from .utils.errors import AppError


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await connect_to_db()
    yield
    await close_db()

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "change-me"),
    same_site="lax",
)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    request_id = getattr(request.state, "request_id", None)
    content = {
        "code": exc.code,
        "message": exc.message,
        "details": exc.details,
    }
    if request_id:
        content["request_id"] = request_id

    return JSONResponse(status_code=exc.status_code, content=content)


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-Id") or str(uuid.uuid4())
    request.state.request_id = request_id

    response = await call_next(request)
    response.headers["X-Request-Id"] = request_id
    return response


app.mount("/static", StaticFiles(directory="frontend"), name="static")
app.include_router(router=todo_router)
app.include_router(router=auth_router)
app.include_router(router=user_router)
app.include_router(router=web_router)
