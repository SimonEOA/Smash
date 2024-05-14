import json
from typing import List
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from starlette import status
from app.db.database import get_db
from fastapi import APIRouter
from app.api.schema import CreateSong, SongCreateManually, SongProcessNer, entity
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

@router.post('/upload', status_code=status.HTTP_200_OK)
def add_manually(request:SongCreateManually, user: User = Depends(get_current_user), db:Session = Depends(get_db)):
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

@router.post('/process/ner', response_model=List[entity])
def process_ner(request: SongProcessNer, user: User = Depends(get_current_user), db:Session = Depends(get_db)):
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

