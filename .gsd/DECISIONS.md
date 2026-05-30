# DECISIONS.md — Architecture Decision Records

> **Purpose**: Log significant technical decisions and their rationale.

## Decisions

### [ADR-001] Codebase Mapping & GSD Initialization

**Date**: 2026-05-30
**Status**: Accepted

#### Context
A brownfield Vite+React codebase exists for the Ratefluencer AI Ecosystem. We needed to install GSD to structured-plan and build features consistently, but planning requires system context.

#### Decision
We installed GSD in the workspace root and ran `/map` first to generate `ARCHITECTURE.md` and `STACK.md` before establishing `SPEC.md`.

#### Rationale
Mapping first avoids planning in the dark, prevents duplication of existing components (such as UI primitives or layouts), and helps align the new roadmap with existing architecture.

#### Consequences
- **Positive**: High fidelity context, accurate technology mapping, and clear understanding of mock data layers.
- **Negative**: Adds a few initial steps before starting requirements definition.

#### Alternatives Considered
- Skipping mapping and initializing directly (rejected as we would lack visibility into the 48 custom UI components and pages).

---

*Last updated: 2026-05-30*
