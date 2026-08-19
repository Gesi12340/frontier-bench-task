FROM python:3.11-slim-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY environment/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY environment/gateway.py .
COPY environment/processor.py .
COPY environment/ledger.py .
COPY environment/docker-compose.yaml .

# Create data directory and initialize database at build time (no volumes)
RUN mkdir -p /app/data && \
    python3 << 'INIT_DB'
import sqlite3

DB_PATH = '/app/data/ledger.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        transaction_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        amount REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')

cursor.execute('''
    CREATE TABLE IF NOT EXISTS balances (
        customer_id TEXT PRIMARY KEY,
        balance REAL DEFAULT 0
    )
''')

conn.commit()
conn.close()
print("Database initialized")
INIT_DB

EXPOSE 5000 5001 5002

CMD ["sh", "-c", "echo 'Use docker-compose to start all services'"]
