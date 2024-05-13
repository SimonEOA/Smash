from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from starlette import status
from app.db.database import get_db
from fastapi import APIRouter
from app.api.schema import UserCreate, Token, UserLogin
from app.db.models import User, TokenTable
from utils import create_access_token, get_password_hash, verify_password



router = APIRouter(
    prefix='/user',
    tags=['User']
)


@router.post("/register")
def register_user(user: UserCreate, session: Session = Depends(get_db)):
    existing_user = session.query(User).filter_by(email=user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    encrypted_password = get_password_hash(user.password)

    new_user = User(username=user.username, email=user.email, password=encrypted_password, is_active=True, is_superuser=False)

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {"message":"user created successfully"}


@router.post('/login' ,response_model=Token)
def login(request: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email")
    hashed_pass = user.password
    if not verify_password(request.password, hashed_pass):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    access=create_access_token(user.id)

    token_db = TokenTable(user_id=user.id,  access_token=access, status=True)
    db.add(token_db)
    db.commit()
    db.refresh(token_db)
    return Token(access_token=access, token_type="bearer")
