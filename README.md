# Payment System Silent Data Loss Debugging Task

## Overview

This Frontier Bench task tests an agent's ability to debug a complex, production-like issue in a distributed system. The challenge is finding and fixing a **silent failure** — a bug that leaves no error logs or obvious traces.

## The Bug

A three-service payment system (gateway, processor, ledger) loses transaction data under concurrent load. The bug has multiple layers:

1. **Silent exception**: The processor's background worker catches exceptions but never logs them
2. **State machine bug**: An off-by-one error in the transaction state loop
3. **Race condition**: The bug only manifests when transactions arrive within 50ms of each other
4. **No error signals**: Transactions appear to confirm but silently drop without any indication of failure

## Why This Is Hard

- **Silent failures are the hardest debugging problem**: No crash, no error logs, no obvious signal
- **Multi-service complexity**: The bug spans a race condition between two services
- **Requires deep understanding**: Needs knowledge of async/await, threads, state machines, and transaction semantics
- **Timing-dependent**: Must understand concurrent execution patterns to reproduce
- **No shortcuts**: Can't find the answer by searching online; must actually debug the system

## What Agents Must Do

1. **Reproduce** the bug under concurrent load
2. **Instrument** the system to surface hidden failures
3. **Trace** transactions end-to-end across services
4. **Identify** the root cause among four plausible options
5. **Fix** the code
6. **Verify** the fix works under stress

## Reference Solution

The reference solution is in `solution/solve.sh`. It:
- Sends concurrent deposits to trigger the race condition
- Analyzes the processor code to find the silent exception
- Fixes the bug by adding proper exception handling and logging
- Verifies with stress tests that all transactions are recorded

## Verification

The verifier (`tests/test.sh`) checks:
- The fix report exists and contains all required fields
- The root cause is correctly identified (silent_exception or state_machine_bug)
- The explanation describes the actual bug
- A stress test confirms all transactions are recorded end-to-end

## Anti-Cheat Hardening

The `cheat/` directory contains a deliberate cheating attempt that:
- Generates a plausible but wrong fix report
- Doesn't actually fix the bug
- Would pass if the verifier only checked the JSON, not functionality

This tests that our verifier actually runs the system and validates it works.

## Expected Difficulty

- Expert backend engineer time: **2-4 hours** for a single focused session
- Frontier agent success rate: **1-6 out of 8 attempts** (at the frontier)
- Key failure modes:
  - Shallow debugging (add logging without understanding the root cause)
  - Hypothesis jumping (trying obvious fixes without verification)
  - Isolation trap (fixing one service without understanding the cross-service race)
  - Timeout (spending too long on hypothesis generation rather than execution)

## Running Locally

```bash
# Build and start the buggy system
docker-compose up -d

# The bug will manifest under concurrent load:
# - Transactions appear to confirm
# - But balance doesn't increase correctly
# - No error logs explain why

# To verify the reference solution works:
bash solution/solve.sh

# To run the verifier:
docker build -f tests/Dockerfile -t payment-verifier .
docker run --network payment_network payment-verifier
```
