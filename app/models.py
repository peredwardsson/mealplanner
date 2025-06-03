from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from .database import Base
import enum

class CategoryEnum(str, enum.Enum):
    meat = "meat"
    fish = "fish"
    veg = "veg"

class CostEnum(str, enum.Enum):
    cheap = "$"
    medium = "$$"
    expensive = "$$$"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    meals = relationship("Meal", back_populates="owner")

class Meal(Base):
    __tablename__ = "meals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(Enum(CategoryEnum), nullable=False)
    taste_profile = Column(String, nullable=False)
    cost = Column(Enum(CostEnum), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="meals")

class Week(Base):
    __tablename__ = "weeks"
    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    week_number = Column(Integer, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    assignments = relationship("DayAssignment", back_populates="week")

class DayAssignment(Base):
    __tablename__ = "day_assignments"
    id = Column(Integer, primary_key=True, index=True)
    week_id = Column(Integer, ForeignKey("weeks.id"))
    day = Column(String, nullable=False)  # e.g., 'monday', 'tuesday', ...
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=True)  # nullable for 'leftovers' or unassigned
    week = relationship("Week", back_populates="assignments")
    meal = relationship("Meal")
