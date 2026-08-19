"""
Transaction Processor Service - processes transactions asynchronously.
This service has the silent exception bug.
"""
from flask import Flask, request, jsonify
import requests
import logging
import threading
import queue
import time

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LEDGER_URL = "http://ledger:5002"

# Transaction queue for async processing
tx_queue = queue.Queue()

# State machine for transaction states
transaction_states = {}

def process_queue_worker():
    """Background worker that processes transactions from queue.
    
    THIS HAS THE BUG: silent exception in the state machine loop.
    """
    while True:
        try:
            tx_data = tx_queue.get(timeout=1)
            transaction_id = tx_data['transaction_id']
            amount = tx_data['amount']
            customer_id = tx_data['customer_id']
            
            # State machine: track transaction through states
            states = ['queued', 'processing', 'committing', 'committed']
            
            transaction_states[transaction_id] = {'state_idx': 0}
            
            for state_idx, state_name in enumerate(states):
                transaction_states[transaction_id]['state_idx'] = state_idx
                
                if state_name == 'processing':
                    # Simulate processing
                    time.sleep(0.01)
                
                elif state_name == 'committing':
                    # BUG: This line has an off-by-one error that crashes silently
                    # When two transactions arrive within 50ms, the second one's
                    # state_idx becomes 2, and this line tries to access states[3]
                    # which doesn't exist in some race conditions
                    next_state = states[state_idx + 1]  # Can cause IndexError
                    
                    # Attempt to commit to ledger
                    response = requests.post(
                        f"{LEDGER_URL}/record",
                        json={
                            "transaction_id": transaction_id,
                            "amount": amount,
                            "customer_id": customer_id
                        },
                        timeout=5
                    )
                    
                    if response.status_code != 200:
                        # Silently fail - NO logging of this error!
                        transaction_states[transaction_id]['state'] = 'failed'
                        break
            
            transaction_states[transaction_id]['state'] = 'completed'
            
        except queue.Empty:
            continue
        except Exception as e:
            # BUG: Exception is caught but never logged or re-raised
            # The worker thread just swallows the error silently
            pass

# Start background worker thread
worker_thread = threading.Thread(target=process_queue_worker, daemon=True)
worker_thread.start()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

@app.route('/process', methods=['POST'])
def process_transaction():
    """Accept a transaction and queue it for processing."""
    data = request.get_json()
    transaction_id = data.get('transaction_id')
    amount = data.get('amount')
    customer_id = data.get('customer_id')
    
    if not all([transaction_id, amount, customer_id]):
        return jsonify({"error": "Missing fields"}), 400
    
    # Queue for async processing
    tx_queue.put({
        'transaction_id': transaction_id,
        'amount': amount,
        'customer_id': customer_id
    })
    
    logger.info(f"Transaction {transaction_id} queued for processing")
    return jsonify({"status": "queued"}), 200

@app.route('/status/<transaction_id>', methods=['GET'])
def get_status(transaction_id):
    """Check transaction status."""
    state_info = transaction_states.get(transaction_id, {})
    return jsonify(state_info), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
