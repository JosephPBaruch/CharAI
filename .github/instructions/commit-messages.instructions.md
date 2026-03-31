---
applyTo: "**"
---

# Commit Message Conventions

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format for all commit messages.

## Format

```
<type>(<scope>): <short summary>

<optional body>

<optional footer>
```

## Types

| Type       | When to use                                          |
| ---------- | ---------------------------------------------------- |
| `feat`     | New feature or user-facing functionality             |
| `fix`      | Bug fix                                              |
| `docs`     | Documentation only (README, comments, logbooks)      |
| `style`    | Formatting, whitespace, semicolons (no logic change) |
| `refactor` | Code restructuring without changing behavior         |
| `test`     | Adding or updating tests                             |
| `chore`    | Build scripts, CI, dependencies, tooling             |
| `perf`     | Performance improvement                              |

## Scopes

Use the area of the codebase affected:

- `backend` — Django app, modules, config
- `frontend` — React app, components, pages
- `docs` — Documentation directory
- `db` — Database scripts or migrations
- `ci` — GitHub Actions workflows
- `deps` — Dependency updates
- Specific module names are fine too: `calculator`, `geoparser`, `auth`, `map`

## Rules

1. **Subject line**: Imperative mood, lowercase, no period, max 72 characters.
   - Good: `feat(frontend): add file upload for field boundaries`
   - Bad: `Added file upload for field boundaries.`
2. **Body** (optional): Wrap at 72 characters. Explain _what_ and _why_, not _how_.
3. **Footer** (optional): Reference issues with `Closes #123` or `Refs #456`.
4. **Breaking changes**: Add `BREAKING CHANGE:` in the footer or `!` after type/scope.
   - Example: `feat(backend)!: change field API response format`

## Examples

```
feat(backend): add prescription status polling endpoint

Adds GET /api/field/<id>/status/ so the frontend can poll for
prescription generation progress without fetching the full map.

Closes #42
```

```
fix(frontend): prevent map re-render on coordinate context update

Stabilize the dependency array in InteractiveFarmMap useEffect
to avoid unnecessary Leaflet map redraws.
```

```
docs(backend): update API endpoint table in README
```

```
test(frontend): add Playwright test for field creation flow
```

```
chore(deps): upgrade MUI to v7.1
```
