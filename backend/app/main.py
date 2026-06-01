import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, IS_SQLITE, SessionLocal
from app.migrate import run_migrations
from app.routers import auth
from app.routers import endpoints

# Import ALL models so Base.metadata knows about every table before create_all
import app.models  # noqa: F401 — registers all ORM models with Base

# Create tables (including payment_history)
Base.metadata.create_all(bind=engine)
if IS_SQLITE:
    run_migrations()

# Seed the demo users automatically on startup
db = SessionLocal()
auth.seed_users(db)
db.close()

app = FastAPI(title="EggManager API", description="Layer Egg Farm Management System Backend")


def get_cors_origins() -> list[str]:
    origins = os.getenv("BACKEND_CORS_ORIGINS", "*")
    if origins.strip() == "*":
        return ["*"]
    return [origin.strip().rstrip("/") for origin in origins.split(",") if origin.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication router
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

# Core modules router
app.include_router(endpoints.router, prefix="/api", tags=["Core Modules"])

@router.get("/")
def read_root():
    return {"status": "Backend is running actively", "docs": "Visit /docs for OpenAPI specifications"}

@app.get("/debug/tables")
def debug_tables():
    """Debug endpoint to check if payment_history table exists"""
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    return {"tables": tables, "has_payment_history": "payment_history" in tables}
