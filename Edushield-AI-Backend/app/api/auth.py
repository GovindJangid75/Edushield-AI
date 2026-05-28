# app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional

from app.database import get_db
from app.models.teacher import Teacher
from app.config import get_settings

router = APIRouter()
settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Teacher:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        teacher_id: str = payload.get("sub")
        if teacher_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
    if teacher is None:
        raise credentials_exception
    return teacher

@router.post("/register")
def register_teacher(
    teacher_id: str,
    name: str,
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    """Register a new teacher"""
    existing = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Teacher ID already exists")
    
    teacher = Teacher(
        teacher_id=teacher_id,
        name=name,
        email=email,
        hashed_password=get_password_hash(password)
    )
    
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    
    return {"message": "Teacher registered successfully", "teacher_id": teacher.teacher_id}

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    teacher = db.query(Teacher).filter(Teacher.teacher_id == form_data.username).first()
    
    if not teacher or not verify_password(form_data.password, teacher.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect teacher ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": teacher.teacher_id}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "teacher_id": teacher.teacher_id,
        "name": teacher.name
    }

@router.get("/me")
def get_current_teacher(current_user: Teacher = Depends(get_current_user)):
    """Get current logged-in teacher info"""
    return {
        "teacher_id": current_user.teacher_id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }
