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

RUN mkdir -p /app/data

EXPOSE 5000 5001 5002

CMD ["sh", "-c", "echo 'Use docker-compose to start all services'"]
