from fastapi import FastAPI
from . import models, database
from .auth import router as auth_router
from .dependencies import router as meals_router
from .week_endpoints import router as weeks_router
import uvicorn

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(meals_router)
app.include_router(weeks_router)

@app.on_event("startup")
def on_startup():
    database.Base.metadata.create_all(bind=database.engine)

@app.get("/")
def read_root():
    return {"message": "Meal Planner API is running"}

from fastapi import Request
@app.get("/test-headers")
def test_headers(request: Request):
    headers = dict(request.headers)
    import logging
    logger = logging.getLogger("auth-debug")
    logger.info("[TEST] Incoming headers: %s", headers)
    return headers
