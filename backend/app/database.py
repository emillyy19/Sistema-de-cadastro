from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 1. Puxa a URL da Render. Se não achar, usa um SQLite local como plano B para não quebrar.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# 2. Configura a Engine de forma inteligente
# Se for usar SQLite local, ativa o check_same_thread. Se for o Postgres do Supabase, ignora.
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependência do FastAPI para obter a sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()