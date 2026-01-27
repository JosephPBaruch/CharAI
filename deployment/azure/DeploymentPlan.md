# Deployment Plan

## Notes

brew update
brew install azure-cli

az login

az configure

az group list --output table

az acr create \
 --resource-group my-rg \
 --name myregistry \
 --sku Basic

docker tag backend:prod myregistry.azurecr.io/backend:prod
docker push myregistry.azurecr.io/backend:prod

docker tag frontend:prod myregistry.azurecr.io/frontend:prod
docker push myregistry.azurecr.io/frontend:prod

need to run Caddy in a a container?
