from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional

def get_meals(db: Session, user_id: int, skip: int = 0, limit: int = 100, category: Optional[str] = None, taste_profile: Optional[str] = None, cost: Optional[str] = None) -> List[models.Meal]:
    query = db.query(models.Meal).filter(models.Meal.owner_id == user_id)
    if category:
        query = query.filter(models.Meal.category == category)
    if taste_profile:
        query = query.filter(models.Meal.taste_profile == taste_profile)
    if cost:
        query = query.filter(models.Meal.cost == cost)
    return query.offset(skip).limit(limit).all()

def get_meal(db: Session, user_id: int, meal_id: int) -> Optional[models.Meal]:
    return db.query(models.Meal).filter(models.Meal.owner_id == user_id, models.Meal.id == meal_id).first()

def create_meal(db: Session, meal: schemas.MealCreate, user_id: int) -> models.Meal:
    db_meal = models.Meal(**meal.dict(), owner_id=user_id)
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    return db_meal

def update_meal(db: Session, meal_id: int, meal: schemas.MealCreate, user_id: int) -> Optional[models.Meal]:
    db_meal = get_meal(db, user_id, meal_id)
    if not db_meal:
        return None
    for field, value in meal.dict().items():
        setattr(db_meal, field, value)
    db.commit()
    db.refresh(db_meal)
    return db_meal

def delete_meal(db: Session, meal_id: int, user_id: int) -> bool:
    db_meal = get_meal(db, user_id, meal_id)
    if not db_meal:
        return False
    db.delete(db_meal)
    db.commit()
    return True

# --- Week/Assignment CRUD ---
def get_or_create_week(db: Session, user_id: int, year: int, week_number: int):
    week = db.query(models.Week).filter_by(owner_id=user_id, year=year, week_number=week_number).first()
    if not week:
        week = models.Week(owner_id=user_id, year=year, week_number=week_number)
        db.add(week)
        db.commit()
        db.refresh(week)
    return week

def get_week_with_assignments(db: Session, user_id: int, year: int, week_number: int):
    week = get_or_create_week(db, user_id, year, week_number)
    assignments = db.query(models.DayAssignment).filter_by(week_id=week.id).all()
    return week, assignments

def assign_meal_to_day(db: Session, user_id: int, year: int, week_number: int, day: str, meal_id: int | None):
    week = get_or_create_week(db, user_id, year, week_number)
    assignment = db.query(models.DayAssignment).filter_by(week_id=week.id, day=day).first()
    if meal_id is not None:
        meal = db.query(models.Meal).filter_by(id=meal_id, owner_id=user_id).first()
        if not meal:
            return None  # meal not found or not owned by user
    if assignment:
        assignment.meal_id = meal_id
    else:
        assignment = models.DayAssignment(week_id=week.id, day=day, meal_id=meal_id)
        db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

def get_assignment_for_day(db: Session, user_id: int, year: int, week_number: int, day: str):
    week = get_or_create_week(db, user_id, year, week_number)
    return db.query(models.DayAssignment).filter_by(week_id=week.id, day=day).first()

def get_weekly_summary(db: Session, user_id: int, year: int, week_number: int):
    week = get_or_create_week(db, user_id, year, week_number)
    assignments = db.query(models.DayAssignment).filter_by(week_id=week.id).all()
    meals = []
    categories_count = {}
    taste_profiles = {}
    cost_summary = {}
    leftovers_count = 0
    for a in assignments:
        if a.meal:
            meals.append(a.meal)
            cat = a.meal.category.value if hasattr(a.meal.category, 'value') else a.meal.category
            categories_count[cat] = categories_count.get(cat, 0) + 1
            taste_profiles[a.meal.taste_profile] = taste_profiles.get(a.meal.taste_profile, 0) + 1
            cost = a.meal.cost.value if hasattr(a.meal.cost, 'value') else a.meal.cost
            cost_summary[cost] = cost_summary.get(cost, 0) + 1
        else:
            leftovers_count += 1
    return {
        "meals": meals,
        "categories_count": categories_count,
        "taste_profiles": taste_profiles,
        "cost_summary": cost_summary,
        "leftovers_count": leftovers_count
    }
