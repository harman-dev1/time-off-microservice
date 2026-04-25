# Time-Off Microservice (ReadyOn HCM Sync)

## Overview

This service manages employee time-off requests while staying consistent with an external HCM system (e.g., Workday/SAP), which is the source of truth for leave balances.

The system ensures that employees cannot exceed available balance and that any external updates from HCM (like yearly resets or bonuses) are reflected correctly.

---

## Problem

- HCM is the source of truth but external to the system
- Balances can change independently in HCM
- Multiple systems may update the same employee balance
- HCM may fail or return inconsistent responses
- System must still prevent invalid leave approvals

---

## Solution

The service uses a hybrid approach:

- Local DB stores cached balances for fast access
- HCM API is used for validation and reconciliation
- Batch sync keeps local data aligned with HCM
- Defensive checks ensure correctness even when HCM fails

---

## Tech Stack

- NestJS
- SQLite
- TypeORM
- Jest (unit + e2e testing)

---

## Core Entities

- EmployeeBalance (employeeId, locationId, availableBalance, version)
- TimeOffRequest (employeeId, days, status, reason)
- Ledger (tracks balance changes)
- SyncMetadata (tracks last HCM sync)

---

## API Endpoints

### Time-Off

- `POST /timeoff/request` → create request
- `GET /timeoff/balance/:employeeId` → get balance
- `GET /timeoff/requests/:employeeId` → list requests
- `POST /timeoff/approve/:id` → approve request
- `POST /timeoff/reject/:id` → reject request

---

### HCM Sync (internal)

- `POST /sync/hcm/batch` → full balance sync
- `GET /sync/hcm/employee/:id` → single employee sync

---

## Sync Strategy

### Real-time flow
- Validate request using local balance
- Confirm with HCM API before final approval
- Reject if insufficient balance

### Batch flow
- Periodically sync full dataset from HCM
- Update local cache with latest balances
- Maintain version to avoid stale overwrites

---

## Defensive Design

- If HCM fails → use last known local state
- If HCM returns error → reject request safely
- If mismatch detected → reconcile using HCM value
- All operations are idempotent

---

## Testing Strategy

### Unit Tests
- Balance validation logic
- Request lifecycle rules
- Edge cases (overdraw, invalid employee)

### Integration Tests
- HCM mock API communication
- Sync correctness

### E2E Tests
- Full request → approve/reject flow
- Batch sync correctness
- Balance consistency validation

---

## How to Run

```bash
npm install
npm run start