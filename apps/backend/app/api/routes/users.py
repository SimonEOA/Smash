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


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, session: Session = Depends(get_db)):
    """
    Register a new user.

    This endpoint allows a new user to register by providing a username, email, and password. 
    The password is hashed before being stored in the database.

    Args:
        user (UserCreate): A Pydantic model that contains the user's username, email, and password.
        session (Session): A SQLAlchemy database session (injected by FastAPI's dependency system).

    Raises:
        HTTPException: If the email is already registered, a 400 status code is returned.

    Returns:
        dict: A message indicating that the user was created successfully.
    """
    existing_user = session.query(User).filter_by(email=user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    encrypted_password = get_password_hash(user.password)

    new_user = User(username=user.username, email=user.email, password=encrypted_password, is_active=True, is_superuser=False)

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {"message":"user created successfully"}


@router.post('/login', response_model=Token, status_code=status.HTTP_200_OK)
def login(request: UserLogin, db: Session = Depends(get_db)):
    """
    Login a user and return an access token.

    This endpoint allows a user to login by providing their email and password.
    If the email and password are correct, an JWT access token is returned.

    Args:
        request (UserLogin): A Pydantic model that contains the user's email and password.
        db (Session): A SQLAlchemy database session (injected by FastAPI's dependency system).

    Raises:
        HTTPException: If the email is incorrect, a 400 status code is returned.
        HTTPException: If the password is incorrect, a 401 status code is returned.

    Returns:
        Token: A Pydantic model that contains the access token and its type.
    """    
    user = db.query(User).filter(User.email == request.email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email")
    hashed_pass = user.password
    if not verify_password(request.password, hashed_pass):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
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



@router.delete('/logout', response_model=dict, status_code=status.HTTP_200_OK)
def logout(token: str = Depends(get_current_token), db: Session = Depends(get_db)):
    """
    Logout a user.

    This endpoint allows a user to logout by providing their access token.
    The access token is removed from the database.

    Args:
        token (str): The user's access token.
        db (Session): A SQLAlchemy database session (injected by FastAPI's dependency system).

    Raises:
        HTTPException: If the token is not found, a 400 status code is returned.

    Returns:
        dict: A message indicating that the user was logged out successfully.
    """
    tokenTable = db.query(TokenTable).filter(TokenTable.access_token == token).first()
    if tokenTable:
        # remove token from db
        db.delete(tokenTable)
        db.commit()
        return {"message": "Logged out successfully"}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token not found")