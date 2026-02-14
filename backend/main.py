from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers.auth_router import router as auth_router
from fastapi.staticfiles import StaticFiles
import os

Base.metadata.create_all(bind=engine)

# Ensure profile_pic column exists (for simple dev migrations)
from sqlalchemy import text
with engine.connect() as conn:
    try:
        res = conn.execute(text("PRAGMA table_info('users')")).fetchall()
        cols = [r[1] for r in res]
        if 'profile_pic' not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_pic VARCHAR"))
    except Exception:
        pass

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api", tags=["auth"])

@app.get("/")
def read_root():
    return {"message": "Auth API"}

# Serve uploaded static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(os.path.join(static_dir, "profile_pics"), exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")