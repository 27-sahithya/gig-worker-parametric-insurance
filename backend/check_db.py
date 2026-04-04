from sqlalchemy import create_engine, inspect
import os

DATABASE_URL = "sqlite:///./rakshak_ai_v3.db" 
engine = create_engine(DATABASE_URL)

try:
    inspector = inspect(engine)
    if 'users' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('users')]
        print(f"Columns: {columns}")
    else:
        print("Table 'users' does not exist.")
except Exception as e:
    print(f"Error: {e}")
