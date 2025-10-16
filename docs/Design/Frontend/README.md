# Frontend Design

This document summarizes the frontend design decisions for CharAI, lists the primary UX mocks / main application pages, the recommended tech stack, and contact/ownership information.

## Tech stack
- Framework: React (functional components + hooks)
<!-- - UI: CSS Modules or Tailwind CSS (choose based on preference — Tailwind is recommended for rapid prototyping)
- State management: React Context for light state; Redux or Zustand if state grows more complex
- Routing: react-router-dom
- Maps / geospatial: Leaflet + react-leaflet (or Mapbox GL JS if you need higher fidelity and vector tiles)
- File upload / dialogs: simple controlled components + react-dropzone for drag & drop
- Build / toolchain: Vite (recommended) or Create React App; TypeScript for type safety
- Testing: Jest + React Testing Library for unit and component tests
- Linting / formatting: ESLint + Prettier -->

## Main UX mocks / pages
The UX mockups live in `docs/Design/Frontend/UX Mocks` and are split between Public and Core App pages. Key pages to implement and prioritize:

- Public pages (no auth required)
  - Home / Landing page — project overview, call-to-action
  - About / FAQ — project information and help
  - Sign Up / Sign In / Forgot Password — authentication flows

- Core App (authenticated)
  - Dashboard — main entry after sign-in; quick summary and recent activity
  - Coordinate Entry / Upload — dialog or page to enter or upload coordinates (CSV/GeoJSON)
  - Maps / Results — map-based visualization of prescription map output with layer controls and legends
  - Settings / Account — profile, preferences, API keys or integrations
  - Export Map Modal — export or download map and data (GeoTIFF, GeoJSON, CSV)

## UX mock viewing notes
- Wireframes are provided in Draw.io XML format and can be opened with diagrams.net (https://app.diagrams.net/).
- Use the `UX Mocks/Core App Pages` and `UX Mocks/Public Pages` folders as the source of truth for layouts and flow.

## Owner / Contact
- Owner: Josh Norlin (username: `joshuanorlin`)
- Primary contact for frontend questions, design decisions, and UX clarifications.