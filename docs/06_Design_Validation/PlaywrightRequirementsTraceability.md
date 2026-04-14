# Playwright Requirements Traceability DVP&R

## Purpose

This Design Verification Plan and Report (DVP&R) links the product
requirements in `docs/01_Problem_Definition/Requirements.md` to the
behavior scenarios in `docs/01_Problem_Definition/CharAI.feature` and
the executable Playwright coverage in `frontend/tests/charai.spec.ts`.

## Referenced Files

- Requirements: `docs/01_Problem_Definition/Requirements.md`
- Primary behavior scenarios: `docs/01_Problem_Definition/CharAI.feature`
- Playwright-side scenario mirror: `frontend/tests/CharAI.feature`
- Executable Playwright tests: `frontend/tests/charai.spec.ts`
- Playwright configuration: `frontend/tests/playwright.config.ts`
- Playwright usage notes: `frontend/tests/README.md`
- CI workflow: `.github/workflows/ci.yaml`

## Validation Approach

1. `docs/01_Problem_Definition/Requirements.md` defines the user-facing
   and system-level requirements.
2. `docs/01_Problem_Definition/CharAI.feature` translates those
   requirements into user-observable scenarios.
3. `frontend/tests/charai.spec.ts` implements automated end-to-end
   Playwright tests under `test.describe("CharAI.feature")` so the test
   report remains aligned with the documented scenarios.
4. The Playwright suite runs against the deployed application surface in
   CI, validating the application as a black-box system.

## Requirements-to-Test Traceability Matrix

| Requirement / intent | Source requirement | Related scenario(s) | Playwright evidence | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Users can create authenticated access to the system. | `docs/01_Problem_Definition/Requirements.md` (`## System Requirements` -> `### Accessibility`) | `User creates an account`; `User signs in` | `frontend/tests/charai.spec.ts`: `User creates an account` (line 74), `User logs in` (line 92), `User logs out` (line 82) | Covered | Confirms account creation, sign-in, and sign-out flows required for authenticated access. |
| Users can manually enter land coordinates in the system and see them handled through the interactive field workflow. | `docs/01_Problem_Definition/Requirements.md` (`## Functional Requirements` -> `### User-Facing Input/Output`) | `Manually enter coordinates`; `User requests prescription maps` | `frontend/tests/charai.spec.ts`: `User creates field and views prescription map` (line 104) | Covered | The test opens manual coordinate entry, adds markers, saves boundaries, submits the request, and proceeds to map retrieval. |
| Users can obtain a biochar prescription map from submitted field data. | `docs/01_Problem_Definition/Requirements.md` (`## Functional Requirements` -> `### User-Facing Input/Output`) | `User requests prescription maps` | `frontend/tests/charai.spec.ts`: `User creates field and views prescription map` (line 104); `Field appears in table automatically after submission` (line 311) | Covered | Confirms a submitted field is created, reaches `Complete`, and can be opened with `Get Map`. |
| Prescription-map output exposes ROI-oriented map data rather than only raw form submission success. | `docs/01_Problem_Definition/Requirements.md` (`## Functional Requirements` -> `### User-Facing Input/Output`) | `User requests prescription maps`; `Export prescription maps` | `frontend/tests/charai.spec.ts`: `User creates field and views prescription map` (line 104) | Covered | The test validates `Analysis Summary`, `Total Grid Cells`, and exported GeoJSON grid cells containing a `paybackPeriod` property, which is the ROI-oriented field used by the product. |
| Users can export prescription-map results. | `docs/01_Problem_Definition/Requirements.md` (`## Functional Requirements` -> `### User-Facing Input/Output`) | `Export prescription maps` | `frontend/tests/charai.spec.ts`: `User creates field and views prescription map` (line 104) | Covered | Verifies download of a JSON file and parses the downloaded content. |
| Users can provide land area by uploading a file. | `docs/01_Problem_Definition/Requirements.md` (`## Functional Requirements` -> `### User-Facing Input/Output`) | `User enters land area using an uploaded file` | No current Playwright spec in `frontend/tests/charai.spec.ts` | Gap | The behavior is documented in both feature files, but there is not yet an executable Playwright test covering the upload path. |
| A signed-in user can access previous prescription-map data. | `docs/01_Problem_Definition/CharAI.feature` only | `User signs in` | No current Playwright assertion specifically proving retrieval of a previously created map after a new sign-in session | Gap | Authentication is covered, but this scenario detail is not yet explicitly automated. |
| The system supports multiple users concurrently. | `docs/01_Problem_Definition/CharAI.feature` only | `System supports multiple users` | No current Playwright spec in `frontend/tests/charai.spec.ts` | Gap | This scenario is documented but not yet represented as a Playwright test. |
| The system anonymizes user data and does not train on-system. | `docs/01_Problem_Definition/CharAI.feature` only | `System anonymizes user data` | No current Playwright spec in `frontend/tests/charai.spec.ts` | Gap / non-UI validation needed | This is primarily a backend/data-handling requirement and is not directly observable through the current browser tests. |

## Supplemental Playwright Regression Coverage

The Playwright suite also contains additional regression tests that are
useful for requirement confidence even though they are not called out as
standalone requirements in `Requirements.md`:

- `Crop type dropdown contains all valid options` (line 249)
- `User can select a crop type and it persists in the form` (line 288)
- `User can view profile information` (line 398)
- `User can change password` (line 420)
- `User can delete account` (line 454)

These tests strengthen confidence in the authenticated workflow around
field creation and account lifecycle management.

## CI Execution and Reporting

The Playwright suite is executed automatically by
`.github/workflows/ci.yaml`:

1. Docker images are built and the application stack is started with
   `docker compose up -d --wait`.
2. Django migrations are applied with
   `docker exec django-backend python manage.py migrate`.
3. Node.js 18 is installed for the Playwright test workspace.
4. The workflow caches Playwright browsers using the version declared in
   `frontend/tests/package.json`.
5. Test dependencies are installed with `npm ci` in `frontend/tests`.
6. The suite runs from `frontend/tests` with
   `BASE_URL=http://localhost npm run test:report`.

### Result Location

- The `test:report` script in `frontend/tests/package.json` runs
  `playwright test --reporter=html`.
- The HTML report is generated at
  `frontend/tests/playwright-report/`.
- CI uploads that directory as the GitHub Actions artifact named
  `playwright-report`.
- The map-generation test also attaches a screenshot to the Playwright
  HTML report with `test.info().attach(...)`, so visual evidence is
  preserved with the test result.

### Coverage Tracking

This repository currently tracks Playwright validation coverage through
this DVP&R matrix plus the pass/fail evidence in the uploaded HTML
report. A code-coverage percentage for Playwright is not currently
published in CI. If automated coverage metrics are added later, this
section should be updated with the new report path and workflow step.

## Maintenance Notes

- If any of these paths change, update this document:
  - `docs/01_Problem_Definition/Requirements.md`
  - `docs/01_Problem_Definition/CharAI.feature`
  - `frontend/tests/CharAI.feature`
  - `frontend/tests/charai.spec.ts`
  - `.github/workflows/ci.yaml`
- Keep the scenario names in `frontend/tests/charai.spec.ts` aligned
  with the documented feature names wherever practical.
- When a documented scenario is added to Playwright, update the matrix
  from `Gap` to `Covered` and record the exact spec name.
- If reporting changes from the HTML reporter to another format, update
  the CI execution and result-location sections above.
