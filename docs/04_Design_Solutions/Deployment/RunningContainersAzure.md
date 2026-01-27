# Running Frontend + Backend Images from Azure Container Registry (Azure Container Apps)

This guide explains how to run a **frontend (with reverse proxy)** container image and a **backend** container image stored in **Azure Container Registry (ACR)** using **Azure Container Apps (ACA)**. This is the recommended, modern Azure-native approach for multi-container applications.

---

## Architecture Overview

- **Backend Container App**
  - Internal ingress only (not publicly exposed)
  - Receives API requests from the frontend/reverse proxy

- **Frontend / Reverse Proxy Container App**
  - External ingress (public endpoint)
  - Routes requests (e.g. `/api/*`) to the backend

Both container apps run inside the **same Container Apps Environment**, which provides **service discovery** (apps can reach each other by name).

---

## Prerequisites

- Azure subscription
- Azure CLI installed
- Logged in to Azure

```bash
az login
az account set --subscription "<SUBSCRIPTION_ID_OR_NAME>"
```

---

## 1. Define Variables

Edit these values to match your setup:

```bash
RG="rg-charai-prod"
LOC="westus2"
ENV="aca-charai-prod"

ACR_NAME="myacrname"           # no .azurecr.io
ACR_SERVER="$ACR_NAME.azurecr.io"

BACKEND_APP="charai-backend"
FRONTEND_APP="charai-frontend"

BACKEND_IMAGE="$ACR_SERVER/backend:prod"
FRONTEND_IMAGE="$ACR_SERVER/frontend-proxy:prod"

BACKEND_PORT=8000
PROXY_PORT=80
```

---

## 2. Create Resource Group and Container Apps Environment

```bash
az group create -n "$RG" -l "$LOC"

az containerapp env create \
  -n "$ENV" \
  -g "$RG" \
  -l "$LOC"
```

---

## 3. Allow Container Apps to Pull from ACR

**Recommended approach:** use **Managed Identity** (more secure than ACR admin credentials).

High-level steps:
1. Enable system-assigned managed identity on each container app
2. Grant that identity the `AcrPull` role on your ACR

This can be done via the Azure Portal or CLI. Once configured, no registry username/password is required in your app config.

---

## 4. Create the Backend Container App (Internal Ingress)

```bash
az containerapp create \
  -n "$BACKEND_APP" \
  -g "$RG" \
  --environment "$ENV" \
  --image "$BACKEND_IMAGE" \
  --ingress internal \
  --target-port "$BACKEND_PORT"
```

### 4.1 Set Non-Secret Environment Variables

```bash
az containerapp update \
  -n "$BACKEND_APP" \
  -g "$RG" \
  --set-env-vars \
    DJANGO_SETTINGS_MODULE="config.settings.production" \
    ALLOWED_HOSTS="*"
```

### 4.2 Set Secrets and Reference Them as Environment Variables

Create secrets:

```bash
az containerapp secret set \
  -n "$BACKEND_APP" \
  -g "$RG" \
  --secrets \
    DJANGO_SECRET_KEY="super-long-secret" \
    DB_PASSWORD="dont-put-this-in-git"
```

Reference secrets as env vars:

```bash
az containerapp update \
  -n "$BACKEND_APP" \
  -g "$RG" \
  --set-env-vars \
    DJANGO_SECRET_KEY="secretref:DJANGO_SECRET_KEY" \
    DB_PASSWORD="secretref:DB_PASSWORD"
```

> Note: Updating env vars or secrets creates a new **revision**. This is expected behavior.

---

## 5. Create the Frontend / Reverse Proxy Container App (External Ingress)

```bash
az containerapp create \
  -n "$FRONTEND_APP" \
  -g "$RG" \
  --environment "$ENV" \
  --image "$FRONTEND_IMAGE" \
  --ingress external \
  --target-port "$PROXY_PORT"
```

---

## 6. Configure the Proxy to Reach the Backend

Inside the same Container Apps Environment, apps can reach each other by **app name**.

For example, the backend is reachable at:

```
http://charai-backend:8000
```

Set this as an environment variable on the frontend app:

```bash
az containerapp update \
  -n "$FRONTEND_APP" \
  -g "$RG" \
  --set-env-vars \
    UPSTREAM="http://$BACKEND_APP:$BACKEND_PORT"
```

Your reverse proxy (Caddy, Nginx, etc.) should read this env var and route API requests (e.g. `/api/*`) to it.

---

## 7. Get the Public URL

```bash
az containerapp show \
  -n "$FRONTEND_APP" \
  -g "$RG" \
  --query properties.configuration.ingress.fqdn \
  -o tsv
```

This FQDN is your public entry point.

---

## Recommended Pattern Summary

- Use **Azure Container Apps**
- Use **two container apps** (frontend + backend)
- Backend uses **internal ingress only**
- Frontend uses **external ingress**
- Store secrets in **Container Apps secrets**, not in images
- Use **managed identity** for pulling from ACR

This setup is secure, scalable, and aligns with Azure best practices.

