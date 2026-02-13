# Azure Pipelines

This guide covers how to integrate React Scanner Studio with Azure Pipelines for automated component scanning and dashboard deployment.

## Basic Pipeline

Generate a component usage report on every push:

```yaml
# azure-pipelines.yml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: 'Install Node.js'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: npx react-scanner-studio scan
    displayName: 'Scan codebase'

  - script: npx react-scanner-studio build
    displayName: 'Build dashboard'

  - task: PublishBuildArtifacts@1
    inputs:
      pathToPublish: '.react-scanner-studio'
      artifactName: 'dashboard'
    displayName: 'Publish dashboard artifact'
```

## Multi-Stage Pipeline

Separate scanning and deployment into stages:

```yaml
# azure-pipelines.yml
trigger:
  - main

pr:
  - main

stages:
  - stage: Scan
    displayName: 'Scan Components'
    jobs:
      - job: ScanJob
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'
            displayName: 'Install Node.js'

          - task: Cache@2
            inputs:
              key: 'npm | "$(Agent.OS)" | package-lock.json'
              path: 'node_modules'
              restoreKeys: |
                npm | "$(Agent.OS)"
            displayName: 'Cache node_modules'

          - script: npm ci
            displayName: 'Install dependencies'

          - script: npx react-scanner-studio scan
            displayName: 'Scan codebase'

          - script: npx react-scanner-studio build
            displayName: 'Build dashboard'

          - publish: '.react-scanner-studio'
            artifact: 'dashboard'
            displayName: 'Publish dashboard artifact'

  - stage: Deploy
    displayName: 'Deploy Dashboard'
    dependsOn: Scan
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployDashboard
        pool:
          vmImage: 'ubuntu-latest'
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - download: current
                  artifact: 'dashboard'
                  displayName: 'Download dashboard artifact'

                - script: |
                    echo "Deploying dashboard..."
                    ls -la $(Pipeline.Workspace)/dashboard/
                  displayName: 'Deploy dashboard'
```

## Deploy to Azure Static Web Apps

Deploy the dashboard to Azure Static Web Apps:

```yaml
# azure-pipelines.yml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: 'Install Node.js'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: npx react-scanner-studio scan
    displayName: 'Scan codebase'

  - script: npx react-scanner-studio build
    displayName: 'Build dashboard'

  - task: AzureStaticWebApp@0
    inputs:
      app_location: '.react-scanner-studio'
      skip_app_build: true
      azure_static_web_apps_api_token: $(AZURE_STATIC_WEB_APPS_API_TOKEN)
    displayName: 'Deploy to Azure Static Web Apps'
```

## Deploy to Azure Blob Storage

Deploy the dashboard to Azure Blob Storage for static hosting:

```yaml
# azure-pipelines.yml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: 'Install Node.js'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: npx react-scanner-studio scan
    displayName: 'Scan codebase'

  - script: npx react-scanner-studio build
    displayName: 'Build dashboard'

  - task: AzureCLI@2
    inputs:
      azureSubscription: 'your-azure-subscription'
      scriptType: 'bash'
      scriptLocation: 'inlineScript'
      inlineScript: |
        az storage blob upload-batch \
          --account-name yourstorageaccount \
          --destination '$web' \
          --source '.react-scanner-studio' \
          --overwrite
    displayName: 'Deploy to Azure Blob Storage'
```

## Scheduled Reports

Generate weekly reports for tracking component usage trends:

```yaml
# azure-pipelines.yml
trigger: none

schedules:
  - cron: '0 9 * * 1' # Every Monday at 9 AM UTC
    displayName: 'Weekly Component Scan'
    branches:
      include:
        - main
    always: true

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: 'Install Node.js'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: npx react-scanner-studio scan
    displayName: 'Scan codebase'

  - script: npx react-scanner-studio build
    displayName: 'Build dashboard'

  - script: |
      DATE=$(date +%Y-%m-%d)
      mkdir -p reports/$DATE
      cp -r .react-scanner-studio/* reports/$DATE/
    displayName: 'Archive report'

  - task: PublishBuildArtifacts@1
    inputs:
      pathToPublish: 'reports'
      artifactName: 'weekly-reports'
    displayName: 'Publish weekly report'
```

## Run Only on Relevant Changes

Optimize your pipeline to run only when relevant files change:

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
  paths:
    include:
      - src/*
      - package.json
      - package-lock.json
      - react-scanner.config.js

pr:
  branches:
    include:
      - main
  paths:
    include:
      - src/*
      - package.json
      - package-lock.json
      - react-scanner.config.js

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: 'Install Node.js'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: npx react-scanner-studio scan
    displayName: 'Scan codebase'

  - script: npx react-scanner-studio build
    displayName: 'Build dashboard'

  - task: PublishBuildArtifacts@1
    inputs:
      pathToPublish: '.react-scanner-studio'
      artifactName: 'dashboard'
    displayName: 'Publish dashboard artifact'
```

## Caching Dependencies

Speed up your pipeline by caching dependencies:

```yaml
steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: 'Install Node.js'

  - task: Cache@2
    inputs:
      key: 'npm | "$(Agent.OS)" | package-lock.json'
      path: 'node_modules'
      restoreKeys: |
        npm | "$(Agent.OS)"
    displayName: 'Cache node_modules'

  - script: npm ci
    displayName: 'Install dependencies'
```

## Using Yarn

If your project uses Yarn:

```yaml
# azure-pipelines.yml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: 'Install Node.js'

  - task: Cache@2
    inputs:
      key: 'yarn | "$(Agent.OS)" | yarn.lock'
      path: 'node_modules'
      restoreKeys: |
        yarn | "$(Agent.OS)"
    displayName: 'Cache node_modules'

  - script: yarn install --frozen-lockfile
    displayName: 'Install dependencies'

  - script: yarn react-scanner-studio scan
    displayName: 'Scan codebase'

  - script: yarn react-scanner-studio build
    displayName: 'Build dashboard'

  - task: PublishBuildArtifacts@1
    inputs:
      pathToPublish: '.react-scanner-studio'
      artifactName: 'dashboard'
    displayName: 'Publish dashboard artifact'
```

## Using Templates

Create reusable templates for component scanning:

```yaml
# templates/scan-components.yml
parameters:
  - name: nodeVersion
    type: string
    default: '20.x'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: ${{ parameters.nodeVersion }}
    displayName: 'Install Node.js'

  - task: Cache@2
    inputs:
      key: 'npm | "$(Agent.OS)" | package-lock.json'
      path: 'node_modules'
    displayName: 'Cache node_modules'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: |
      if [ ! -f react-scanner.config.js ]; then
        echo "Configuration not found!"
        exit 1
      fi
    displayName: 'Check configuration'

  - script: npx react-scanner-studio scan
    displayName: 'Scan codebase'

  - script: npx react-scanner-studio build
    displayName: 'Build dashboard'

  - publish: '.react-scanner-studio'
    artifact: 'dashboard'
    displayName: 'Publish dashboard artifact'
```

Use the template in your main pipeline:

```yaml
# azure-pipelines.yml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - template: templates/scan-components.yml
    parameters:
      nodeVersion: '20.x'
```

## Add Status Badge

Add a badge to your README to show the pipeline status:

```markdown
[![Build Status](https://dev.azure.com/your-org/your-project/_apis/build/status/your-pipeline?branchName=main)](https://dev.azure.com/your-org/your-project/_build/latest?definitionId=1&branchName=main)
```

## Complete Example

Here's a complete multi-stage pipeline configuration:

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
  paths:
    include:
      - src/*
      - package.json
      - react-scanner.config.js

pr:
  branches:
    include:
      - main

variables:
  nodeVersion: '20.x'
  npmCacheFolder: $(Pipeline.Workspace)/.npm

stages:
  - stage: Scan
    displayName: 'Scan Components'
    jobs:
      - job: ScanJob
        displayName: 'Scan and Build Dashboard'
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(nodeVersion)
            displayName: 'Install Node.js'

          - task: Cache@2
            inputs:
              key: 'npm | "$(Agent.OS)" | package-lock.json'
              path: $(npmCacheFolder)
              restoreKeys: |
                npm | "$(Agent.OS)"
            displayName: 'Cache npm'

          - script: npm ci --cache $(npmCacheFolder)
            displayName: 'Install dependencies'

          - script: |
              if [ ! -f react-scanner.config.js ]; then
                echo "##vso[task.logissue type=error]Configuration file not found!"
                exit 1
              fi
            displayName: 'Verify configuration'

          - script: npx react-scanner-studio scan
            displayName: 'Scan codebase'

          - script: npx react-scanner-studio build
            displayName: 'Build dashboard'

          - task: PublishBuildArtifacts@1
            inputs:
              pathToPublish: '.react-scanner-studio'
              artifactName: 'dashboard'
            displayName: 'Publish dashboard artifact'

  - stage: Deploy
    displayName: 'Deploy Dashboard'
    dependsOn: Scan
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployToProd
        displayName: 'Deploy to Production'
        pool:
          vmImage: 'ubuntu-latest'
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - download: current
                  artifact: 'dashboard'
                  displayName: 'Download dashboard'

                - script: |
                    echo "Dashboard contents:"
                    ls -la $(Pipeline.Workspace)/dashboard/
                    echo "Deploying to production..."
                  displayName: 'Deploy dashboard'
```

## Predefined Variables

Azure Pipelines provides several useful predefined variables:

| Variable                           | Description                                      |
| ---------------------------------- | ------------------------------------------------ |
| `Build.SourceBranch`               | The branch being built (e.g., `refs/heads/main`) |
| `Build.SourceBranchName`           | The branch name without refs/heads prefix        |
| `Build.BuildId`                    | The unique build ID                              |
| `Build.BuildNumber`                | The build number                                 |
| `Build.Reason`                     | Why the build was triggered                      |
| `System.PullRequest.PullRequestId` | PR ID (if triggered by PR)                       |
| `Agent.OS`                         | The operating system of the agent                |
| `Pipeline.Workspace`               | The workspace directory                          |

## See Also

- [CI/CD Overview](/advanced/ci-cd/) — General CI/CD information
- [GitHub Actions](/advanced/ci-cd/github-actions) — GitHub Actions configuration
- [GitLab CI](/advanced/ci-cd/gitlab-ci) — GitLab CI configuration
- [CircleCI](/advanced/ci-cd/circleci) — CircleCI configuration
