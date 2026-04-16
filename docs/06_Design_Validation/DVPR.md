# DVP&R

## Purpose

This Design Verification Plan and Report (DVP&R) links the product
requirements in `docs/01_Problem_Definition/Requirements.md` to the
behavior scenarios in `docs/01_Problem_Definition/CharAI.feature`,
the executable Playwright coverage in `frontend/tests/charai.spec.ts`,
and the model accuracy gate enforced during the CI Docker build.

## Referenced Files

- Requirements: `docs/01_Problem_Definition/Requirements.md`
- Primary behavior scenarios: `docs/01_Problem_Definition/CharAI.feature`
- Playwright-side scenario mirror: `frontend/tests/CharAI.feature`
- Executable Playwright tests: `frontend/tests/charai.spec.ts`
- Playwright configuration: `frontend/tests/playwright.config.ts`
- Playwright usage notes: `frontend/tests/README.md`
- CI workflow: `.github/workflows/ci.yaml`
- Model training script: `backend/YieldPredictionModel/CreateAndTrainYieldCalculatorModel.py`
- Model accuracy documentation: `backend/YieldPredictionModel/README.md`
- Dockerfile (model build gate): `backend/Dockerfile`

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
5. The yield-prediction model is trained during the Docker image build.
   The training script enforces a minimum R² (coefficient of
   determination) threshold on the held-out test set. If the model does
   not meet the threshold the build fails, preventing deployment of an
   under-performing model.

## Requirements-to-Test Traceability Matrix

| Requirement / intent | Source requirement | Related scenario(s) | Playwright evidence | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Users can create authenticated access to the system. | `docs/01_Problem_Definition/Requirements.md` (`## System Requirements` -> `### Accessibility`) | `User creates an account`; `User signs in` | `frontend/tests/charai.spec.ts`: `User creates an account`, `User logs in`, `User logs out` | Covered | Confirms account creation, sign-in, and sign-out flows required for authenticated access. |
| Users can manually enter land coordinates in the system and see them handled through the interactive field workflow. | `docs/01_Problem_Definition/Requirements.md` (`## Functional Requirements` -> `### User-Facing Input/Output`) | `Manually enter coordinates`; `User requests prescription maps` | `frontend/tests/charai.spec.ts`: `User creates field and views prescription map` | Covered | The test opens manual coordinate entry, adds markers, saves boundaries, submits the request, and proceeds to map retrieval. |
| Users can obtain a biochar prescription map from submitted field data. | `docs/01_Problem_Definition/Requirements.md` (`## Functional Requirements` -> `### User-Facing Input/Output`) | `User requests prescription maps` | `frontend/tests/charai.spec.ts`: `User creates field and views prescription map`; `Field appears in table automatically after submission` | Covered | Confirms a submitted field is created, reaches `Complete`, and can be opened with `Get Map`. |
| Prescription-map output exposes ROI-oriented map data rather than only raw form submission success. | `docs/01_Problem_Definition/Requirements.md` (`## Functional Requirements` -> `### User-Facing Input/Output`) | `User requests prescription maps`; `Export prescription maps` | `frontend/tests/charai.spec.ts`: `User creates field and views prescription map` | Covered | The test validates `Analysis Summary`, `Total Grid Cells`, and exported GeoJSON grid cells containing a `paybackPeriod` property, which is the ROI-oriented field used by the product. |
| Users can export prescription-map results. | `docs/01_Problem_Definition/Requirements.md` (`## Functional Requirements` -> `### User-Facing Input/Output`) | `Export prescription maps` | `frontend/tests/charai.spec.ts`: `User creates field and views prescription map` | Covered | Verifies download of a JSON file and parses the downloaded content. |
| Users can provide land area by uploading a file. | `docs/01_Problem_Definition/Requirements.md` (`## Functional Requirements` -> `### User-Facing Input/Output`) | `User enters land area using an uploaded file` | No current Playwright spec in `frontend/tests/charai.spec.ts` | Gap | The behavior is documented in both feature files, but there is not yet an executable Playwright test covering the upload path. |
| A signed-in user can access previous prescription-map data. | `docs/01_Problem_Definition/CharAI.feature` only | `User signs in` | `frontend/tests/charai.spec.ts`: `User can access previous prescription maps after signing in` | Covered | Verifies a user can sign back in, see a previously created field, and reopen its prescription map. |
| The system supports multiple users concurrently. | `docs/01_Problem_Definition/CharAI.feature` only | `System supports multiple users` | `frontend/tests/charai.spec.ts`: `System supports multiple users` | Covered | Verifies two separate authenticated browser contexts can use the application at the same time and that field data stays scoped to the correct user. |
| The system anonymizes user data and does not train on-system. | `docs/01_Problem_Definition/CharAI.feature` only | `System anonymizes user data` | No current Playwright spec in `frontend/tests/charai.spec.ts` | Gap / non-UI validation needed | This is primarily a backend/data-handling requirement and is not directly observable through the current browser tests. |
| Yield-prediction model meets minimum accuracy. | `docs/01_Problem_Definition/Requirements.md` (`## Model Requirements`) | N/A -- validated during Docker build | CI build log: accuracy report printed by training script | Covered | The training script computes R² on a 20 % held-out test set and exits non-zero if R² < 0.2. See [Model R² Validation in CI](#model-r-validation-in-ci) below. |

## Model R² Validation in CI

The yield-prediction model is retrained from source data on every CI
build. An R² accuracy gate in the training script ensures the model
meets a minimum quality bar before the Docker image is produced.

### How It Works

1. `.github/workflows/ci.yaml` builds the backend Docker image using
   `docker/bake-action`. The build passes `CACHEBUST=${{ github.sha }}`
   to force a fresh training run on every push.
2. `backend/Dockerfile` runs
   `backend/YieldPredictionModel/CreateAndTrainYieldCalculatorModel.py`
   at build time. The script:
   - Loads and cleans the Cook Farm harvest data.
   - Splits the data 80/20 into training and test sets.
   - Trains a neural-network regression model using Keras.
   - Evaluates the model on the held-out test set and computes R².
3. The script compares the computed R² against `MIN_R2_THRESHOLD`
   (currently **0.2**, defined at the top of the training script).
4. If R² < 0.2 the script logs an `ERROR`-level message and exits with
   code 1, which causes the Docker build step to fail and the entire CI
   workflow to abort.
5. If R² >= 0.2 the model is saved to
   `YieldPredictionModel/Models/yield_model.keras` inside the image and
   the build continues.

### Accuracy Report

Every training run prints a structured accuracy report to the build
log:

```
--- Model Accuracy Report ---
  Test Loss (MSE) : <value>
  Test MAE        : <value>
  RMSE            : <value>
  R-squared (R2)  : <value>
  Min R2 Threshold: 0.2000
  Training rows   : <count>
  Test rows       : <count>
  Features        : Crop, elev_mean_m, slope_mean_deg, aspect_eastness, aspect_northness
--- End Accuracy Report ---
```

This report is visible in the GitHub Actions build log for every push.

### Threshold History

| Date       | Threshold | Reason                                     |
| ---------- | --------- | ------------------------------------------ |
| 2026-04-14 | 0.2       | Raised to enforce meaningful model quality |

### Key Files

| File | Role |
| --- | --- |
| `backend/YieldPredictionModel/CreateAndTrainYieldCalculatorModel.py` | Defines `MIN_R2_THRESHOLD` and enforces the gate |
| `backend/Dockerfile` | Runs the training script at build time |
| `.github/workflows/ci.yaml` | Triggers the Docker build with `CACHEBUST` |
| `docker-compose.yml` | Passes `CACHEBUST` build arg to the backend service |
| `backend/YieldPredictionModel/README.md` | Documents accuracy requirements and features |

## Supplemental Playwright Regression Coverage

The Playwright suite also contains additional regression tests that are
useful for requirement confidence even though they are not called out as
standalone requirements in `Requirements.md`:

- `Crop type dropdown contains all valid options`
- `User can select a crop type and it persists in the form`
- `User can view profile information`
- `User can change password`
- `User can delete account`

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
  - `backend/YieldPredictionModel/CreateAndTrainYieldCalculatorModel.py`
  - `backend/Dockerfile`
- Keep the scenario names in `frontend/tests/charai.spec.ts` aligned
  with the documented feature names wherever practical.
- When a documented scenario is added to Playwright, update the matrix
  from `Gap` to `Covered` and record the exact spec name.
- If reporting changes from the HTML reporter to another format, update
  the CI execution and result-location sections above.
- When `MIN_R2_THRESHOLD` is changed, update the threshold value in the
  [Model R² Validation in CI](#model-r-validation-in-ci) section and
  add a row to the Threshold History table.
