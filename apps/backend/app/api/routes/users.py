from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from starlette import status
from app.db.database import get_db
from fastapi import APIRouter
from app.api.schema import UserCreate, Token, UserLogin
from app.db.models import User, TokenTable
from app.utils import create_access_token, get_current_token, get_current_user, get_password_hash, verify_password



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
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # check if token already exists (future improvement: check if token is expired and create new token if expired)
    tokenTable = db.query(TokenTable).filter(TokenTable.user_id == user.id).first()

    # create token if not exists
    token = None
    if not tokenTable:
        token=create_access_token(user.id)
        token_db = TokenTable(user_id=user.id,  access_token=token, status=True)
        db.add(token_db)
        db.commit()
        db.refresh(token_db)
    else:
        # use existing token if exists
        token = tokenTable.access_token
    return Token(access_token=token, token_type="bearer")



@router.delete('/logout')
def logout(token: str = Depends(get_current_token), db: Session = Depends(get_db)):
    tokenTable = db.query(TokenTable).filter(TokenTable.access_token == token).first()
    if tokenTable:
        # remove token from db
        db.delete(tokenTable)
        db.commit()
        return {"message": "Logged out successfully"}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token not found")