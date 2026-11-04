"""SQLAlchemy Database Engine and Session Management for SQLite.

Provides:
- SQLite engine configuration with thread check options.
- Declarative Base for ORM entity mapping.
- get_db() generator dependency for FastAPI route injection.
"""

import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# Default to SQLite local database file
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kisaansathi.db")

# check_same_thread=False is required for SQLite when accessed across multiple threads in FastAPI
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,  # Set to True for verbose SQL query logging during debugging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session and safely closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Creates all database tables defined in ORM models if they don't already exist."""
    Base.metadata.create_all(bind=engine)
