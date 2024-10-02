from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=False)

    DISCORD_TOKEN: str
    PREFIX: list[str] = ["ac!"]

settings = Settings()