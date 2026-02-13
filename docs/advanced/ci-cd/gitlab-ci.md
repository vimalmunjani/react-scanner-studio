# GitLab CI

This guide covers how to integrate React Scanner Studio with GitLab CI/CD for automated component scanning and dashboard deployment.

## Basic Pipeline

Generate a component usage report on every push:

```yaml
# .gitlab-ci.yml
stages:
  - scan

variables:
  NODE_VERSION: '20'

component-scan:
  stage: scan
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npx react-scanner-studio scan
    - npx react-scanner-studio build
  artifacts:
    paths:
      - .react-scanner-studio/
    expire_in: 1 week
```

## Deploy to GitLab Pages

Automatically deploy the dashboard to GitLab Pages:

```yaml
# .gitlab-ci.yml
stages:
  - scan
  - deploy

variables:
  NODE_VERSION: '20'

component-scan:
  stage: scan
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npx react-scanner-studio scan
    - npx react-scanner-studio build
  artifacts:
    paths:
      - .react-scanner-studio/
    expire_in: 1 week

pages:
  stage: deploy
  image: alpine:latest
  script:
    - mkdir -p public
    - cp -r .react-scanner-studio/* public/
  artifacts:
    paths:
      - public
  only:
    - main
  needs:
    - component-scan
```

::: tip GitLab Pages
GitLab Pages requires the output to be in a `public/` directory. The `pages` job name is special and triggers GitLab Pages deployment.
:::

## Scan on Merge Requests

Run scans on merge requests to catch component usage changes:

```yaml
# .gitlab-ci.yml
stages:
  - scan

component-scan:
  stage: scan
  image: node:20
  script:
    - npm ci
    - npx react-scanner-studio scan
    - npx react-scanner-studio build
  artifacts:
    paths:
      - .react-scanner-studio/
    expire_in: 1 week
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

## Scheduled Reports

Generate weekly reports for tracking component usage trends:

```yaml
# .gitlab-ci.yml
stages:
  - scan
  - archive

variables:
  NODE_VERSION: '20'

component-scan:
  stage: scan
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npx react-scanner-studio scan
    - npx react-scanner-studio build
  artifacts:
    paths:
      - .react-scanner-studio/
    expire_in: 90 days
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"

archive-report:
  stage: archive
  image: alpine:latest
  script:
    - DATE=$(date +%Y-%m-%d)
    - mkdir -p reports/$DATE
    - cp -r .react-scanner-studio/* reports/$DATE/
  artifacts:
    paths:
      - reports/
    expire_in: 90 days
  needs:
    - component-scan
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"
```

To set up a schedule:

1. Go to **CI/CD > Schedules** in your GitLab project
2. Click **New schedule**
3. Set the interval (e.g., `0 9 * * 1` for every Monday at 9 AM)
4. Save the schedule

## Run Only on Relevant Changes

Optimize your pipeline to run only when relevant files change:

```yaml
component-scan:
  stage: scan
  image: node:20
  script:
    - npm ci
    - npx react-scanner-studio scan
    - npx react-scanner-studio build
  artifacts:
    paths:
      - .react-scanner-studio/
  rules:
    - changes:
        - src/**/*
        - package.json
        - package-lock.json
        - react-scanner.config.js
```

## Caching Dependencies

Speed up your pipeline by caching dependencies:

```yaml
component-scan:
  stage: scan
  image: node:20
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/
    policy: pull-push
  script:
    - npm ci
    - npx react-scanner-studio scan
    - npx react-scanner-studio build
  artifacts:
    paths:
      - .react-scanner-studio/
```

## Using npm vs Yarn

If your project uses Yarn:

```yaml
component-scan:
  stage: scan
  image: node:20
  cache:
    key:
      files:
        - yarn.lock
    paths:
      - node_modules/
      - .yarn/cache/
  script:
    - yarn install --frozen-lockfile
    - yarn react-scanner-studio scan
    - yarn react-scanner-studio build
  artifacts:
    paths:
      - .react-scanner-studio/
```

## Add Status Badge

Add a badge to your README to show the pipeline status:

```markdown
[![pipeline status](https://gitlab.com/your-group/your-project/badges/main/pipeline.svg)](https://gitlab.com/your-group/your-project/-/commits/main)
```

## Complete Example

Here's a complete pipeline configuration:

```yaml
# .gitlab-ci.yml
stages:
  - scan
  - deploy

variables:
  NODE_VERSION: '20'

default:
  image: node:${NODE_VERSION}
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/

# Run on merge requests and main branch
component-scan:
  stage: scan
  script:
    - npm ci
    - |
      if [ ! -f react-scanner.config.js ]; then
        echo "Configuration not found, exiting..."
        exit 1
      fi
    - npx react-scanner-studio scan
    - npx react-scanner-studio build
  artifacts:
    paths:
      - .react-scanner-studio/
    expire_in: 1 week
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
    - if: $CI_PIPELINE_SOURCE == "schedule"
    - changes:
        - src/**/*
        - package.json
        - react-scanner.config.js

# Deploy to GitLab Pages (main branch only)
pages:
  stage: deploy
  image: alpine:latest
  script:
    - mkdir -p public
    - cp -r .react-scanner-studio/* public/
  artifacts:
    paths:
      - public
  needs:
    - component-scan
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

## Environment Variables

GitLab CI provides several useful environment variables:

| Variable               | Description                         |
| ---------------------- | ----------------------------------- |
| `CI_COMMIT_BRANCH`     | The branch name                     |
| `CI_DEFAULT_BRANCH`    | The default branch (usually `main`) |
| `CI_PIPELINE_SOURCE`   | How the pipeline was triggered      |
| `CI_MERGE_REQUEST_IID` | Merge request ID                    |
| `CI_PROJECT_URL`       | URL of the project                  |

## See Also

- [CI/CD Overview](/advanced/ci-cd/) — General CI/CD information
- [GitHub Actions](/advanced/ci-cd/github-actions) — GitHub Actions configuration
- [CircleCI](/advanced/ci-cd/circleci) — CircleCI configuration
- [Azure Pipelines](/advanced/ci-cd/azure-pipelines) — Azure DevOps configuration
