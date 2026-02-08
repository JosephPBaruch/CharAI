# Deployment

This document summarizes deployment guidance for CharAI: container image build/push, Azure Container Apps deployment, database configuration, and common commands used in CI and local testing.

See the repository CI configuration (ci.yaml) for the canonical pipeline definitions.

## Architecture

- Container images are built, tagged, and pushed to an Azure Container Registry (ACR).
- Images are deployed to Azure Container Apps (or a similar runtime) and started with environment variables and secrets set.
- The frontend is exposed publicly; the backend and database are internal-only services.

Refer to the deployment architecture diagram: ![Deployment Architecture Diagram](/docs/04_Design_Solutions/Deployment/DeploymentArch.drawio.png)

## Environments & Ownership

- Production: Azure Container Apps + Azure Database for PostgreSQL (flexible servers)
- Staging / CI: Containerized services run by the pipeline scripts for integration tests

## Environment variables and secrets

Frontend (public):

- `BACKEND_URL` — internal backend service hostname (example: `charai-backend:4131`) or internal DNS name used by container networking
- `LOG_LEVEL` — `INFO`, `DEBUG`, etc.

Backend (internal only):

- `DEBUG` — `True`/`False`
- `ALLOWED_HOSTS` — comma-separated hostnames for the deployed services (e.g. `charai-backend.<suffix>,charai-frontend.<suffix>`)
- `DATABASE_URL` — store as a secret; example:

```sh
postgresql://<USER>:<PASSWORD>@charai-pg-db.postgres.database.azure.com:5432/<DB>?sslmode=require
```

- `OPENTOPOGRAPHY_API_KEY` — store as secret
- `SECRET_KEY` — Django secret key; store as secret

Notes:

- Never commit secret values to source control. Use Azure Key Vault or Container Apps secrets.
- Ensure backend and database are only accessible from the internal network or VNet.

## Database (Production)

- Production uses **Azure Database for PostgreSQL — Flexible Server**.
- Create a database on the server (the `DATABASE` name is created or selected in the Azure portal under the server's "Databases" blade).

When configuring `DATABASE_URL`, replace `<USER>`, `<PASSWORD>`, and `<DB>` with the values you created in Azure:

```sh
postgresql://<USER>:<PASSWORD>@charai-pg-db.postgres.database.azure.com:5432/<DB>?sslmode=require
```

## Build, Tag, and Push Container Images (ACR)

Prerequisites:

1. Install Azure CLI: https://learn.microsoft.com/cli/azure/install-azure-cli
2. Install Docker: https://docs.docker.com/get-docker/
3. Have an Azure subscription and permissions to create/manage ACR

Commands (example):

```sh
# Set your ACR name
ACR_NAME="charaibackend"

az login
az acr login --name "$ACR_NAME"

# Build and push backend image
cd backend
docker build -t "$ACR_NAME.azurecr.io/charai-backend:latest" .
docker push "$ACR_NAME.azurecr.io/charai-backend:latest"
```

Repeat similar steps for the frontend image if you publish a separate container for it.

## CI/CD and Pipeline Scripts

- The repository includes `pipeline.sh` scripts that can build and run containers locally or in CI. Use the pipeline scripts from the repository root to run all service pipelines, or from individual service directories to run a single service pipeline.

Examples:

```sh
# Run all pipelines from the repository root
./pipeline.sh --hosts HOST

# Run only the backend pipeline
cd backend
./pipeline.sh --hosts HOST
```

Replace `HOST` with the hostname or IP address services should bind to (for local testing, `localhost` or `0.0.0.0`).

Notes for CI:

- CI should authenticate to ACR (service principal or managed identity) and push images using non-interactive credentials.
- Store secrets (database credentials, API keys, Django SECRET_KEY) in the CI secret store and inject them into the deployment environment.

## Running Migrations

- To apply Django migrations in a deployed container, exec into the backend container and run:

```sh
python manage.py migrate
```

Or run migrations as part of the deployment job using the same image and environment variables.

## Special Host Notes (LXC / AppArmor)

If you are deploying inside an LXC container (Proxmox or similar), you may need to disable AppArmor restrictions for Docker to run inside the container. Example steps for Proxmox LXC:

```sh
apt-get update
apt-get install -y docker.io

# Edit the container config on the Proxmox host
nano /etc/pve/lxc/<CTID>.conf
# Add these lines to the container config:
# lxc.apparmor.profile: unconfined
# lxc.mount.entry: /dev/null sys/module/apparmor/parameters/enabled none bind 0 0

pct restart <CTID>
```

Only make these changes if you understand the security implications.

## Troubleshooting & Tips

- If deployments fail due to networking, verify that Container Apps and the database are in the same VNet or have proper private endpoints configured.
- Ensure `sslmode=require` in the `DATABASE_URL` when connecting to Azure Database for PostgreSQL.
- Use Azure Portal or `az` CLI to inspect container app logs and restart unhealthy instances.
