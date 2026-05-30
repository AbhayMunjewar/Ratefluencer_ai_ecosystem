# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: No code may be written until this spec is marked `FINALIZED`.

## Vision

To build a modular, production-ready FastAPI backend for the **Ratefluencer AI Influencer Intelligence Engine**. The backend will serve as the mathematical and analytical brain of the ecosystem, computing influencer authenticity, audience growth projections, brand compatibility, and campaign success probabilities. By mirroring the existing frontend data formats and utilizing decoupled repository/service design patterns, the backend will run immediately with mock JSON storage, allowing seamless transition to relational databases like PostgreSQL in the future.

## Goals

1. **Establish a Robust Modular Architecture** — Decouple FastAPI endpoints, service logic, repository queries, and Pydantic schemas.
2. **Implement Intelligence scoring APIs** — Construct fully-typed and verified endpoints for `/dashboard`, `/authenticity/analyze`, `/growth/predict`, `/brand-match`, `/campaign-success`, and `/ratefluencer`.
3. **Mirror Frontend Data Integrity** — Serve datasets structurally aligned with existing frontend files, facilitating instant hookup and synchronization.
4. **Ensure Production-Quality Error Handling & API Docs** — Enable comprehensive Swagger/OpenAPI documentation and robust exception handling.

## Non-Goals (Out of Scope)

- **Real PostgreSQL Integration (for now)** — The repository layer must mock databases using local JSON storage, though it must be engineered for future DB migration.
- **Third-Party API Integrations** — No active external connections (e.g. Instagram/TikTok Graph API, OpenAI API). Calculations will run locally using deterministic algorithmic models.
- **Frontend Integration Execution** — Staging the files on the frontend to talk to this backend will be handled in a separate phase; this phase is strictly for the backend service delivery.

## Constraints

- **Language & Framework**: Python 3.10+, FastAPI, and Pydantic.
- **Access Points**: Port `8000` with CORS enabled for `localhost:3000` and `localhost:5173`.
- **Modularity**: Services can only query data through the Repository layer to maintain the PostgreSQL-readiness guarantee.

## Success Criteria

- [ ] FastAPI backend executes without runtime errors and exposes all 6 required endpoints.
- [ ] Service layer successfully computes all metrics using specified mathematical formulas.
- [ ] Repositories dynamically read from, write to, and parse mock JSON files from `backend/data/`.
- [ ] Pydantic schemas validate all incoming payloads and outgoing API responses with strict types.
- [ ] Swagger documentation runs at `http://localhost:8000/docs` mapping schemas and response codes.

## Technical Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Modular directory structure | Must-have | `backend/main.py`, `backend/routes/`, `backend/services/`, `backend/repositories/`, `backend/models/`, `backend/data/` |
| Ratefluencer mathematical formulas | Must-have | 35% Authenticity, 25% Growth, 25% Brand Match, 15% Campaign Success |
| CORS Configuration | Must-have | Enable standard CORS middleware for modern React bundlers |
| Mock JSON data storage | Must-have | Copy and adapt `influencers.json`, `brands.json`, `campaigns.json`, `activityFeed.json` |

---

*Last updated: 2026-05-30*
