from typing import List
from fastapi import Depends
from sqlalchemy.orm import Session
from starlette import status
from app.db.database import get_db
from fastapi import APIRouter
from app.api.schema import CreateSong, InputSong
from app.db.models import SongMetadata, SongCategory


router = APIRouter(
    prefix='/song',
    tags=['Song']
)


@router.get('/get_all_test', response_model=List[CreateSong])
def test_songs(db: Session = Depends(get_db)):

    song = db.query(SongMetadata).all()

    return  song

@router.post('/create', status_code=status.HTTP_201_CREATED)
def add_new_song(request:CreateSong, db:Session = Depends(get_db)):

    new_song = SongMetadata(name=request.name, artist=request.artist, album=request.album)
    db.add(new_song)
    db.commit()
    db.refresh(new_song)

    for entity in request.entities:
        new_category = SongCategory(song_id=new_song.id, category=entity.value, text=entity.text, line=entity.line, start=entity.start, end=entity.end)
        db.add(new_category)
        db.commit()
        db.refresh(new_category)

    return {"message": "Song added successfully"}

@router.post('/test_add', status_code=status.HTTP_200_OK)
def test_connection(request:InputSong, db:Session = Depends(get_db)):

    print(request.lyrics)

    return {"message": f"Connection successful request: {request.lyrics}"}





