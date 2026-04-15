# Validation Plan

## Functional Requirements

### Virtual Tests

#### How

These tests will be automated into the Continuous Integration and Continuous Deployment (CI/CD) pipeline using GitHub Actions.

#### When

The virtual tests will run automatically during every build. This ensures that any regression or breaking change is detected early in the development cycle, before deployment or integration with other components. 

#### Tests

Our virtual testing strategy and acceptance criteria are written using Gherkin syntax, which provides human-readable behavior-driven development (BDD) test cases. These scenarios are defined in [CharAI.feature](/docs/01_Problem_Definition/CharAI.feature). This file will be directly used by a functional testing framework (Playwright).

### Physical Tests

#### How

These tests will be performed manually on a live instance of the application running in the cloud. 

#### When

Physical testing will occur after the project achieves full-stack integration. These tests will repeat periodically before the major milestones detailed in the project schedule.

#### Tests

Just like virtual tests, our manual validation plan is documented in Gherkin format in [CharAI.feature](/docs/01_Problem_Definition/CharAI.feature).

## Model Requirements

The trained regression model is validated using R² (coefficient of
determination) during every CI build. The training script
(`backend/YieldPredictionModel/CreateAndTrainYieldCalculatorModel.py`)
evaluates the model on a 20 % held-out test set and enforces a minimum
R² threshold of **0.2** (`MIN_R2_THRESHOLD`). If the model scores below
this threshold, the training script exits with a non-zero code, the
Docker image build fails, and the CI pipeline aborts.

The R² accuracy report is printed to the Docker build log on every run,
making the result visible in the GitHub Actions build output. See
`docs/06_Design_Validation/DVPR.md` for full details on the CI
enforcement mechanism and threshold history.
