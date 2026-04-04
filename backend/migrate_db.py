import sqlite3
import os

db_path = "rakshak_ai_v3.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check current columns
    cursor.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"Current columns: {columns}")
    
    # Add missing columns
    new_cols = [
        ("paid_until", "TEXT"),
        ("user_image", "TEXT"),
        ("selected_plan", "TEXT DEFAULT 'Basic'"),
        ("is_paused", "BOOLEAN DEFAULT 0")
    ]
    
    for col_name, col_type in new_cols:
        if col_name not in columns:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                print(f"Added column: {col_name}")
            except Exception as e:
                print(f"Error adding {col_name}: {e}")
        else:
            print(f"Column {col_name} already exists.")
            
    conn.commit()
    conn.close()
    print("Migration complete.")
else:
    print(f"Database {db_path} not found.")
