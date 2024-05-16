import json
from typing import List
from fastapi import Depends, HTTPException, requests
from requests import get
from sqlalchemy.orm import Session
from starlette import status
from app.db.database import get_db
from fastapi import APIRouter
from app.api.schema import CreateSong, SongBase, SongCreateManually, SongPlayable, SongProcessNer, entity
from app.db.models import SongMetadata, SongCategory, User
from app.utils import get_current_user
from flair.data import Sentence
from flair.models import SequenceTagger
from flair.nn import Classifier
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv('.env.local')  # Load the environment variables from .env.local
API_KEY = os.getenv('OPENAI_API_KEY')

router = APIRouter(
    prefix='/song',
    tags=['Song']
)

tagger = Classifier.load('ner')

client = OpenAI(
    api_key=API_KEY
)

@router.post('/upload', status_code=status.HTTP_200_OK)
def add_manually(request:SongCreateManually, user: User = Depends(get_current_user), db:Session = Depends(get_db)):
    """
    Manually add a song with detailed metadata.

    Args:
        request (SongCreateManually): Pydantic model containing song details and entities.
        user (User): Currently authenticated user (injected by FastAPI's dependency system).
        db (Session): SQLAlchemy session object (injected by FastAPI's dependency system).

    Returns:
        dict: A message indicating that the song was added successfully.
    """
    # check if song already exists (naive check based on user given name, artist, album - should be improved in the future)
    existing_song = db.query(SongMetadata).filter(SongMetadata.name == request.name, SongMetadata.artist == request.artist, SongMetadata.album == request.album).first()
    if not existing_song:
        new_song = SongMetadata(name=request.name, artist=request.artist, album=request.album, lyrics=request.lyrics, created_by=user.id)
        db.add(new_song)
        db.commit()
        db.refresh(new_song)
    else:
        new_song = existing_song
    
    new_category = SongCategory(song_id=new_song.id, category=request.entity_value, text=request.entity_text, line_text=request.entity_line_text, line_index=request.entity_line_index, start=request.entity_start, end=request.entity_end, created_by=user.id, gpt_verified=request.gpt_verified)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return {"message": f"Song {new_song.name} added successfully"}

@router.post('/process/ner', response_model=List[entity], status_code=status.HTTP_200_OK)
def process_ner(request: SongProcessNer, user: User = Depends(get_current_user), db:Session = Depends(get_db)):
    """
    Process song lyrics for Named Entity Recognition (NER) using Flair.

    Args:
        request (SongProcessNer): Pydantic model containing song lyrics.
        user (User): Currently authenticated user (injected by FastAPI's dependency system).
        db (Session): SQLAlchemy session object (injected by FastAPI's dependency system).

    Returns:
        List[entity]: A list of recognized entities in the song lyrics.
    """
    lyrics = request.lyrics

    results = []

    # Process each line as a separate sentence
    index = 0
    for line in lyrics.split('\n'):
        sentence = Sentence(line)
        tagger.predict(sentence)

        for en in sentence.get_labels('ner'):
            results.append(entity(
                text=en.data_point.text,
                value=en.value,
                score=en.score,
                line_index=index,
                line_text=line,
                start=en.data_point.start_position,
                end=en.data_point.end_position
            ))
        index += 1

    return results

@router.post('/process/gpt', response_model=List[entity])
def process_gpt(request: List[entity], user: User = Depends(get_current_user), db:Session = Depends(get_db)):
    """
    Process entities using OpenAI's GPT-3.5-turbo model for evaluation.

    Args:
        request (List[entity]): List of entities to be evaluated.
        user (User): Currently authenticated user (injected by FastAPI's dependency system).
        db (Session): SQLAlchemy session object (injected by FastAPI's dependency system).

    Returns:
        List[entity]: A list of valid entities evaluated by the model.
    """
    # Create the user message
    user_message = "Evaluate the following entities: " + " | ".join(
        f"Entity: '{entry.text}', Type: '{entry.value}', Context: '{entry.line_text}'"
        for entry in request
    )

    # Truncate the last two characters to remove the last unnecessary " | "
    user_message = user_message[:-3]

    system_message = "Return a JSON formatted string for each entity evaluation. Always use the key 'entities_evaluated' for the list of results. Format each entry as a JSON object: {'entity': 'name', 'result': true/false}."

    # Send the query to the OpenAI API
    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ]
        )
        response_content = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Parse the JSON string into a Python dictionary and filter entities with result true
    try:
        parsed_response = json.loads(response_content)
        results_key = 'entities_evaluated' if 'entities_evaluated' in parsed_response else 'result' if 'result' in parsed_response else 'entities'
        if results_key not in parsed_response:
            raise KeyError("Expected key not found in the response")
        
        evaluation_results = parsed_response[results_key]
        # Return only the entities from the request that were evaluated as true
        valid_entities = [request[i] for i, result in enumerate(evaluation_results) if result['result']]
        return valid_entities  # Return only entities evaluated as true
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding the JSON response")


DEEZER_API_URL = "https://api.deezer.com/"


@router.get("/deezer", response_model=List[SongPlayable])
def get_deezer_songs(db: Session = Depends(get_db)):
    """
    Retrieve songs from Deezer API based on existing song metadata with category 'PER'.

    Args:
        db (Session): SQLAlchemy session object (injected by FastAPI's dependency system).

    Returns:
        List[SongPlayable]: A list of playable songs retrieved from Deezer API.
    """

    # get all songs with category PER
    songs = db.query(SongMetadata) \
        .join(SongCategory, SongMetadata.id == SongCategory.song_id) \
        .filter(SongCategory.category == "PER") \
        .all()    
    result: List[SongPlayable] = []

    index = 0

    print(len(songs))

    if len(songs) == 0:
        print("No songs found")
        return result

    while len(result) < 5 and index < len(songs):
        print(songs[index].name)
        artist = songs[index].artist
        album = songs[index].album
        track = songs[index].name
        Song_category = db.query(SongCategory).filter(SongCategory.song_id == songs[index].id and SongCategory.category == "PER").first()
        entity_text = Song_category.text
        entity_value = Song_category.category
        entity_line_text = Song_category.line_text

        params = {"q": f"{artist}"}

        if album:
            params["artist"] = artist
            params["album"] = album

        if track:
            params["q"] += f" track:{track}"

        url = DEEZER_API_URL + "search"
        response = get(url, params=params)

        response.raise_for_status()

        data = response.json()
        response_songs = data.get("data", [])  # Handle potential absence of "data" key

        print(url)

        if len(response_songs) > 0:
            print(response_songs[0]["title"])
            result.append(SongPlayable(
                artist=artist,
                album=album,
                name=track,
                deezer_artist=response_songs[0]["artist"]["name"],
                deezer_album=response_songs[0]["album"]["title"],
                deezer_name=response_songs[0]["title"],
                preview_url=response_songs[0]["preview"],
                entity_text=entity_text,
                entity_value=entity_value,
                entity_line_text=entity_line_text
            ))
        index += 1

    return result
