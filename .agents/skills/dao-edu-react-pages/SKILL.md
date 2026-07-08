---
name: dao-edu-react-pages
description: Implement typed React 19 pages and routes in the DAO EDU frontend. Use when adding role-based screens, page components, layouts, routing, local state, loading flows, or refactoring large pages in FE-Dao-EDU.
---

# DAO EDU React Pages

## Follow The Existing Application

- Keep pages under the matching `src/pages/<role-or-feature>` area.
- Reuse `DashboardLayout`, authentication context, theme context, and route guards.
- Update the existing route structure rather than introducing a second router pattern.
- Use TypeScript types for component props, form values, API data, and table records.

## Implement A Page

1. Read a nearby page serving the same user role.
2. Identify route, permissions, data requirements, and user states.
3. Keep remote access in service functions rather than scattering request details through JSX.
4. Separate reusable or complex sections when that improves readability.
5. Handle initial loading, refetching, empty data, failures, and user feedback.
6. Add the route and navigation entry only where the user's role should see it.

## React Practices

- Derive values during render when possible instead of synchronizing duplicate state.
- Use effects only for external synchronization and clean them up when needed.
- Keep async event handlers explicit and prevent duplicate submissions.
- Use stable keys and avoid index keys for mutable lists.
- Prefer small typed helpers over `any` or repeated inline transformations.
- Preserve URL-driven state when filters or selected records should survive navigation.

## Verification

- Run `npm run build` after TypeScript or route changes.
- Run `npm run lint` when edits touch hooks, component structure, or shared code.
- Open the affected route and verify both desktop and narrow layouts after significant UI changes.

## Coding Standards

- **Tiêu chuẩn code**: Một file code nguồn không được vượt quá 500 dòng.

