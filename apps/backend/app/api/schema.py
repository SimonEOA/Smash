from typing import List
from pydantic import BaseModel


class SongBase(BaseModel):
    name: str
    artist: str
    album: str

    class Config:
        from_attributes = True

class entity(BaseModel):
    text: str
    value: str
    score: float
    line_index: int
    line_text: str
    start: int
    end: int

    class Config:
        from_attributes = True

class CreateSong(SongBase):
    entities: list[entity]
    class Config:
        from_attributes = True

class SongProcessNer(SongBase):
    lyrics: str
    class Config:
        from_attributes = True


class SongCreateManually(SongBase):
    lyrics: str
    entity_text: str
    entity_value: str
    entity_score: float
    entity_line_text: str
    entity_line_index: int
    entity_start: int
    entity_end: int
    gpt_verified: bool

    class Config:
        from_attributes = True

    
class UserCreate(BaseModel):
    username: str
    password: str
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class UserLogin(BaseModel):
    email:str
    password:str