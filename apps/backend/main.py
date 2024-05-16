"""
SMASH API Application Setup

This module sets up the FastAPI application, including CORS middleware, 
database initialization, and inclusion of route modules for songs and users.

Imports:
    FastAPI: FastAPI application class.
    models: SQLAlchemy ORM models.
    engine: SQLAlchemy database engine.
    songs: Song-related API routes.
    users: User-related API routes.
    CORSMiddleware: Middleware for handling Cross-Origin Resource Sharing (CORS) allowing everything.

Attributes:
    app (FastAPI): The main FastAPI application instance.

Setup Steps:
    1. Create a FastAPI instance.
    2. Add CORS middleware.
    3. Create all database tables.
    4. Include API routers for songs and users.

"""
from fastapi import FastAPI
from app.db import models
from app.db.database import engine
from app.api.routes import songs
from app.api.routes import users
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="SMASH api", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # restrict allowed methods
    allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin"],  # restrict allowed headers
)

models.Base.metadata.create_all(bind=engine)

app.include_router(songs.router)
app.include_router(users.router)
