from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.auth import router as auth_router
from app.api.routes.operator import router as operator_router
from app.core.config import settings
from app.db.session import Base, engine
from app.models import User  # noqa: F401 - registers model metadata

Base.metadata.create_all(bind=engine)
app = FastAPI(title='Sugamuxi Ecoturismo API', version='0.1.0')
app.add_middleware(CORSMiddleware, allow_origins=[settings.frontend_url], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
app.include_router(auth_router, prefix='/api/v1')
app.include_router(operator_router, prefix='/api/v1')

@app.get('/health', tags=['health'])
def health() -> dict[str, str]:
    return {'status': 'ok'}
