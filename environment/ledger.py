"""
Ledger Service - persistent store for confirmed transactions.
"""
from flask import Flask, request, jsonify
import sqlite3
import os
import logging
import threading

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_PATH = '/app/data/ledger.db'
lock = threading.Lock()

def init_db():
    """Initialize the database."""
    if not os.path.exists('/app/data'):
        os.makedirs('/app/data')
    
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

init_db()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

@app.route('/record', methods=['POST'])
def record_transaction():
    """Record a transaction in the ledger."""
    data = request.get_json()
    transaction_id = data.get('transaction_id')
    customer_id = data.get('customer_id')
    amount = data.get('amount')
    
    if not all([transaction_id, customer_id, amount]):
        return jsonify({"error": "Missing fields"}), 400
    
    try:
        with lock:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Record transaction
            cursor.execute('''
                INSERT INTO transactions (transaction_id, customer_id, amount)
                VALUES (?, ?, ?)
            ''', (transaction_id, customer_id, amount))
            
            # Update balance
            cursor.execute('''
                INSERT INTO balances (customer_id, balance)
                VALUES (?, ?)
                ON CONFLICT(customer_id) DO UPDATE SET balance = balance + ?
            ''', (customer_id, amount, amount))
            
            conn.commit()
            conn.close()
        
        logger.info(f"Recorded transaction {transaction_id}: {amount} for {customer_id}")
        return jsonify({"status": "recorded"}), 200
    
    except Exception as e:
        logger.error(f"Ledger error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/balance/<customer_id>', methods=['GET'])
def get_balance(customer_id):
    """Get customer balance."""
    try:
        with lock:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT balance FROM balances WHERE customer_id = ?
            ''', (customer_id,))
            
            row = cursor.fetchone()
            conn.close()
        
        balance = row[0] if row else 0
        return jsonify({"customer_id": customer_id, "balance": balance}), 200
    
    except Exception as e:
        logger.error(f"Balance query error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/transactions/<customer_id>', methods=['GET'])
def get_transactions(customer_id):
    """Get all transactions for a customer."""
    try:
        with lock:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT transaction_id, amount, created_at FROM transactions
                WHERE customer_id = ?
                ORDER BY created_at DESC
            ''', (customer_id,))
            
            rows = cursor.fetchall()
            conn.close()
        
        transactions = [
            {"transaction_id": row[0], "amount": row[1], "created_at": row[2]}
            for row in rows
        ]
        
        return jsonify({"customer_id": customer_id, "transactions": transactions}), 200
    
    except Exception as e:
        logger.error(f"Transaction query error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/reset', methods=['POST'])
def reset():
    """Reset the database (for testing)."""
    try:
        os.remove(DB_PATH)
        init_db()
        return jsonify({"status": "reset"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)
