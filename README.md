# Stickies API

API Backend for [Stickies App](https://github.com/wassamz/Stickies-App).

**User Features:** 
* Sign-up & Login routes
* Notes CRUD routes

**Security Features**
* JWT encryption for Access and Refresh Tokens. 
* Encrypted & salted user passwords within the DB. 
* Rate Limitter for requests

## Getting Started
To start, configure the environment settings: 
1. SERVER
NODE_ENV if set to Production enables the secure flag for cookies. 
HOST - Server domain running this API
PORT - Port to listen to for requests

2. MONGO DATABASE - Settings to connect to MongoDB

3. FRONTEND_DOMAIN - Used for CORS origins to secure browser requests

4. JWT - Settings to secure Access and Refresh Tokens

5. PWD - password related policy settings 

6. SMTP - Mail server settings

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
