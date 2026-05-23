# Concerns and Risks

## Environment configuration gaps
- `DB_PASSWORD` has no default and is required at runtime.
  - `splititup-backend/src/main/resources/application.yml`.
- `JWT_SECRET` has no default and prevents app startup if missing.
  - `splititup-backend/src/main/resources/application.yml`.

## App state coupling
- App state uses only the first group and first expense found for dashboard detail sections.
  - `splititup-backend/src/main/java/com/splititup/backend/app/service/AppStateService.java`.
  - This can cause mismatches between selected UI context and server response.

## Split method limitations
- Expense split type is stored as `SplitType.EXACT` and only supports explicit amounts.
  - `splititup-backend/src/main/java/com/splititup/backend/app/service/AppCommandService.java`.
  - UI exposes equal and percentage splits in `splititup-frontend-v1/src/pages/AddExpensePage.tsx`.

## Notifications are derived only from settlements
- No notifications table or event log exists.
  - `splititup-backend/src/main/resources/db/migration/V2__init_expense_domain.sql`.
  - Notifications are derived from settlements in `AppStateService`.

## Export history is not tracked
- App state always returns an empty exports list.
  - `splititup-backend/src/main/java/com/splititup/backend/app/service/AppStateService.java`.
  - CSV/PDF export endpoints exist, but no history is stored.

## Cross-group settlements
- Settlement requests are not scoped to a group, which can mix contexts.
  - `splititup-backend/src/main/resources/db/migration/V2__init_expense_domain.sql`.

## Repo structure ambiguity
- `splititup-ui/` and `splititup-web/` appear unused by the primary app.
- `stitch/` contains design artifacts but no build integration.

## Testing coverage
- Backend tests are limited to a context load test.
- No frontend automated tests detected.
