"""
API Gateway Service - receives deposits and forwards to processor.
"""
from flask import Flask, request, jsonify
import requests
import uuid
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PROCESSOR_URL = "http://processor:5001"

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

@app.route('/deposit', methods=['POST'])
def deposit():
    """Accept a deposit request and forward to processor."""
    data = request.get_json()
    amount = data.get('amount')
    customer_id = data.get('customer_id')
    
    if not amount or not customer_id:
        return jsonify({"error": "Missing amount or customer_id"}), 400
    
    transaction_id = str(uuid.uuid4())
    
    try:
        # Forward to processor
        response = requests.post(
            f"{PROCESSOR_URL}/process",
            json={
                "transaction_id": transaction_id,
                "amount": amount,
                "customer_id": customer_id
            },
            timeout=30
        )
        
        if response.status_code == 200:
            logger.info(f"Transaction {transaction_id} confirmed: {amount} for {customer_id}")
            return jsonify({
                "transaction_id": transaction_id,
                "status": "confirmed",
                "amount": amount
            }), 200
        else:
            logger.error(f"Processor error: {response.text}")
            return jsonify({"error": "Processing failed"}), 500
    
    except Exception as e:
        logger.error(f"Gateway error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/balance/<customer_id>', methods=['GET'])
def get_balance(customer_id):
    """Query balance from ledger."""
    try:
        response = requests.get(
            f"http://ledger:5002/balance/{customer_id}",
            timeout=10
        )
        if response.status_code == 200:
            return response.json(), 200
        else:
            return jsonify({"error": "Ledger error"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
