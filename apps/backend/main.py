
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
    allow_methods=["*"], 
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

app.include_router(songs.router)
app.include_router(users.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}