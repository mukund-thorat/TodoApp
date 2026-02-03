import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from starlette.staticfiles import StaticFiles

from .data.core import connect_to_db, close_db
from .routers.todos.controller import router as todo_router
from .routers.auth.controller import router as auth_router
from .routers.web.controller import router as web_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await connect_to_db()
    yield
    await close_db()

app = FastAPI(lifespan=lifespan)


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
app.include_router(router=web_router)
