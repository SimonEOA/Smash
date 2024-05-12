from .database import Base
from sqlalchemy import Column, Integer, String, TIMESTAMP, Boolean, text

class SongMetadata(Base):
    __tablename__ = "song_metadata"

    id = Column(Integer,primary_key=True,nullable=False)
    name = Column(String,nullable=False)
    artist = Column(String,nullable=False)
    album = Column(String)

class SongCategory(Base):
    __tablename__ = "song_category"

    id = Column(Integer,primary_key=True,nullable=False)
    song_id = Column(Integer)
    category = Column(String,nullable=False)
    text = Column(String,nullable=False)
    line = Column(Integer)
    start = Column(Integer)
    end = Column(Integer)
