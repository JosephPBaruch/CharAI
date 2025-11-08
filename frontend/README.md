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

# Add required packages
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-router-dom @types/react-router-dom
npm install axios @types/axios
```

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

After initialization, your project structure should look like:

```
charai-frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Route-level components
│   ├── api/           # API client setup
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Root component
│   └── main.tsx       # Entry point
├── public/            # Static assets
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

---

## Environment Variables

Create a `.env` file in the project root:

```bash
# .env
VITE_API_URL=http://localhost:8000/api  # Django backend URL
VITE_AUTH_ENABLED=true                  # Enable/disable auth features
VITE_MAP_TILE_KEY=your-key-here        # If using map services
```

> 📝 Add `.env` to your `.gitignore` to keep secrets out of version control.
> Note: Only variables prefixed with VITE_ are exposed to your application

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

- Package manager: `npm` (or `yarn`)
- Development server: [http://localhost:5173](http://localhost:5173)
- Project root: `src/`
- Main commands:
  - `npm run dev` — start development server
  - `npm run build` — build for production and type check
  - `npm run preview` — preview production build
  - `npm run lint` — lint codebase
- Configuration:
  - TypeScript: `tsconfig.json`
  - Vite: `vite.config.ts`
  - Environment: `.env`

---

**Happy hacking on the CharAI frontend! 🚀**