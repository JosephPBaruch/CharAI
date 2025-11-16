# CharAI Frontend Setup

This guide outlines how to initialize and manage the CharAI frontend using **Vite**, **React**, **TypeScript**, and **Material UI**.

---

## Recreate Project from `package.json`

```bash
# Install dependencies
npm install
# or if using yarn
yarn install

# Start development server
npm run dev
```

Visit the local server at: [http://localhost:5173](http://localhost:5173)

---

## Initialization (New Project)

```bash
# Create new Vite project with React and TypeScript
npm create vite@latest charai-frontend -- --template react-ts

# Navigate to project directory
cd charai-frontend

# Install core dependencies
npm install   # Windows/Linux/macOS: same command

## Add required packages
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-router-dom @types/react-router-dom
```

Note: `axios` is not currently used; HTTP requests use the native `fetch` API.

---

## Development Server

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit development server at: [http://localhost:5173](http://localhost:5173)
Visit preview server at: [http://localhost:4173](http://localhost:4173)

---

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components (Header, ProtectedRoute, PublicRoute, AppRoutes)
│   ├── pages/            # Route-level components (LoginPage, SignupPage, HomePage, App)
│   ├── services/         # API client and auth service (authService.ts)
│   ├── contexts/         # React context for state management (AuthContext)
│   ├── types/            # TypeScript type definitions (auth.ts)
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── README.md             # This file
```

---

## Environment Variables

Create a `.env` file in the project root:

```bash
# .env
VITE_API_URL=http://127.0.0.1:8000/api  # Django backend API URL (default)
```

> 📝 Add `.env` to your `.gitignore` to keep secrets out of version control.
> Note: Only variables prefixed with VITE_ are exposed to your application

---

## Authentication

The frontend integrates with Django REST Framework using **TokenAuthentication** and **SessionAuthentication**:

- **Token Storage**: Auth tokens are stored in `localStorage` under the key `authToken`
- **Session Support**: Requests include `credentials: 'include'` to support session-based auth
- **Protected Routes**: Routes are guarded by `ProtectedRoute` and `PublicRoute` components
- **Auth Context**: Centralized auth state via `AuthContext` (provides `login`, `register`, `logout`, `checkAuth`, `isAuthenticated`, `user`, `isLoading`)
- **Error Handling**: Errors from auth attempts are logged to console only; no UI error messages are displayed

### Authentication Flow

1. User submits login/signup form
2. Frontend calls `authService.login()` or `authService.register()`
3. Backend validates and returns token (+ user data)
4. Frontend stores token locally
5. Subsequent requests include `Authorization: Token <token>` header
6. On logout, token is cleared and user is redirected to login

### Key Files

- `src/services/authService.ts` — API calls and token management
- `src/contexts/AuthContext.tsx` — Auth state and methods
- `src/types/auth.ts` — TypeScript types for auth
- `src/components/ProtectedRoute.tsx` — Guards authenticated pages
- `src/components/PublicRoute.tsx` — Prevents logged-in users from seeing login/signup
- `src/pages/LoginPage.tsx` — Login form
- `src/pages/SignupPage.tsx` — Registration form
- `src/pages/HomePage.tsx` — Protected home page (shown only to authenticated users)

---

## TypeScript Compilation & Linting

```bash
# Type check and build
npm run build

# Lint the codebase
npm run lint
```

The following scripts are available in `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

---

## Freeze Dependencies

To capture current dependencies for other developers:

```bash
# Create package.json.lock (npm)
npm install

# or yarn.lock (yarn)
yarn install
```

Commit both `package.json` and the lock file to version control.

---

## Summary

- **Package manager**: `npm` (or `yarn`)
- **Development server**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api) (Django)
- **Framework**: React 18+ with TypeScript
- **UI Library**: Material UI (MUI)
- **Routing**: React Router v6
- **Auth**: TokenAuthentication + SessionAuthentication (Django DRF)
- **Project root**: `src/`
- **Main commands**:
  - `npm run dev` — start development server
  - `npm run build` — build for production and type check
  - `npm run preview` — preview production build
  - `npm run lint` — lint codebase
- **Configuration**:
  - TypeScript: `tsconfig.json`
  - Vite: `vite.config.ts`
  - Environment: `.env`

---

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env  # (or create .env manually with VITE_API_URL)
   ```

3. **Ensure backend is running**:
   ```bash
   # In the backend directory
   python manage.py runserver
   ```

4. **Start the dev server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   - Navigate to [http://localhost:5173](http://localhost:5173)
   - Sign up or log in to see the protected home page

---

**Happy hacking on the CharAI frontend! 🚀**