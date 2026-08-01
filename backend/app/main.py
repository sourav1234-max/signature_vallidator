import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.db.database import init_db, AsyncSessionLocal
from app.db.models import User
from app.core.security import get_password_hash
from app.routers import auth, documents, admin
from sqlalchemy.future import select

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    await init_db()
    
    # Seed default Admin and User if missing
    async with AsyncSessionLocal() as db:
        admin_res = await db.execute(select(User).where(User.email == "admin@validator.com"))
        if not admin_res.scalars().first():
            admin_user = User(
                email="admin@validator.com",
                hashed_password=get_password_hash("Admin123!"),
                full_name="System Admin",
                role="admin"
            )
            db.add(admin_user)
            
        demo_user_res = await db.execute(select(User).where(User.email == "user@validator.com"))
        if not demo_user_res.scalars().first():
            demo_user = User(
                email="user@validator.com",
                hashed_password=get_password_hash("User123!"),
                full_name="Demo User",
                role="user"
            )
            db.add(demo_user)
            
        await db.commit()
        
    yield
    # Shutdown actions

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade API for Digital Signature Validation in PDF Documents",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs"
    }
