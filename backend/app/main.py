from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, get_db, SessionLocal
from app.routers import auth
from app.routers import endpoints

# Create tables
Base.metadata.create_all(bind=engine)

# Seed the demo users automatically on startup
db = SessionLocal()
auth.seed_users(db)
db.close()

app = FastAPI(title="EggManager API", description="Layer Egg Farm Management System Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
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
