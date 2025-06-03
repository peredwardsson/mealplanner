from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from . import schemas, crud, models, database
from .auth import oauth2_scheme, get_db
from jose import jwt, JWTError
from fastapi import status
import os

router = APIRouter(prefix="/meals", tags=["meals"])

SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"

import logging
import sys
logger = logging.getLogger("auth-debug")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.INFO)
formatter = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
handler.setFormatter(formatter)
if not logger.hasHandlers():
    logger.addHandler(handler)
logger.propagate = False  # Prevent double logging

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    print("[AUTH] Raw token received:", token)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("[AUTH] Decoded payload:", payload)
        user_id: str = payload.get("sub")
        print("[AUTH] user_id from payload:", user_id)
        if user_id is None:
            print("[AUTH] user_id is None, raising credentials_exception")
            raise credentials_exception
    except JWTError as e:
        print("[AUTH] JWTError:", str(e))
        raise credentials_exception
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    print("[AUTH] User from DB:", user)
    if user is None:
        print("[AUTH] User not found in DB, raising credentials_exception")
        raise credentials_exception
    print("[AUTH] User authenticated:", user.email)
    return user

@router.post("/", response_model=schemas.MealOut, status_code=201)
def create_meal(meal: schemas.MealCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_meal(db, meal, current_user.id)

@router.get("/", response_model=List[schemas.MealOut])
def list_meals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    category: Optional[str] = None,
    taste_profile: Optional[str] = None,
    cost: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    return crud.get_meals(db, current_user.id, skip, limit, category, taste_profile, cost)

@router.put("/{meal_id}", response_model=schemas.MealOut)
def update_meal(meal_id: int, meal: schemas.MealCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    updated = crud.update_meal(db, meal_id, meal, current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Meal not found")
    return updated

@router.delete("/{meal_id}", status_code=204)
def delete_meal(meal_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    deleted = crud.delete_meal(db, meal_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Meal not found")
    return None
