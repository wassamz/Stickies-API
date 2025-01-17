# Stickies API

API Backend for [Stickies App](https://github.com/wassamz/Stickies-App).

**User Features:** 
* Sign-up & Login routes
* Notes CRUD routes
* Password Reset with OTP sent to user email

**Security Features**
* JWT encryption for Access and Refresh Tokens. 
* Encrypted & salted user passwords within the DB. 
* Rate Limitter for requests
* OTP generated using cryptographically secure random number generator

**System Features**
* Logging capabilities for Info, Debug, etc. 

## Getting Started
To start, configure the environment settings: 
1. LOG_LEVEL - Logging level can be set to info or debug

2. SERVER
NODE_ENV if set to Production enables the secure flag for cookies. 
HOST - Server domain running this API
PORT - Port to listen to for requests

3. MONGO DATABASE - Settings to connect to MongoDB

4. FRONTEND_DOMAIN - Used for CORS origins to secure browser requests

5. JWT - Settings to secure Access and Refresh Tokens

6. PWD - password related policy settings 

7. SMTP - Mail server settings

A sample environment is included.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the using the settings in the .env file

### `npm test`

Launches the vitest runner in the interactive watch mode.\


### Deployment
Dockerfile included to deploy as a standalone frontend server. 
Sample deploy commands:
```bash
docker build -t stickies-api .
docker run --name stickies-api -p 3001:3001 stickies-api
```
