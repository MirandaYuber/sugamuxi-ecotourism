from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def http_exception_handler(_: Request, exception: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exception.status_code,
        content={
            'code': exception.status_code,
            'message': exception.detail if isinstance(exception.detail, str) else 'La solicitud no es válida.',
            'success': False,
        },
    )


def validation_exception_handler(_: Request, exception: RequestValidationError) -> JSONResponse:
    first_error = exception.errors()[0] if exception.errors() else {}
    location = '.'.join(str(item) for item in first_error.get('loc', []))
    message = first_error.get('msg', 'Los datos enviados no son válidos.')
    if location:
        message = f'{location}: {message}'
    return JSONResponse(
        status_code=422,
        content={'code': 422, 'message': message, 'success': False},
    )


def unhandled_exception_handler(_: Request, __: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={'code': 500, 'message': 'Ocurrió un error interno.', 'success': False},
    )
