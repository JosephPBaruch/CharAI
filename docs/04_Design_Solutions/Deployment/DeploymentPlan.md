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

### Step 1: Create Azure Container Registry (ACR)

```sh
# Set variables
RESOURCE_GROUP="ai-agriculture-rg"
ACR_NAME="aiagriculture"  # Must be globally unique, alphanumeric only
LOCATION="westus2"  # Choose a region close to your users

# Create resource group (if it doesn't exist)
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Azure Container Registry
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --location $LOCATION
```

### Step 2: Login to Azure and ACR

```sh
# Login to Azure
az login

# Login to Azure Container Registry
az acr login --name $ACR_NAME

# Alternatively, you can get the login server name
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
echo "ACR Login Server: $ACR_LOGIN_SERVER"
```

### Step 3: Build and Push Backend Image

```sh
# Navigate to backend directory
cd backend

# Build the Docker image with ACR tag
docker build -t $ACR_NAME.azurecr.io/charai-backend:latest .

# Optionally, tag with version number
docker build -t $ACR_NAME.azurecr.io/charai-backend:v1.0.0 .

# Push the image to ACR
docker push $ACR_NAME.azurecr.io/charai-backend:latest
docker push $ACR_NAME.azurecr.io/charai-backend:v1.0.0

# Go back to root directory
cd ..
```

### Step 4: Build and Push Frontend Image

```sh
# Navigate to frontend directory
cd frontend

# Build the Docker image with build arguments for production
docker build \
  --build-arg VITE_API_URL="https://your-production-domain.com/api" \
  --build-arg VITE_APP_URL="https://your-production-domain.com" \
  -t $ACR_NAME.azurecr.io/charai-frontend:latest .

# Optionally, tag with version number
docker build \
  --build-arg VITE_API_URL="https://your-production-domain.com/api" \
  --build-arg VITE_APP_URL="https://your-production-domain.com" \
  -t $ACR_NAME.azurecr.io/charai-frontend:v1.0.0 .

# Push the image to ACR
docker push $ACR_NAME.azurecr.io/charai-frontend:latest
docker push $ACR_NAME.azurecr.io/charai-frontend:v1.0.0

# Go back to root directory
cd ..
```

### Step 5: Verify Images in ACR

```sh
# List repositories in ACR
az acr repository list --name $ACR_NAME --output table

# List tags for a specific repository
az acr repository show-tags --name $ACR_NAME --repository charai-backend --output table
az acr repository show-tags --name $ACR_NAME --repository charai-frontend --output table
```

### GitHub Actions Integration

For automated deployments on push to main, add the following secrets to your GitHub repository:

1. **AZURE_CREDENTIALS**: Service principal credentials
   ```sh
   # Create a service principal
   az ad sp create-for-rbac \
     --name "github-actions-charai" \
     --role contributor \
     --scopes /subscriptions/{subscription-id}/resourceGroups/$RESOURCE_GROUP \
     --sdk-auth
   
   # Copy the entire JSON output and add it as a GitHub secret
   ```

2. **ACR_LOGIN_SERVER**: The ACR login server URL
   ```sh
   az acr show --name $ACR_NAME --query loginServer --output tsv
   ```

3. **ACR_USERNAME** and **ACR_PASSWORD**: For ACR authentication
   ```sh
   # Enable admin account (not recommended for production; use service principal instead)
   az acr update --name $ACR_NAME --admin-enabled true
   
   # Get credentials
   az acr credential show --name $ACR_NAME
   ```

   Or use a service principal (recommended):
   ```sh
   # Get ACR resource ID
   ACR_REGISTRY_ID=$(az acr show --name $ACR_NAME --query id --output tsv)
   
   # Create service principal with pull/push permissions
   SP_PASSWD=$(az ad sp create-for-rbac \
     --name "acr-service-principal" \
     --scopes $ACR_REGISTRY_ID \
     --role acrpush \
     --query password \
     --output tsv)
   
   SP_APP_ID=$(az ad sp list --display-name "acr-service-principal" --query [].appId --output tsv)
   
   echo "ACR_USERNAME: $SP_APP_ID"
   echo "ACR_PASSWORD: $SP_PASSWD"
   ```

### Notes

- Replace `$ACR_NAME` with your actual ACR name (must be globally unique, lowercase, alphanumeric only)
- Replace production URLs in frontend build arguments with your actual domain
- Consider using ACR Tasks for automated builds: https://learn.microsoft.com/en-us/azure/container-registry/container-registry-tasks-overview
- For production, use managed identities or service principals instead of admin credentials
- Tag images with version numbers or git commit SHAs for better traceability
