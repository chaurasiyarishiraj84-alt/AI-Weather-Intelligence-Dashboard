import os

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker


# Load environment variables
load_dotenv()


# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./weather.db"
)


# SQLite requires this setting
connect_args = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False
    }


# Engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)


# Session Factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base Model
Base = declarative_base()


# Dependency Injection
def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()