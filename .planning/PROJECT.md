# SplitItUp

## What This Is

SplitItUp is a full-stack expense sharing app for small groups and 1:1 splits. Users can record expenses, split costs, and settle up, with a strong focus on correctness and consistency across profiles.

## Core Value

Always-correct balances and settlement status across users and screens.

## Requirements

### Validated

- ✓ Email/password signup and login with JWT sessions — existing
- ✓ Create groups and manage members (owner add/remove) — existing
- ✓ Create, update, and delete expenses with explicit split amounts — existing
- ✓ Create settlement requests and update status (pending/accepted/rejected) — existing
- ✓ CSV/PDF export for expenses — existing

### Active

- [ ] Settlements stay consistent across both users (create, accept, self-settle) without mismatched status
- [ ] Support both group-scoped settlements and 1:1 global settlements
- [ ] Add-payment flows are consistent across entry points (dashboard, group, 1:1)
- [ ] Group balances and ledgers remain consistent after settlements
- [ ] Notifications reflect settlement changes and stay in sync with settlement status
- [ ] PRD feature completion beyond core MVP (split methods, analytics, exports, notifications)

### Out of Scope

- Real money handling or payment processing — out of scope by design
- Multi-currency support — single-currency (INR)
- Mobile native apps — web-first

## Context

- Brownfield codebase: Spring Boot backend + React frontend already exist.
- Users report inconsistencies in settlement sync, groups, and add-payment UX.
- Priority is stability first, then finishing remaining PRD features.

## Constraints

- **Tech stack**: Java 23 + Spring Boot 3.4, PostgreSQL, React 19 + Vite + TypeScript
- **Consistency**: Cross-user settlement status and balances must be correct after any action
- **UX**: Multiple entry points for payments allowed, but behavior must be identical
- **Scope**: No real-money transfers, no multi-currency

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Stabilize inconsistencies before adding new features | Bugs are blocking confidence | — Pending |
| Settlements can be group-scoped and 1:1 global | Reflect both group and direct scenarios | — Pending |
| Self-settle is allowed | Users can mark settled without recipient action | — Pending |
| Auto-refresh after settlement actions | Ensure sync across profiles | — Pending |
| Multiple entry points for payments but consistent behavior | UX clarity without removing entry points | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-30 after initialization*
