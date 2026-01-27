# Deployment Plan

1. Push images to Azure container registry (when pushed to main)
   - Contains no secrets -> injected during runtime
   - Set up azure secrets in github
   - Create an account specifically for ai for agriculture?
2. Have two container runner instances (frontend and backend)
   - TODO: Figure out how to route frontend traffic to backend
   - TODO: Figure out how to set env values
3. Set up external production database (pass in address into backend container)
4. Expose website using Azure (TODO: Figure out how to do this)
   - Get domain name for the website

## Push Images to Registry

### Prerequisites

1. Install Azure CLI: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
2. Install Docker: https://docs.docker.com/get-docker/
3. Have Azure subscription with appropriate permissions to create and manage Azure Container Registry

### Commands

```sh
# Set variables
ACR_NAME="charaibackend"

az login

az acr login --name $ACR_NAME

cd backend

docker build -t $ACR_NAME.azurecr.io/charai-backend:latest .

docker push $ACR_NAME.azurecr.io/charai-backend:latest

```
