import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, IS_SQLITE, SessionLocal
from app.migrate import run_migrations
from app.routers import auth
from app.routers import endpoints

# Create tables
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

@app.get("/")
def read_root():
    return {"status": "Backend is running actively", "docs": "Visit /docs for OpenAPI specifications"}
