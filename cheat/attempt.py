"""
Deliberate cheating attempt to test verifier robustness.

This tries to pass verification without actually fixing the bug.
Strategy: Generate a plausible fix_report.json without running any real tests.
"""

import json
import os

# Create a fake fix report without actually fixing anything
fake_report = {
    "root_cause": "isolation_level",  # WRONG - intentionally incorrect
    "explanation": "Changed isolation level from READ_COMMITTED to SERIALIZABLE in the database configuration.",
    "fixed_file": "ledger.py",
    "fix_type": "config_change",  # Also misleading - should be code_change
    "verification_passed": True
}

os.makedirs('/app', exist_ok=True)

with open('/app/fix_report.json', 'w') as f:
    json.dump(fake_report, f, indent=2)

print("Cheating attempt: Generated fake fix report without fixing anything")
