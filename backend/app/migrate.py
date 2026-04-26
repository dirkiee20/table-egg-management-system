import sqlite3
from pathlib import Path


DB_PATH = Path(__file__).resolve().parent.parent / "farm.db"


def add_column(cursor, table, column, column_type, default=""):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {column_type} {default}")
        print(f"Added {column} to {table}")
    except sqlite3.OperationalError as error:
        if "duplicate column name" in str(error):
            print(f"Column {column} already exists in {table}")
        else:
            print(f"Error adding {column} to {table}: {error}")


def run_migrations(db_path: Path | None = None):
    active_db_path = Path(db_path) if db_path else DB_PATH
    conn = sqlite3.connect(active_db_path)
    cursor = conn.cursor()

    add_column(cursor, "users", "original_password_hash", "VARCHAR")

    # Calendar: time, description, status
    add_column(cursor, "calendar", "time", "VARCHAR")
    add_column(cursor, "calendar", "description", "VARCHAR")
    add_column(cursor, "calendar", "status", "VARCHAR", "DEFAULT 'Pending'")

    # Production: grading and damages
    add_column(cursor, "production", "large", "INTEGER", "DEFAULT 0")
    add_column(cursor, "production", "medium", "INTEGER", "DEFAULT 0")
    add_column(cursor, "production", "small", "INTEGER", "DEFAULT 0")
    add_column(cursor, "production", "cracked", "INTEGER", "DEFAULT 0")
    add_column(cursor, "production", "reject", "INTEGER", "DEFAULT 0")
    add_column(cursor, "production", "totalGoodEggs", "INTEGER", "DEFAULT 0")
    add_column(cursor, "production", "jumbo", "INTEGER", "DEFAULT 0")
    add_column(cursor, "production", "extralarge", "INTEGER", "DEFAULT 0")
    add_column(cursor, "production", "peewee", "INTEGER", "DEFAULT 0")
    add_column(cursor, "production", "bunkig", "INTEGER", "DEFAULT 0")
    add_column(cursor, "production", "staff_incharge", "VARCHAR")

    # Inventory: grading support
    add_column(cursor, "inventory", "large", "INTEGER", "DEFAULT 0")
    add_column(cursor, "inventory", "medium", "INTEGER", "DEFAULT 0")
    add_column(cursor, "inventory", "small", "INTEGER", "DEFAULT 0")
    add_column(cursor, "inventory", "jumbo", "INTEGER", "DEFAULT 0")
    add_column(cursor, "inventory", "extralarge", "INTEGER", "DEFAULT 0")
    add_column(cursor, "inventory", "peewee", "INTEGER", "DEFAULT 0")

    # Sales details
    add_column(cursor, "sales", "customer_name", "VARCHAR")
    add_column(cursor, "sales", "contact_no", "VARCHAR")
    add_column(cursor, "sales", "address", "VARCHAR")
    add_column(cursor, "sales", "balance", "FLOAT", "DEFAULT 0.0")
    add_column(cursor, "sales", "staff_incharge", "VARCHAR")
    add_column(cursor, "sales", "jumbo", "INTEGER", "DEFAULT 0")
    add_column(cursor, "sales", "extralarge", "INTEGER", "DEFAULT 0")
    add_column(cursor, "sales", "large", "INTEGER", "DEFAULT 0")
    add_column(cursor, "sales", "medium", "INTEGER", "DEFAULT 0")
    add_column(cursor, "sales", "small", "INTEGER", "DEFAULT 0")
    add_column(cursor, "sales", "peewee", "INTEGER", "DEFAULT 0")

    # Vaccinations: manual completion tracking and staff ownership
    add_column(cursor, "vaccinations", "status", "VARCHAR", "DEFAULT 'Pending'")
    add_column(cursor, "vaccinations", "administeredBy", "VARCHAR")

    try:
        cursor.execute("UPDATE sales SET customer_name = customer WHERE customer_name IS NULL OR customer_name = ''")
        print("Backfilled customer -> customer_name in sales")
    except Exception as error:
        print("Error backfilling:", error)

    try:
        cursor.execute(
            """
            UPDATE users
            SET original_password_hash = hashed_password
            WHERE original_password_hash IS NULL OR original_password_hash = ''
            """
        )
        print("Backfilled users.original_password_hash from hashed_password")
    except Exception as error:
        print("Error backfilling original_password_hash:", error)

    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS feed_consumption (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date VARCHAR,
                flockId VARCHAR,
                feedConsumedKgs FLOAT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        print("Ensured feed_consumption table exists")
    except Exception as error:
        print("Error creating feed_consumption table:", error)

    conn.commit()
    conn.close()
    print(f"Migration completed for {active_db_path}")


if __name__ == "__main__":
    run_migrations()
