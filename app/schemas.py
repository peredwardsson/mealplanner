from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum

class CategoryEnum(str, Enum):
    meat = "meat"
    fish = "fish"
    veg = "veg"

class CostEnum(str, Enum):
    cheap = "$"
    medium = "$$"
    expensive = "$$$"

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class MealBase(BaseModel):
    name: str
    category: CategoryEnum
    taste_profile: str
    cost: CostEnum

class MealCreate(MealBase):
    pass

class MealOut(MealBase):
    id: int
    model_config = {"from_attributes": True}

class DayAssignmentOut(BaseModel):
    day: str
    meal: Optional[MealOut]
    model_config = {"from_attributes": True}

class WeekOut(BaseModel):
    year: int
    week_number: int
    days: List[DayAssignmentOut]
    model_config = {"from_attributes": True}

class WeeklySummaryOut(BaseModel):
    meals: List[MealOut]
    categories_count: dict
    taste_profiles: dict
    cost_summary: dict
    leftovers_count: int
