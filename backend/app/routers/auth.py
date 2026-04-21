from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import Token, TokenData, UserResponse, ChangePasswordRequest, MessageResponse
from app.core.security import verify_password, create_access_token, get_password_hash, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from datetime import timedelta

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=60*24)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    if payload.current_password == payload.new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different from the current password")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 6 characters long")

    if not current_user.original_password_hash:
        current_user.original_password_hash = current_user.hashed_password

    current_user.hashed_password = get_password_hash(payload.new_password)
    db.commit()

    return {"message": "Password updated successfully"}

# Utility to seed demo users
def seed_users(db: Session):
    if not db.query(User).filter(User.email == "admin@farm.com").first():
        admin_hash = get_password_hash("admin123")
        admin = User(
            email="admin@farm.com",
            name="System Admin",
            role="Admin",
            hashed_password=admin_hash,
            original_password_hash=admin_hash
        )
        db.add(admin)
    if not db.query(User).filter(User.email == "staff@farm.com").first():
        staff_hash = get_password_hash("staff123")
        staff = User(
            email="staff@farm.com",
            name="Farm Worker",
            role="Staff",
            hashed_password=staff_hash,
            original_password_hash=staff_hash
        )
        db.add(staff)
    for user in db.query(User).filter((User.original_password_hash == None) | (User.original_password_hash == "")).all():
        user.original_password_hash = user.hashed_password
    db.commit()
