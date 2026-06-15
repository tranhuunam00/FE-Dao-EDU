---
name: dao-edu-api-integration
description: Connect DAO EDU React screens to backend HTTP APIs through the shared Axios client. Use when adding service methods, request and response types, authentication-aware calls, uploads, pagination, error handling, or frontend-backend contract changes.
---

# DAO EDU API Integration

## Use The Shared Client

- Route authenticated requests through `src/services/api.ts`.
- Reuse its base URL, token attachment, refresh flow, and retry behavior.
- Do not create page-local Axios instances.
- Put endpoint calls in a relevant service module and expose typed functions to pages.
- Use direct Axios only when the shared client is intentionally unsuitable, such as its own refresh implementation.

## Model Contracts

- Define request and response types from the backend contract.
- Preserve backend field names at the service boundary and map them for presentation only when useful.
- Model optional and nullable values accurately.
- Keep pagination metadata and list items typed separately.
- Use `FormData` for uploads and let the browser set multipart boundaries.

## Handle Requests

- Disable duplicate mutations while a request is pending.
- Distinguish initial loading from background refresh and mutation state.
- Refresh affected data after successful mutations or update local state consistently.
- Detect Axios errors with `axios.isAxiosError`.
- Prefer the backend's safe message when present and use a clear Vietnamese fallback.
- Do not expose tokens, raw server traces, or sensitive payloads in UI messages.

## Contract Changes

1. Inspect the backend controller and DTO or Swagger contract.
2. Update the service types and method.
3. Update all affected callers.
4. Verify empty, success, validation-error, unauthorized, and server-error behavior.
5. Run `npm run build` to catch contract drift.
