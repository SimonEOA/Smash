from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from starlette import status
from app.db.database import get_db
from typing import Union, Any
from app.api.schema import TokenData
from app.db.models import User

from dotenv import load_dotenv
import os

load_dotenv('.env.local')  # Load the environment variables from .env.local
SECRET_KEY = os.getenv('JWT_SECRET_KEY')


# openssl rand -hex 32 for JWT string creation
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# not used but to be implemented in the future
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_user(username: str, session: Session = Depends(get_db)):
    """
    Retrieve a user by username.

    Args:
        username (str): The username of the user.
        session (Session): The SQLAlchemy session object (injected by FastAPI's dependency system).

    Returns:
        User: The user object if found, otherwise None.
    """
    return session.query(User).filter_by(username=username).first()

def get_current_token(token: str = Depends(oauth2_scheme)):
    """
    Retrieve the current token from the request.

    Args:
        token (str): The OAuth2 token (injected by FastAPI's dependency system).

    Returns:
        str: The token string.
    """
    return token

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], session: Session = Depends(get_db)):
    """
    Retrieve the current user based on the JWT token.

    Args:
        token (str): The JWT token (injected by FastAPI's dependency system).
        session (Session): The SQLAlchemy session object (injected by FastAPI's dependency system).

    Raises:
        HTTPException: If the token is invalid or the user does not exist.

    Returns:
        User: The current user object.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        userId: str = payload.get("sub")
        if userId is None:
            print("username is None")
            raise credentials_exception
    except JWTError:
        print("JWTError")
        raise credentials_exception
    

    user = session.query(User).filter_by(id=userId).first()
    if user is None:
        print("user is None")
        raise credentials_exception
    return user

# currently not used
async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Ensure the current user is active.

    Args:
        current_user (User): The current authenticated user (injected by FastAPI's dependency system).

    Raises:
        HTTPException: If the user is inactive.

    Returns:
        User: The current active user object.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# currently not used
def authenticate_user(username: str, password: str):
    """
    Authenticate the user by verifying the username and password.

    Args:
        username (str): The username of the user.
        password (str): The password of the user.

    Returns:
        Union[User, bool]: The authenticated user object if successful, otherwise False.
    """
    user = get_user(username, session=Depends(get_db))
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def verify_password(plain_password, hashed_password):
    """
    Verify the provided password against the stored hashed password.

    Args:
        plain_password (str): The plain text password.
        hashed_password (str): The hashed password.

    Returns:
        bool: True if the password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    """
    Hash the provided password.

    Args:
        password (str): The plain text password.

    Returns:
        str: The hashed password.
    """
    return pwd_context.hash(password)


def create_access_token(subject: Union[str, Any], expires_delta: timedelta | None = None):
    """
    Create a JWT access token.

    Args:
        subject (Union[str, Any]): The subject of the token (user ID).
        expires_delta (timedelta | None): The token expiration time delta.

    Returns:
        str: The encoded JWT token.
    """
    if expires_delta:
        expires_delta = datetime.now(timezone.utc) + expires_delta
    else:
        expires_delta = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expires_delta, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt