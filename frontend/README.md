# CharAI Frontend Setup

This guide outlines how to initialize and manage the CharAI frontend using **Vite**, **React**, **TypeScript**, and **Material UI**.

---

## Recreate Environment from `package.json`

```bash
# Install dependencies
npm install
# or if using yarn
yarn
```

---

## Initialization

```bash
# Start the development server
npm run dev

# Build the production bundle
npm run build

# Preview the production build locally
npm run preview
```

---

## Environment Variables

Create a `.env` file in the project root (if needed for API keys, etc):

```bash
# .env
VITE_API_URL=http://localhost:8000/api
VITE_OTHER_KEY=change-me
```

> 📝 Add `.env` to your `.gitignore` to keep secrets out of version control.

---

## Linting & Formatting

```bash
# Lint the codebase
npm run lint

# Format code with Prettier
npm run format
```

---

## Testing

```bash
# Run unit and component tests
npm test
```

---

## Summary

- Package manager: `npm` (or `yarn`)
- Main commands:
  - `npm run dev` — start dev server
  - `npm run build` — build for production
  - `npm run preview` — preview production build
  - `npm run lint` — lint code
  - `npm test` — run tests
- Environment variables: `.env` in project root

---

**Happy hacking on the CharAI frontend! 🚀**
