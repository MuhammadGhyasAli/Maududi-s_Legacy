import os
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo.database import Database
from pydantic import BaseModel, field_validator
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from typing import Optional

from database import get_db
from config import settings
from repositories.user_repository import UserRepository
from models.db_models import UserModel
from structlog import get_logger

logger = get_logger(__name__)
router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


COOKIE_NAME = "auth_token"


def set_auth_cookie(response: Response, token: str) -> None:
    max_age = settings.jwt_expiration_minutes * 60
    secure = os.environ.get("VERCEL") == "1"
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=max_age,
        expires=max_age,
        httponly=True,
        secure=secure,
        samesite="lax",
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    secure = os.environ.get("VERCEL") == "1"
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        secure=secure,
        samesite="lax",
    )


# ── Schemas ──

class LoginRequest(BaseModel):
    username: str
    password: str

    @field_validator('username')
    @classmethod
    def username_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Username cannot be empty')
        return v.strip()

    @field_validator('password')
    @classmethod
    def password_not_empty(cls, v: str) -> str:
        if not v:
            raise ValueError('Password cannot be empty')
        return v


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    display_name: str = ""

    @field_validator('username')
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        if len(v) > 50:
            raise ValueError('Username must be at most 50 characters')
        return v

    @field_validator('email')
    @classmethod
    def email_valid(cls, v: str) -> str:
        v = v.strip()
        if '@' not in v:
            raise ValueError('Invalid email address')
        return v

    @field_validator('password')
    @classmethod
    def password_strong(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


class GoogleAuthRequest(BaseModel):
    id_token: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def password_strong(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


class MessageResponse(BaseModel):
    message: str
    reset_token: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    display_name: str
    is_active: bool


# ── JWT Helpers ──

def create_access_token(user_id: int, username: str) -> str:
    expiry = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expiration_minutes)
    payload = {
        "sub": str(user_id),
        "username": username,
        "exp": expiry,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {str(e)}")


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    cookie_token: Optional[str] = Cookie(None, alias=COOKIE_NAME),
    db: Database = Depends(get_db),
) -> UserModel:
    token = None
    if credentials:
        token = credentials.credentials
    if not token:
        token = cookie_token
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_access_token(token)
    user_id = int(payload.get("sub", 0))
    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


# ── Endpoints ──

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, response: Response, db: Database = Depends(get_db)):
    repo = UserRepository(db)
    user = repo.get_by_username(request.username)
    if not user or not pwd_context.verify(request.password, user.password_hash):
        logger.warning("Login failed", username=request.username)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token = create_access_token(user.id, user.username)
    set_auth_cookie(response, token)
    logger.info("Login successful", username=request.username)
    return TokenResponse(
        access_token=token,
        expires_in=settings.jwt_expiration_minutes * 60,
    )


@router.post("/register", response_model=UserResponse)
async def register(request: RegisterRequest, db: Database = Depends(get_db)):
    repo = UserRepository(db)

    if repo.get_by_username(request.username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
    if repo.get_by_email(request.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    password_hash = pwd_context.hash(request.password)
    user = repo.create(request.username, request.email, password_hash, display_name=request.display_name)
    logger.info("User registered", username=request.username)
    return UserResponse(
        id=user.id, username=user.username, email=user.email,
        display_name=user.display_name, is_active=user.is_active,
    )


@router.post("/google", response_model=TokenResponse)
async def google_auth(request: GoogleAuthRequest, response: Response, db: Database = Depends(get_db)):
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    import traceback

    client_id = settings.google_oauth_client_id
    if not client_id:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Google OAuth is not configured")
    try:
        info = id_token.verify_oauth2_token(
            request.id_token,
            google_requests.Request(),
            client_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid Google token: {str(e)}")
    except Exception as e:
        logger.error("Google token verification failed", error=str(e), traceback=traceback.format_exc())
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Google token verification error: {str(e)}")

    try:
        google_id = info.get("sub")
        email = info.get("email", "")
        name = info.get("name", email.split("@")[0] if email else "User")

        repo = UserRepository(db)
        user = repo.get_by_google_id(google_id)

        if not user:
            if email:
                user = repo.get_by_email(email)
                if user:
                    db.users.update_one(
                        {"id": user.id},
                        {"$set": {"google_id": google_id, "display_name": name}},
                    )
                    user.google_id = google_id
                    user.display_name = name
            if not user:
                import secrets
                username = email.split("@")[0] if email else f"user_{google_id[:8]}"
                base_username = username
                suffix = 1
                while repo.get_by_username(username):
                    username = f"{base_username}{suffix}"
                    suffix += 1
                password_hash = pwd_context.hash(secrets.token_hex(32))
                user = repo.create(username, email, password_hash, display_name=name)
                db.users.update_one(
                    {"id": user.id},
                    {"$set": {"google_id": google_id}},
                )
                user.google_id = google_id

        token = create_access_token(user.id, user.username)
        set_auth_cookie(response, token)
        return TokenResponse(
            access_token=token,
            expires_in=settings.jwt_expiration_minutes * 60,
        )
    except Exception as e:
        logger.error("Google auth handler failed", error=str(e), traceback=traceback.format_exc())
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Google auth error: {str(e)}")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(request: ForgotPasswordRequest, return_token: bool = False, db: Database = Depends(get_db)):
    import hashlib
    import secrets
    from database import get_next_id

    repo = UserRepository(db)
    user = repo.get_by_email(request.email.strip())

    if not user:
        return MessageResponse(message="If that email is registered, a reset link has been sent.")

    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.password_reset_ttl_minutes)

    db.password_reset_tokens.insert_one({
        "id": get_next_id("password_reset_tokens"),
        "user_id": user.id,
        "token_hash": token_hash,
        "expires_at": expires_at,
    })

    logger.info("Password reset token created", user_id=user.id)

    if settings.dev_return_password_reset_token or return_token:
        return MessageResponse(
            message="Password reset token generated.",
            reset_token=token,
        )

    return MessageResponse(message="If that email is registered, a reset link has been sent.")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(request: ResetPasswordRequest, db: Database = Depends(get_db)):
    import hashlib

    token_hash = hashlib.sha256(request.token.encode()).hexdigest()
    now = datetime.now(timezone.utc)

    reset = db.password_reset_tokens.find_one({
        "token_hash": token_hash,
        "used_at": None,
        "expires_at": {"$gt": now},
    })

    if not reset:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")

    repo = UserRepository(db)
    user = repo.get_by_id(reset["user_id"])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    new_hash = pwd_context.hash(request.new_password)
    db.users.update_one({"id": user.id}, {"$set": {"password_hash": new_hash}})
    db.password_reset_tokens.update_one(
        {"_id": reset["_id"]},
        {"$set": {"used_at": now}},
    )

    logger.info("Password reset successful", user_id=user.id)
    return MessageResponse(message="Password has been reset successfully.")


@router.post("/logout")
async def logout(response: Response):
    clear_auth_cookie(response)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserModel = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        display_name=current_user.display_name or current_user.username,
        is_active=current_user.is_active,
    )
