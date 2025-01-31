# Stickies API

API Backend for the [Stickies App](https://github.com/wassamz/Stickies-App).

Built with **Node.js**, **Express v4**, and **Vitest v3** for testing.

## Features

### User Features:
- **User Authentication**: Sign-up and login routes.
- **Password Reset**: OTP sent to the user's email for password reset.
- **Notes CRUD**: Create, read, update, and delete sticky notes.
- **Sortable Notes**: Notes have a sortable order number to retain the user's preferred order.

### Security Features:
- **JWT Encryption**: Secure Access and Refresh Tokens using JSON Web Tokens (`jsonwebtoken`).
- **Password Encryption**: User passwords are hashed and salted using `bcrypt` before storing in the database.
- **Rate Limiting**: Protection against DDoS and brute-force attacks with `express-rate-limit`.
- **OTP Generation**: One-time passwords are generated using a cryptographically secure random number generator (`Node Crypto`).
- **Request Validation**: Ensures that incoming request parameters are valid with `express-validator`.

### System Features:
- **Logging**: Configurable logging levels (info, debug, etc.) using `Winston` and `Morgan` for logging requests and other system events.

---

## Getting Started

To get started, you'll need to configure the following environment variables:

### 1. **Logging Configuration**
- `LOG_LEVEL`: Set the logging level to `info` or `debug` to control log verbosity.

### 2. **Server Configuration**
- `NODE_ENV`: Set to `production` for secure cookie handling.
- `HOST`: The domain where the API will be hosted.
- `PORT`: The port on which the server will listen for incoming requests.

### 3. **MongoDB Configuration**
- Connection details for [MongoDB](https://www.mongodb.com/) (e.g., `MONGO_URI`, `MONGO_DB_NAME`).

### 4. **CORS Configuration**
- `FRONTEND_DOMAIN`: Set the frontend domain for CORS to restrict which origins can make requests to the API.

### 5. **JWT Configuration**
- Configure JWT secret and expiration settings for Access and Refresh tokens.

### 6. **Password Policy Settings**
- Password Retry Policies

### 7. **SMTP Configuration**
- SMTP settings for sending emails (for password reset functionality).

### 8. **Note Size Limits**
- Default character limits for notes to prevent excessive data storage.

A sample `.env` file is provided for reference.

---

## Available Scripts

In the project directory, you can run the following commands:

### `npm start`

Runs the app using the settings in the `.env` file. The application will be hosted on the configured port.

### `npm test`

Runs tests using Vitest in interactive watch mode. Ensures code quality and functionality.

### `npm lint`

Runs ESLint to check for code style violations.

### `npm lint:fix`

Automatically fixes fixable code style issues using ESLint.

---

## Deployment

To deploy this API as a standalone server, you can use Docker.

### Docker Deployment

```bash
# Build the Docker image
docker build -t stickies-api .

# Run the Docker container
docker run --name stickies-api -p 3001:3001 stickies-api
