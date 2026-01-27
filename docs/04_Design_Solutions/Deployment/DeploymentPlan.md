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

```sh
# TODO: Create steps for logging into azure and pushing an image


```
