from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError

from src.auth.router import router as auth_router
from src.bookings.router import router as bookings_router
from src.routes.router import public_router, router as routes_router
from src.operator_profile.router import router as operator_profile_router
from src.core.handlers import http_exception_handler, unhandled_exception_handler, validation_exception_handler

app = FastAPI(title='Sugamuxi Ecoturismo API', version='0.1.0')
media_dir = Path(__file__).resolve().parent.parent / 'media'
media_dir.mkdir(parents=True, exist_ok=True)
app.mount('/media', StaticFiles(directory=media_dir), name='media')
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


app.include_router(auth_router)
app.include_router(bookings_router)
app.include_router(routes_router)
app.include_router(public_router)
app.include_router(operator_profile_router)
