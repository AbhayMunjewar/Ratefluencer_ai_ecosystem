---
milestone: v1.0 - Backend Implementation
updated: 2026-05-30T15:50:00+05:30
---

# Requirements

## Overview

Requirements derived from SPEC.md for traceability and coverage tracking.

---

## Functional Requirements

| ID | Requirement | Source | Phase | Status |
|----|-------------|--------|-------|--------|
| REQ-01 | Create modular backend folder structure including `routes/`, `services/`, `repositories/`, `models/`, and `data/`. | SPEC Goal 1 | 1 | Pending |
| REQ-02 | Setup mock JSON data stores mirroring frontend schemas exactly (`influencers.json`, `brands.json`, `campaigns.json`, `activityFeed.json`). | SPEC Goal 3 | 1 | Pending |
| REQ-03 | Build Pydantic request and response schemas for all 6 API endpoints. | SPEC Goal 4 | 2 | Pending |
| REQ-04 | Implement decoupled Repository classes reading mock JSON data, enabling future PostgreSQL swap. | SPEC Goal 1 | 2 | Pending |
| REQ-05 | Implement mathematical formulas inside Service classes for Authenticity, Growth, Brand Match, Campaign Success, and master Ratefluencer score calculations. | SPEC Goal 2 | 3 | Pending |
| REQ-06 | Implement FastAPI routes for all 6 endpoints exposing required behaviors and payload validations. | SPEC Goal 2 | 4 | Pending |
| REQ-07 | Enable CORS supporting both `localhost:3000` and `localhost:5173`. | SPEC Goal 4 | 1 | Pending |
| REQ-08 | Integrate Swagger UI documentation for schemas and response classes. | SPEC Goal 4 | 4 | Pending |
| REQ-09 | Establish global and route-specific HTTP exception handling. | SPEC Goal 4 | 4 | Pending |

---

## Non-Functional Requirements

| ID | Requirement | Category | Phase | Status |
|----|-------------|----------|-------|--------|
| NFR-01 | Low Response Latency (< 100ms for computed scores) | Performance | 3 | Pending |
| NFR-02 | Mathematical Consistency (calculates reproducible, normalized 0-100 scores) | Integrity | 3 | Pending |
| NFR-03 | Strict Schema Validation (returns 422 on bad inputs) | Security | 2 | Pending |

---

## Constraints

| ID | Constraint | Source | Impact |
|----|------------|--------|--------|
| CON-01 | Python 3.10+ | Technical | Target Python environment compatibility |
| CON-02 | Strict Repository Decoupling | Architectural | Services must never access raw JSON; must use Repository methods |
| CON-03 | Fixed Mathematical Weights | SPEC | Weighted calculations for final Ratefluencer score and modules must match specifications exactly |

---

## Traceability Matrix

| Requirement | Plans | Tests | Status |
|-------------|-------|-------|--------|
| REQ-01 | Phase 1 | Direct file structure audit | — |
| REQ-02 | Phase 1 | File read & parse validation | — |
| REQ-03 | Phase 2 | Pydantic validation unit checks | — |
| REQ-04 | Phase 2 | Data fetch assertions | — |
| REQ-05 | Phase 3 | Mathematical formula validation | — |
| REQ-06 | Phase 4 | Route request/response assertions | — |
| REQ-07 | Phase 1 | Pre-flight CORS request assertions | — |
| REQ-08 | Phase 4 | Swagger endpoint check (`/docs`) | — |
| REQ-09 | Phase 4 | Edge case payload testing (404, 422) | — |

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| Pending | Not yet started |
| In Progress | Being implemented |
| Complete | Implemented and verified |
| Blocked | Cannot proceed |
| Deferred | Moved to later milestone |
