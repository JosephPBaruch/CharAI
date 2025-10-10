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

The trained model must achieve at least 90% accuracy on the validation dataset. This metric ensures that the model performs reliably and provides accurate predictions within the target domain.