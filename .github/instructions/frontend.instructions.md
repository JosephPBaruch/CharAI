---
applyTo: "frontend/**"
---

# Frontend Instructions — React + TypeScript

## Stack

- **React 19**, TypeScript 5.9, Vite (rolldown-vite)
- **UI**: Material UI (MUI) 7
- **Maps**: Leaflet + react-leaflet, MapLibre GL
- **Routing**: react-router v7
- **Geospatial**: @turf/turf for client-side geometry operations

## Directory Structure

```
frontend/src/
├── main.tsx              # App entry, wraps providers
├── index.css             # Global styles
├── api/
│   └── fetch.ts          # API call functions (POSTFieldData, GETPrescriptionMap, etc.)
├── components/
│   ├── AppRoutes.tsx      # Route definitions
│   ├── Header.tsx         # App header/nav
│   ├── FormTextField.tsx  # Reusable form input
│   └── LoadingProgress.tsx
├── contexts/
│   ├── AuthContext.tsx     # Auth state provider (token-based)
│   ├── CoordinateContext.tsx # Shared coordinate state
│   └── ToastContext.tsx   # Notification toasts
├── features/              # Feature-based module organization
│   ├── auth/              # ProtectedRoute, PublicRoute
│   ├── farm/              # Field forms, file upload, budget settings
│   ├── map/               # InteractiveFarmMap (Leaflet)
│   ├── prescriptions/     # Prescription map viewer, stats, legends
│   └── index.ts           # Barrel exports
├── pages/                 # Route-level page components
│   ├── LandingPage.tsx    # Unauthenticated landing
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── HomePage.tsx       # Authenticated dashboard
│   ├── FieldPage.tsx      # Field detail/management
│   └── PrescriptionsPage.tsx
├── services/              # Business logic helpers
│   ├── authService.ts     # Token management, API calls
│   ├── coordinateService.ts
│   └── fileUploadService.ts
├── types/                 # TypeScript type definitions
│   ├── auth.ts
│   ├── fetch.ts
│   ├── fileUpload.ts
│   └── maplibre/          # MapLibre type overrides
└── utils/                 # Shared utility functions
```

## Conventions

- **Feature-based organization**: Group related components, hooks, and types under `features/<name>/` with barrel `index.ts` exports.
- **Pages are thin**: Page components compose feature components and handle routing concerns. Business logic stays in features/services/contexts.
- **Context for global state**: Use React Context (`AuthContext`, `CoordinateContext`, `ToastContext`) — no Redux or external state library.
- **API layer**: All backend calls go through `src/api/fetch.ts` using native `fetch()`. Auth tokens are attached via `Authorization: Token <token>` header.
- **TypeScript strict mode**: All types defined in `src/types/`. Use proper interfaces, avoid `any`.
- **Component naming**: PascalCase filenames matching the exported component name.
- **MUI theming**: Use MUI components and `@emotion/styled` for styling. Avoid raw CSS where MUI handles it.
- **Map patterns**: Leaflet components can race with async data — use explicit `isMapReady` state and stable input dependencies in effects.
- **`data-testid` attributes**: Add `data-testid` to all new interactive elements. Playwright E2E tests depend on these for selectors.

## Routes

| Path      | Auth      | Component              |
| --------- | --------- | ---------------------- |
| `/`       | Adaptive  | HomePage / LandingPage |
| `/login`  | Public    | LoginPage              |
| `/signup` | Public    | SignupPage             |
| `/fields` | Protected | FieldPage              |

## Testing

- E2E tests use Playwright in `frontend/tests/`.
- Selectors use `data-testid` attributes (e.g., `[data-testid="login-button"]`).
- Run with: `cd frontend/tests && npx playwright test`
- **Always update tests**: When changing form inputs, `data-testid` values, API payload shapes, routes, or UI flow, update the Playwright tests in the same changeset. Run `npx playwright test` to confirm they pass before finishing.

## Helpful Commands

```bash
# Install dependencies
cd frontend && npm install

# Start dev server
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Run E2E tests (headless)
cd tests && npx playwright test

# Run E2E tests (headed, for debugging)
cd tests && HEADLESS=false npx playwright test

# Build for production
npm run build
```
