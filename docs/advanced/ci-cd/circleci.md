# CircleCI

This guide covers how to integrate React Scanner Studio with CircleCI for automated component scanning and dashboard deployment.

## Basic Configuration

Generate a component usage report on every push:

```yaml
# .circleci/config.yml
version: 2.1

jobs:
  scan:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - restore_cache:
          keys:
            - npm-deps-{{ checksum "package-lock.json" }}
            - npm-deps-
      - run:
          name: Install dependencies
          command: npm ci
      - save_cache:
          key: npm-deps-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
      - run:
          name: Scan codebase
          command: npx react-scanner-studio scan
      - run:
          name: Build dashboard
          command: npx react-scanner-studio build
      - store_artifacts:
          path: .react-scanner-studio
          destination: dashboard

workflows:
  version: 2
  scan-and-build:
    jobs:
      - scan
```

## Using Orbs

Simplify your configuration with CircleCI orbs:

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5.2.0

jobs:
  scan:
    executor:
      name: node/default
      tag: '20.0'
    steps:
      - checkout
      - node/install-packages
      - run:
          name: Scan codebase
          command: npx react-scanner-studio scan
      - run:
          name: Build dashboard
          command: npx react-scanner-studio build
      - store_artifacts:
          path: .react-scanner-studio
          destination: dashboard

workflows:
  scan-and-build:
    jobs:
      - scan
```

## Deploy to Static Hosting

Deploy the dashboard to a static hosting service:

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5.2.0
  aws-s3: circleci/aws-s3@4.0.0

jobs:
  scan:
    executor:
      name: node/default
      tag: '20.0'
    steps:
      - checkout
      - node/install-packages
      - run:
          name: Scan codebase
          command: npx react-scanner-studio scan
      - run:
          name: Build dashboard
          command: npx react-scanner-studio build
      - persist_to_workspace:
          root: .
          paths:
            - .react-scanner-studio

  deploy:
    docker:
      - image: cimg/python:3.11
    steps:
      - attach_workspace:
          at: .
      - aws-s3/sync:
          from: .react-scanner-studio
          to: 's3://your-bucket-name'

workflows:
  scan-and-deploy:
    jobs:
      - scan
      - deploy:
          requires:
            - scan
          filters:
            branches:
              only: main
```

## Scheduled Reports

Generate weekly reports for tracking component usage trends:

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5.2.0

jobs:
  weekly-report:
    executor:
      name: node/default
      tag: '20.0'
    steps:
      - checkout
      - node/install-packages
      - run:
          name: Scan codebase
          command: npx react-scanner-studio scan
      - run:
          name: Build dashboard
          command: npx react-scanner-studio build
      - run:
          name: Archive report
          command: |
            DATE=$(date +%Y-%m-%d)
            mkdir -p reports/$DATE
            cp -r .react-scanner-studio/* reports/$DATE/
      - store_artifacts:
          path: reports
          destination: weekly-reports

workflows:
  weekly-scan:
    triggers:
      - schedule:
          cron: '0 9 * * 1' # Every Monday at 9 AM UTC
          filters:
            branches:
              only: main
    jobs:
      - weekly-report
```

## Run Only on Relevant Changes

Use path filtering to run scans only when relevant files change:

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5.2.0
  path-filtering: circleci/path-filtering@1.0.0

jobs:
  scan:
    executor:
      name: node/default
      tag: '20.0'
    steps:
      - checkout
      - node/install-packages
      - run:
          name: Scan codebase
          command: npx react-scanner-studio scan
      - run:
          name: Build dashboard
          command: npx react-scanner-studio build
      - store_artifacts:
          path: .react-scanner-studio
          destination: dashboard

workflows:
  scan-on-change:
    jobs:
      - path-filtering/filter:
          mapping: |
            src/.* run-scan true
            package.json run-scan true
            react-scanner.config.js run-scan true
          base-revision: main
      - scan:
          requires:
            - path-filtering/filter
```

## Using Workspaces

Share data between jobs using workspaces:

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5.2.0

jobs:
  install:
    executor:
      name: node/default
      tag: '20.0'
    steps:
      - checkout
      - node/install-packages
      - persist_to_workspace:
          root: .
          paths:
            - node_modules
            - package.json
            - package-lock.json
            - src
            - react-scanner.config.js

  scan:
    executor:
      name: node/default
      tag: '20.0'
    steps:
      - attach_workspace:
          at: .
      - run:
          name: Scan codebase
          command: npx react-scanner-studio scan
      - run:
          name: Build dashboard
          command: npx react-scanner-studio build
      - store_artifacts:
          path: .react-scanner-studio
          destination: dashboard
      - persist_to_workspace:
          root: .
          paths:
            - .react-scanner-studio

  deploy:
    docker:
      - image: cimg/base:stable
    steps:
      - attach_workspace:
          at: .
      - run:
          name: Deploy dashboard
          command: |
            echo "Deploying dashboard..."
            # Add your deployment commands here

workflows:
  build-scan-deploy:
    jobs:
      - install
      - scan:
          requires:
            - install
      - deploy:
          requires:
            - scan
          filters:
            branches:
              only: main
```

## Using Yarn

If your project uses Yarn:

```yaml
# .circleci/config.yml
version: 2.1

jobs:
  scan:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - restore_cache:
          keys:
            - yarn-deps-{{ checksum "yarn.lock" }}
            - yarn-deps-
      - run:
          name: Install dependencies
          command: yarn install --frozen-lockfile
      - save_cache:
          key: yarn-deps-{{ checksum "yarn.lock" }}
          paths:
            - node_modules
            - ~/.cache/yarn
      - run:
          name: Scan codebase
          command: yarn react-scanner-studio scan
      - run:
          name: Build dashboard
          command: yarn react-scanner-studio build
      - store_artifacts:
          path: .react-scanner-studio
          destination: dashboard

workflows:
  scan-and-build:
    jobs:
      - scan
```

## Add Status Badge

Add a badge to your README to show the build status:

```markdown
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/your-org/your-repo/tree/main.svg?style=svg)](https://dl.circleci.com/pipelines/github/your-org/your-repo)
```

## Complete Example

Here's a complete configuration with multiple features:

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5.2.0

executors:
  node-executor:
    docker:
      - image: cimg/node:20.0
    working_directory: ~/project

jobs:
  scan:
    executor: node-executor
    steps:
      - checkout
      - restore_cache:
          keys:
            - npm-deps-v1-{{ checksum "package-lock.json" }}
            - npm-deps-v1-
      - run:
          name: Install dependencies
          command: npm ci
      - save_cache:
          key: npm-deps-v1-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
      - run:
          name: Check configuration
          command: |
            if [ ! -f react-scanner.config.js ]; then
              echo "Configuration not found!"
              exit 1
            fi
      - run:
          name: Scan codebase
          command: npx react-scanner-studio scan
      - run:
          name: Build dashboard
          command: npx react-scanner-studio build
      - store_artifacts:
          path: .react-scanner-studio
          destination: dashboard
      - persist_to_workspace:
          root: .
          paths:
            - .react-scanner-studio

  deploy:
    executor: node-executor
    steps:
      - attach_workspace:
          at: .
      - run:
          name: Deploy to hosting
          command: |
            echo "Dashboard built successfully!"
            echo "Contents:"
            ls -la .react-scanner-studio/

workflows:
  version: 2

  # Run on every push
  scan-and-build:
    jobs:
      - scan
      - deploy:
          requires:
            - scan
          filters:
            branches:
              only: main

  # Weekly scheduled scan
  weekly-report:
    triggers:
      - schedule:
          cron: '0 9 * * 1'
          filters:
            branches:
              only: main
    jobs:
      - scan
```

## Environment Variables

Set environment variables in CircleCI project settings or in the config:

| Variable                  | Description            |
| ------------------------- | ---------------------- |
| `CIRCLE_BRANCH`           | The branch being built |
| `CIRCLE_SHA1`             | The commit SHA         |
| `CIRCLE_BUILD_NUM`        | The build number       |
| `CIRCLE_PROJECT_REPONAME` | The repository name    |

## See Also

- [CI/CD Overview](/advanced/ci-cd/) — General CI/CD information
- [GitHub Actions](/advanced/ci-cd/github-actions) — GitHub Actions configuration
- [GitLab CI](/advanced/ci-cd/gitlab-ci) — GitLab CI configuration
- [Azure Pipelines](/advanced/ci-cd/azure-pipelines) — Azure DevOps configuration
