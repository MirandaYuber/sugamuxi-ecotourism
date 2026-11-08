from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = 'postgresql+psycopg2://sugamuxi:sugamuxi@db:5432/sugamuxi'
    secret_key: str = 'change-this-in-production'
    access_token_expire_minutes: int = 30
    frontend_url: str = 'http://localhost:5173'
    algorithm: str = 'HS256'
    model_config = SettingsConfigDict(env_file='.env', case_sensitive=False)

settings = Settings()
