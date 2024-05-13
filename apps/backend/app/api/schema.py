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
    line: int
    start: int
    end: int

    class Config:
        from_attributes = True

class CreateSong(SongBase):
    entities: list[entity]
    class Config:
        from_attributes = True

class InputSong(BaseModel):
    lyrics: str

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