# 🏃‍♂️ FitNess — Fitness Activity Tracker

> Track your workouts. Get AI coaching. Stay consistent.

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.x-brightgreen?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-local-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-local-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-messaging-FF6600?style=flat-square&logo=rabbitmq)](https://www.rabbitmq.com/)
[![Keycloak](https://img.shields.io/badge/Keycloak-auth-4A90D9?style=flat-square&logo=keycloak)](https://www.keycloak.org/)

</div>

---

## 👋 What is this project?

So I built this as my personal project to get hands-on with **Spring Boot microservices** and a modern React frontend — wanted to actually build something useful instead of just following tutorials blindly.

**FitNess** lets you:
- 🔐 Login securely via Keycloak (OAuth2 PKCE)
- 🏋️ Log your workouts (Running, Walking, Cycling)
- 📊 See a real-time dashboard with sessions, active minutes, and calories
- 📈 Visualize your recent workout rhythm as a mini bar chart
- 🤖 Click any workout to get **AI-powered coaching** recommendations

The whole thing runs as 6 Spring Boot microservices talking to each other through an API Gateway, with a React frontend.



## 🏗️ Architecture — How it all fits together

```
Browser (React + Vite)
        │
        ▼
  API Gateway :8080  ◄── Keycloak JWT validation
  ┌─────────────────────────────────────────────┐
  │  /api/users/**     → User Service    :8081  │  PostgreSQL
  │  /api/activities/** → Activity Svc   :8082  │  MongoDB + RabbitMQ
  │  /api/recommendations/** → AI Svc   :8083  │  MongoDB + Groq LLM
  └─────────────────────────────────────────────┘
        │
  ┌─────────────┐    ┌──────────────┐
  │   Eureka    │    │ Config Server│
  │  :8761      │    │  :8888       │
  └─────────────┘    └──────────────┘
```

When you log a workout → Activity Service saves it → pushes event to RabbitMQ → AI Service picks it up and generates a recommendation using Groq LLM → stored in MongoDB → available next time you click that workout.

---

## 📂 Project Structure

```
FitNess/
├── fitness-app/        # React + Vite + Material UI frontend
├── gateway/            # Spring Cloud Gateway + Security (JWT)
├── userservices/       # User registration & profile (PostgreSQL)
├── activityservice/    # Workout logging API (MongoDB + RabbitMQ)
├── aiservice/          # AI recommendations via Groq (MongoDB)
├── configserver/       # Spring Cloud Config Server
├── eureka/             # Netflix Eureka Service Registry
└── postman/            # API collections for testing
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Material UI 9, Redux Toolkit, Axios |
| Auth | Keycloak (OAuth2 PKCE), react-oauth2-code-pkce |
| API Gateway | Spring Cloud Gateway (WebFlux) |
| Microservices | Spring Boot 4.x, Spring Cloud |
| Service Discovery | Netflix Eureka |
| Config Management | Spring Cloud Config Server |
| User Data | PostgreSQL + Spring Data JPA |
| Activity Data | MongoDB + Spring Data MongoDB |
| Messaging | RabbitMQ + Spring AMQP |
| AI / LLM | Groq API (Llama 3.3 70B) |
| Build | Maven (mvnw wrapper) |

---

## ⚙️ Prerequisites

Make sure you have these installed and running before starting:

- ☕ **Java 17**
- 🟢 **Node.js** (v18+) + **npm**
- 🐘 **PostgreSQL** — running on port `5432`
- 🍃 **MongoDB** — running on port `27017`
- 🐇 **RabbitMQ** — running on port `5672` (management UI on `15672`)
- 🔐 **Keycloak** — running on port `8181` (see setup below)
- 🤖 **Groq API key** — free at [console.groq.com](https://console.groq.com)

---

## 🔐 Keycloak Setup

1. Download and run Keycloak: `kc.bat start-dev --http-port=8181`
2. Go to `http://localhost:8181` → Admin Console
3. Create a realm: `oauth2-pkce`
4. Create a client: `oauth2-pkce-client`
   - Client authentication: OFF
   - Standard flow: ON
   - Valid redirect URIs: `http://localhost:5173`, `http://localhost:5174`
   - Web origins: `http://localhost:5173`, `http://localhost:5174`
5. Create a test user in the realm

---

## 🚀 Running Locally

### Step 1 — Set environment variables

Open PowerShell and set these before starting any service:

```powershell
$env:DB_USERNAME       = "postgres"
$env:DB_PASSWORD       = "your-postgres-password"
$env:RABBITMQ_USERNAME = "guest"
$env:RABBITMQ_PASSWORD = "guest"
$env:GROQ_API_KEY      = "your-groq-api-key"
$env:GROQ_MODEL        = "llama-3.3-70b-versatile"
```

### Step 2 — Start services in this exact order

Each service gets its own terminal:

```powershell
# 1. Eureka (service registry)
cd eureka
.\mvnw.cmd spring-boot:run

# 2. Config Server
cd configserver
.\mvnw.cmd spring-boot:run

# 3. User Service
cd userservices
.\mvnw.cmd spring-boot:run

# 4. Activity Service
cd activityservice
.\mvnw.cmd spring-boot:run

# 5. AI Service
cd aiservice
.\mvnw.cmd spring-boot:run

# 6. API Gateway
cd gateway
.\mvnw.cmd spring-boot:run

# 7. Frontend
cd fitness-app
npm install
npm run dev
```

### Step 3 — Open the app

Go to **http://localhost:5173** in your browser and log in!

---

## 🌐 Service Ports Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| API Gateway | 8080 | http://localhost:8080 |
| User Service | 8081 | http://localhost:8081 |
| Activity Service | 8082 | http://localhost:8082 |
| AI Service | 8083 | http://localhost:8083 |
| Config Server | 8888 | http://localhost:8888 |
| Eureka Dashboard | 8761 | http://localhost:8761 |
| Keycloak | 8181 | http://localhost:8181 |

---

## 🔄 How a Workout Request Flows

```
1. You fill in the workout form on the frontend
2. React sends POST /api/activities with your JWT token
3. API Gateway validates the JWT with Keycloak
4. Gateway forwards the request to Activity Service (port 8082)
5. Activity Service validates you exist → calls User Service
6. Activity is saved to MongoDB
7. A message is published to RabbitMQ (fitness.exchange → activity.queue)
8. AI Service receives the message, calls Groq LLM
9. Recommendation is saved to MongoDB
10. Click the workout card → GET /api/recommendations/activity/{id}
11. See your personalised coaching tips!
```

---

## 📡 API Endpoints

### User Service (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register a new user |
| GET | `/api/users/{userId}` | Get user profile |
| GET | `/api/users/{userId}/validate` | Check if user exists |

### Activity Service (`/api/activities`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/activities` | Log a new workout |
| GET | `/api/activities` | Get all your activities |
| GET | `/api/activities/{id}` | Get a specific activity |

### AI Service (`/api/recommendations`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations/activity/{id}` | Get AI coaching for a workout |
| GET | `/api/recommendations/user/{userId}` | Get all recommendations |

---

## 🧪 Testing with Postman

Import the collection from `postman/collections/Fitness Microservices/` — it has all the requests pre-configured. Just set your Bearer token in the Authorization tab.

---

## 💡 Things I Learned Building This

- Setting up a whole microservices architecture from scratch is **hard** — service startup order actually matters a lot
- RabbitMQ async messaging between services is really cool once it works
- Keycloak OAuth2 PKCE setup has a lot of moving parts but is very secure
- Spring Cloud Config Server centralises all config nicely
- React with Redux for token management needs careful handling

---

## 📌 Known Limitations / Future Plans

- [ ] Add Docker Compose so the whole stack starts with one command
- [ ] Add more activity types (Swimming, Yoga, Gym)
- [ ] Add weekly/monthly progress charts
- [ ] Push notifications for workout reminders
- [ ] Mobile responsive design improvements

---

## 🤝 Contributing

If you want to try it out or suggest improvements, feel free to open an issue or a PR. This is a learning project so feedback is always welcome!

---

<div align="center">

**Built with ☕ + 💪 by Sharath**

*A microservices project to learn Spring Cloud, React, and AI integration*

</div>
=======
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
