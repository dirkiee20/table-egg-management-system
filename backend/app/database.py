import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_FILE = Path(__file__).resolve().parent.parent / "farm.db"
DEFAULT_SQLITE_URL = f"sqlite:///{DATABASE_FILE.as_posix()}"


def get_database_url() -> str:
    database_url = (
        os.getenv("DATABASE_URL")
        or os.getenv("SUPABASE_DATABASE_URL")
        or DEFAULT_SQLITE_URL
    )

    # Some hosts still expose old-style postgres:// URLs. SQLAlchemy expects
    # postgresql:// for the PostgreSQL dialect.
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    return database_url


SQLALCHEMY_DATABASE_URL = get_database_url()
IS_SQLITE = SQLALCHEMY_DATABASE_URL.startswith("sqlite")

connect_args = {"check_same_thread": False} if IS_SQLITE else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=not IS_SQLITE,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
