from fastapi import FastAPI
from db import models
from db.database import engine
from api.routes import songs

app = FastAPI(title="SMASH api", version="1.0")

models.Base.metadata.create_all(bind=engine)

app.include_router(songs.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}