from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from . import schemas, crud, models, database
from .auth import oauth2_scheme, get_db
from .dependencies import get_current_user

router = APIRouter(prefix="/weeks", tags=["weeks"])

@router.get("/{year}/{week_number}/summary", response_model=schemas.WeeklySummaryOut)
def weekly_summary(year: int, week_number: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    summary = crud.get_weekly_summary(db, current_user.id, year, week_number)
    summary["meals"] = [schemas.MealOut.from_orm(m) for m in summary["meals"]]
    return summary

@router.get("/{year}/{week_number}", response_model=schemas.WeekOut)
def get_week(year: int, week_number: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    week, assignments = crud.get_week_with_assignments(db, current_user.id, year, week_number)
    # Build response with all days of week
    days_of_week = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    day_map = {a.day: a for a in assignments}
    days = []
    for day in days_of_week:
        assignment = day_map.get(day)
        days.append(schemas.DayAssignmentOut(
            day=day,
            meal=schemas.MealOut.from_orm(assignment.meal) if assignment and assignment.meal else None
        ))
    return schemas.WeekOut(year=week.year, week_number=week.week_number, days=days)

@router.put("/{year}/{week_number}/days/{day}", response_model=schemas.DayAssignmentOut)
def assign_meal(year: int, week_number: int, day: str, body: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    meal_id = body.get("meal_id")
    # meal_id can be None for leftovers
    assignment = crud.assign_meal_to_day(db, current_user.id, year, week_number, day, meal_id)
    if assignment is None and meal_id is not None:
        raise HTTPException(status_code=404, detail="Meal not found or not yours")
    return schemas.DayAssignmentOut(
        day=assignment.day,
        meal=schemas.MealOut.from_orm(assignment.meal) if assignment.meal else None
    )
