from datetime import datetime
from .database import Base
from sqlalchemy import Column, DateTime, Integer, String, TIMESTAMP, Boolean, text

class SongMetadata(Base):
    __tablename__ = "song_metadata"

    id = Column(Integer,primary_key=True,nullable=False)
    name = Column(String,nullable=False)
    artist = Column(String,nullable=False)
    album = Column(String)
    lyrics = Column(String)
    created_by = Column(Integer, nullable=False)

class SongCategory(Base):
    __tablename__ = "song_category"

    id = Column(Integer,primary_key=True,nullable=False)
    song_id = Column(Integer)
    category = Column(String,nullable=False)
    text = Column(String,nullable=False)
    line = Column(Integer)
    start = Column(Integer)
    end = Column(Integer)
    created_by = Column(Integer, nullable=False)
    gpt_verified = Column(Boolean, default=False)

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, nullable=False)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)
    email = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("now()"))
    updated_at = Column(TIMESTAMP, server_default=text("now()"))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)


class TokenTable(Base):
    __tablename__ = "token"

    user_id = Column(Integer)
    access_token = Column(String(450), primary_key=True)
    status = Column(Boolean)
    created_date = Column(DateTime, default=datetime.now)
