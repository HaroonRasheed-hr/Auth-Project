from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from models import User
from auth import get_password_hash, verify_password, create_access_token, verify_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import secrets
import os
import smtplib
import logging
from email.message import EmailMessage
from fastapi import UploadFile, File, Form
from typing import Optional
from uuid import uuid4
from pathlib import Path

router = APIRouter()
security = HTTPBearer()

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    profile_pic: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    password: str
    confirm_password: str

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    username = verify_token(credentials.credentials, credentials_exception)
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup", response_model=dict)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": new_user.id, "username": new_user.username, "email": new_user.email}}

@router.post("/login", response_model=dict)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": db_user.id, "username": db_user.username, "email": db_user.email}}

@router.get("/user/{user_id}", response_model=UserResponse)
def get_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/user/me")
def update_profile(
    username: Optional[str] = Form(None),
    current_password: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    delete_pic: Optional[bool] = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # update username
    if username:
        # check username uniqueness
        existing = db.query(User).filter(User.username == username, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = username

    # update password
    if password:
        if not current_password:
            raise HTTPException(status_code=400, detail="Current password required to change password")
        if not verify_password(current_password, current_user.password_hash):
            raise HTTPException(status_code=401, detail="Current password is incorrect")
        current_user.password_hash = get_password_hash(password)

    # handle file upload
    static_root = Path(__file__).resolve().parent.parent / "static" / "profile_pics"
    static_root.mkdir(parents=True, exist_ok=True)

    if delete_pic:
        if current_user.profile_pic:
            try:
                pic_path = static_root / current_user.profile_pic
                if pic_path.exists():
                    pic_path.unlink()
            except Exception:
                logging.exception("Failed to delete existing profile pic")
            current_user.profile_pic = None

    if file:
        # save new file
        ext = Path(file.filename).suffix
        filename = f"{uuid4().hex}{ext}"
        dest = static_root / filename
        with dest.open("wb") as f:
            f.write(file.file.read())
        # remove previous pic
        if current_user.profile_pic:
            try:
                old = static_root / current_user.profile_pic
                if old.exists():
                    old.unlink()
            except Exception:
                logging.exception("Failed to remove old profile pic")
        current_user.profile_pic = filename

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {"message": "Profile updated", "user": {"id": current_user.id, "username": current_user.username, "email": current_user.email, "profile_pic": current_user.profile_pic}}


@router.delete("/user/me/photo")
def delete_profile_photo(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.profile_pic:
        raise HTTPException(status_code=404, detail="No profile photo to delete")
    static_root = Path(__file__).resolve().parent.parent / "static" / "profile_pics"
    try:
        pic_path = static_root / current_user.profile_pic
        if pic_path.exists():
            pic_path.unlink()
    except Exception:
        logging.exception("Failed to delete profile pic")
    current_user.profile_pic = None
    db.add(current_user)
    db.commit()
    return {"message": "Profile photo deleted"}

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    db.commit()
    # Try to send email with reset link if SMTP is configured
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    reset_base = os.getenv("RESET_URL_BASE", "http://localhost:5173")

    reset_link = f"{reset_base}/reset-password/{reset_token}"

    sent = False
    if smtp_host and smtp_user and smtp_pass:
        try:
            msg = EmailMessage()
            msg["Subject"] = "Password reset request"
            msg["From"] = smtp_user
            msg["To"] = user.email
            msg.set_content(f"You requested a password reset. Click the link to reset your password:\n\n{reset_link}\n\nIf you didn't request this, ignore this message.")
            # Try STARTTLS (common for port 587)
            try:
                with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(smtp_user, smtp_pass)
                    server.send_message(msg)
                sent = True
            except Exception:
                # fallback to SSL (port 465)
                try:
                    with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10) as server:
                        server.login(smtp_user, smtp_pass)
                        server.send_message(msg)
                    sent = True
                except Exception:
                    raise
        except Exception as e:
            logging.exception("Failed to send reset email")
            # ensure reset link is available in logs for dev troubleshooting
            logging.info(f"Password reset link for {user.email}: {reset_link}")
    else:
        # No SMTP configured — log the reset link for development
        logging.info(f"No SMTP configured. Password reset link for {user.email}: {reset_link}")

    # Return a message; include token for development/testing convenience
    response = {"message": "Reset token generated and email sent" if sent else "Reset token generated (email not sent)"}
    # include token for frontend flows (remove in production for security)
    response["token"] = reset_token
    # include reset link for development/testing
    response["reset_link"] = reset_link
    return response

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    if request.password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    user = db.query(User).filter(User.reset_token == request.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")
    user.password_hash = get_password_hash(request.password)
    user.reset_token = None
    db.commit()
    return {"message": "Password reset successfully"}