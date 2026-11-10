# FitNess

FitNess is a fitness activity tracker with a React frontend and Spring Boot microservices. Users can record workouts and view AI-generated recommendations.

## Project layout

- `fitness-app/` — React, Vite, and Material UI frontend
- `gateway/` — API gateway and authentication
- `userservices/` — user profile and registration service
- `activityservice/` — workout activity API and persistence
- `aiservice/` — recommendation generation and API
- `configserver/` — Spring Cloud Config Server
- `eureka/` — service discovery
- `postman/` — API request collection

## Prerequisites

- Java 17
- Node.js and npm
- PostgreSQL
- MongoDB
- RabbitMQ
- Keycloak configured for the realm/client in `fitness-app/src/authConfig.js`
- A Groq API key and a supported model

## Configure local environment

Copy `.env.example` as a reference and set its values in the environment used to launch the services. Spring Boot does not load `.env` files automatically. Keep real credentials in environment variables; never commit them.

PowerShell example:

```powershell
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "<your-local-postgres-password>"
$env:RABBITMQ_HOST = "localhost"
$env:RABBITMQ_PORT = "5672"
$env:RABBITMQ_USERNAME = "<your-rabbitmq-username>"
$env:RABBITMQ_PASSWORD = "<your-rabbitmq-password>"
$env:GROQ_API_KEY = "<your-groq-api-key>"
$env:GROQ_MODEL = "llama-3.3-70b-versatile"
```

Set these variables in the same terminal/process environment that starts the Java services. The database, RabbitMQ, Keycloak, and model values must match your local setup.

## Run locally

Start the infrastructure services (PostgreSQL, MongoDB, RabbitMQ, and Keycloak), then launch the Spring Boot applications in this order:

1. `eureka` — port `8761`
2. `configserver` — port `8888`
3. `userservices` — port `8081`
4. `activityservice` — port `8082`
5. `aiservice` — port `8083`
6. `gateway` — port `8080`
7. `fitness-app` — port `5173`

Each Java service can be started from its project directory with `.\mvnw.cmd spring-boot:run`. Start the frontend with:

```powershell
Set-Location fitness-app
npm ci
npm run dev
```

The frontend expects the API gateway at `http://localhost:8080` and Keycloak at `http://localhost:8181`.
