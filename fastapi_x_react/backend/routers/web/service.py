from fastapi import Depends, Request, Response
from jwt import ExpiredSignatureError, InvalidTokenError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import RedirectResponse

from data.core import get_db
from routers.auth.repo_user import fetch_user_by_refresh_token_and_user_id
from utils.security.tokens import decode_token
from utils.template import templates


async def render_or_redirect(request: Request, template_name: str, db: AsyncSession) -> Response:
    redirect = await _is_user_already_logged_in(request.cookies.get("refresh_token"), db)
    if redirect:
        return redirect
    return templates.TemplateResponse(template_name, {"request": request})


async def _is_user_already_logged_in(refresh_token: str, db: AsyncSession = Depends(get_db)):
    if not refresh_token:
        return None
    try:
        payload = decode_token(refresh_token)
        user_id = payload.get("userId")

        if not user_id:
            return None
        user = await fetch_user_by_refresh_token_and_user_id(user_id, refresh_token, db)
        if not user:
            return None
        return RedirectResponse(url="/app")
    except ExpiredSignatureError:
        return None
    except InvalidTokenError:
        return None
