import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'farm.db')

def add_column(cursor, table, column, column_type, default=""):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {column_type} {default}")
        print(f"Added {column} to {table}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"Column {column} already exists in {table}")
        else:
            print(f"Error adding {column} to {table}: {e}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Calendar: time, description, status
add_column(cursor, "calendar", "time", "VARCHAR")
add_column(cursor, "calendar", "description", "VARCHAR")
add_column(cursor, "calendar", "status", "VARCHAR", "DEFAULT 'Pending'")

# Production: large, medium, small, cracked, reject, totalGoodEggs
add_column(cursor, "production", "large", "INTEGER", "DEFAULT 0")
add_column(cursor, "production", "medium", "INTEGER", "DEFAULT 0")
add_column(cursor, "production", "small", "INTEGER", "DEFAULT 0")
add_column(cursor, "production", "cracked", "INTEGER", "DEFAULT 0")
add_column(cursor, "production", "reject", "INTEGER", "DEFAULT 0")
add_column(cursor, "production", "totalGoodEggs", "INTEGER", "DEFAULT 0")

# Inventory: large, medium, small
add_column(cursor, "inventory", "large", "INTEGER", "DEFAULT 0")
add_column(cursor, "inventory", "medium", "INTEGER", "DEFAULT 0")
add_column(cursor, "inventory", "small", "INTEGER", "DEFAULT 0")

# Sales: customer_name, contact_no, address
add_column(cursor, "sales", "customer_name", "VARCHAR")
add_column(cursor, "sales", "contact_no", "VARCHAR")
add_column(cursor, "sales", "address", "VARCHAR")

# Backfill Sales customer to customer_name
try:
    cursor.execute("UPDATE sales SET customer_name = customer WHERE customer_name IS NULL OR customer_name = ''")
    print("Backfilled customer -> customer_name in sales")
except Exception as e:
    print("Error backfilling:", e)

# Feed Consumption Table
try:
    cursor.execute('''CREATE TABLE IF NOT EXISTS feed_consumption (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date VARCHAR,
        flockId VARCHAR,
        feedConsumedKgs FLOAT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')
    print("Ensured feed_consumption table exists")
except Exception as e:
    print("Error creating feed_consumption table:", e)

conn.commit()
conn.close()
print("Migration completed.")
