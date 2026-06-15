---
name: dao-edu-antd
description: Build and refine DAO EDU interfaces with Ant Design 6. Use when creating forms, tables, modals, cards, navigation, feedback states, responsive layouts, themes, or visual consistency in the FE-Dao-EDU React application.
---

# DAO EDU Ant Design

## Reuse The Design System

- Use Ant Design components before creating custom equivalents.
- Follow the existing `ThemeContext` and root `ConfigProvider`.
- Use theme tokens and existing CSS variables instead of hard-coded duplicate colors.
- Preserve dark and light theme behavior.
- Reuse page spacing, card, typography, and table patterns from nearby screens.

## Build Screens

- Use `Form` validation rules for user input and submit through `onFinish`.
- Use `Table` with typed columns, stable row keys, loading state, and pagination where needed.
- Use `Modal` or `Drawer` for focused workflows; reset form state when closing.
- Use `App.useApp()` for message, notification, and modal APIs inside the configured application context.
- Include loading, empty, error, disabled, and success states.
- Keep destructive actions behind `Popconfirm` or an explicit confirmation modal.

## Responsive And Accessible UI

- Compose layouts with `Row`, `Col`, `Space`, and responsive breakpoints.
- Add clear labels, button intent, keyboard-safe interactions, and meaningful empty text.
- Avoid wide desktop-only tables when cards, responsive columns, or scroll configuration are more usable.
- Keep Vietnamese user-facing copy concise and consistent with surrounding pages.

## Guardrails

- Do not add another UI library for a component Ant Design already provides.
- Do not create per-page `ConfigProvider` overrides unless the page genuinely requires an isolated theme.
- Do not mix static `message` calls with context-based feedback when `App.useApp()` is available.
- Avoid broad global CSS changes for a single component.
