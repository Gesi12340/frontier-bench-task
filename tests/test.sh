#!/bin/bash
set -e

REWARD_FILE="/logs/verifier/reward.txt"
mkdir -p /logs/verifier

# Verify fix_report.json exists and is valid
if [ ! -f /app/fix_report.json ]; then
    echo "0" > "$REWARD_FILE"
    echo "FAILED: /app/fix_report.json not found"
    exit 0
fi

# Parse and validate the fix report
python3 << 'PYTHON_VALIDATION'
import json
import sys
import subprocess
import time
import requests
import threading

try:
    with open('/app/fix_report.json', 'r') as f:
        report = json.load(f)
    
    # Validate required fields
    required_fields = ['root_cause', 'explanation', 'fixed_file', 'fix_type', 'verification_passed']
    for field in required_fields:
        if field not in report:
            print(f"FAILED: Missing field {field}")
            sys.exit(1)
    
    # Validate root_cause is correct
    valid_root_causes = ['race_condition', 'silent_exception', 'isolation_level', 'state_machine_bug']
    if report['root_cause'] not in valid_root_causes:
        print(f"FAILED: Invalid root_cause value")
        sys.exit(1)
    
    # The actual bug is silent_exception (with state_machine_bug as secondary component)
    # Accept if student identified silent_exception or state_machine_bug
    if report['root_cause'] not in ['silent_exception', 'state_machine_bug']:
        print(f"FAILED: Wrong root cause identified: {report['root_cause']}")
        sys.exit(1)
    
    # Validate explanation is present and substantial
    if len(report['explanation']) < 50:
        print(f"FAILED: Explanation too short")
        sys.exit(1)
    
    # Validate fix_type
    valid_fix_types = ['code_change', 'config_change', 'both']
    if report['fix_type'] not in valid_fix_types:
        print(f"FAILED: Invalid fix_type")
        sys.exit(1)
    
    # The fix must be a code_change
    if report['fix_type'] not in ['code_change', 'both']:
        print(f"FAILED: This bug requires a code_change")
        sys.exit(1)
    
    if report['verification_passed'] is not True:
        print(f"FAILED: Verification not marked as passed")
        sys.exit(1)
    
    print("✓ Fix report validation passed")
    
except json.JSONDecodeError as e:
    print(f"FAILED: Invalid JSON in fix_report.json: {str(e)}")
    sys.exit(1)
except Exception as e:
    print(f"FAILED: Validation error: {str(e)}")
    sys.exit(1)
PYTHON_VALIDATION

# Now verify that the fix actually works by testing the system
echo "Testing system with stress test..."

python3 << 'STRESS_TEST'
import requests
import time
import threading
import sys
import json

GATEWAY_URL = "http://gateway:5000"
LEDGER_URL = "http://ledger:5002"

# Wait for services
for i in range(30):
    try:
        requests.get(f"{GATEWAY_URL}/health", timeout=2)
        requests.get(f"{LEDGER_URL}/health", timeout=2)
        break
    except:
        time.sleep(1)

# Reset ledger
try:
    requests.post(f"{LEDGER_URL}/reset", timeout=10)
except:
    pass

time.sleep(1)

# Stress test: concurrent deposits
CUSTOMER_ID = "stress-test-customer"
NUM_DEPOSITS = 10
TOTAL_EXPECTED = sum(range(100, 100 + NUM_DEPOSITS))  # 100+101+102+...+109

print(f"Sending {NUM_DEPOSITS} concurrent deposits with 30ms spacing...")

def send_deposit(amount, delay):
    time.sleep(delay)
    try:
        requests.post(
            f"{GATEWAY_URL}/deposit",
            json={"amount": amount, "customer_id": CUSTOMER_ID},
            timeout=10
        )
    except Exception as e:
        print(f"Deposit error: {e}")

threads = []
for i in range(NUM_DEPOSITS):
    amount = 100 + i
    delay = i * 0.03  # 30ms spacing
    t = threading.Thread(target=send_deposit, args=(amount, delay))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

# Wait for processing
time.sleep(4)

# Check balance
try:
    response = requests.get(f"{GATEWAY_URL}/balance/{CUSTOMER_ID}", timeout=10)
    if response.status_code == 200:
        data = response.json()
        actual_balance = data.get('balance', 0)
        print(f"Expected balance: {TOTAL_EXPECTED}, Actual: {actual_balance}")
        
        if actual_balance == TOTAL_EXPECTED:
            print("✓ Stress test PASSED: All transactions recorded")
            sys.exit(0)
        else:
            print(f"✗ Balance mismatch: {actual_balance} != {TOTAL_EXPECTED}")
            sys.exit(1)
    else:
        print(f"Balance query failed: {response.status_code}")
        sys.exit(1)
except Exception as e:
    print(f"Stress test error: {str(e)}")
    sys.exit(1)
STRESS_TEST

TEST_RESULT=$?

# Write reward
if [ $TEST_RESULT -eq 0 ]; then
    echo "1" > "$REWARD_FILE"
    echo "PASSED: Fix verified and system works correctly"
else
    echo "0" > "$REWARD_FILE"
    echo "FAILED: Stress test did not pass"
fi

exit 0
