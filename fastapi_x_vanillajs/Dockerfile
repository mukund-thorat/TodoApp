FROM python:3.13
LABEL author="Mukund Thorat"

WORKDIR "/app"

COPY --from=ghcr.io/astral-sh/uv:0.9.10 /uv /uvx /bin/

COPY /pyproject.toml .
COPY /uv.lock .
COPY /backend ./backend
COPY /frontend ./frontend
COPY .env .

RUN uv sync --locked

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "backend.main:app", "--host", "localhost", "--port", "8000"]