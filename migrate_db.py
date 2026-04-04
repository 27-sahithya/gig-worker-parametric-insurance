import sqlite3
import os

db_path = os.path.join('backend', 'database.db')
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN weekly_premium FLOAT DEFAULT 0.0;")
        conn.commit()
        print("Successfully added weekly_premium column.")
    except sqlite3.OperationalError as e:
        print(f"Error or already exists: {e}")
    finally:
        conn.close()
else:
    print(f"Database not found at {db_path}")
