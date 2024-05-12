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

