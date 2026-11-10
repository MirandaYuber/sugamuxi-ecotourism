from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError

from src.auth.router import router as auth_router
from src.bookings.router import router as bookings_router
from src.routes.router import public_router, router as routes_router
from src.operator_profile.router import router as operator_profile_router
from src.core.handlers import http_exception_handler, unhandled_exception_handler, validation_exception_handler

app = FastAPI(title='Sugamuxi Ecoturismo API', version='0.1.0')
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)
app.include_router(auth_router)
app.include_router(bookings_router)
app.include_router(routes_router)
app.include_router(public_router)
app.include_router(operator_profile_router)
