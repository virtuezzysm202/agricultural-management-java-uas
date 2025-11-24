# Farm Management System

A complete farm management platform consisting of a lightweight Java backend and a modern React-based frontend.
The system is designed to manage crops, planting activities, user authentication, and basic dashboard analytics.

---

# 1. Backend Overview

Backend service built using **Spark Java**, **Sql2o**, and **PostgreSQL**.
Provides REST APIs for managing farm operations.

## Features

* REST API using Spark Java
* PostgreSQL integration (Sql2o)
* JWT authentication
* Password hashing (BCrypt)
* Gson for JSON processing
* Dotenv for environment configuration
* SLF4J logging
* JUnit 5 testing

## Requirements

* Java 17
* Maven 3.8+
* PostgreSQL
* `.env` configuration

Example `.env`:

```
DB_URL=jdbc:postgresql://localhost:5432/farmdb
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your_jwt_secret_key
```

## Run Backend

Install dependencies:

```
mvn clean install
```

Run development server:

```
mvn exec:java
```

Run tests:

```
mvn test
```

---

# 2. Frontend Overview

The frontend is built using **React 19**, **Vite**, and **TailwindCSS**, with charting support via ApexCharts, Chart.js, and Recharts.

## Features

* Built with React + Vite
* React Router for navigation
* Axios for API communication
* TailwindCSS for styling
* Dashboard charts using ApexCharts, Chart.js, and Recharts
* Component icons via lucide-react

## Tech Stack

* React 19
* Vite 7
* TailwindCSS 3.4
* Axios
* ApexCharts
* Chart.js
* Recharts
* React Router DOM

## Requirements

* Node.js 18+
* npm or yarn or pnpm

## Install & Run Frontend

Install dependencies:

```
npm install
```

Run development:

```
npm run dev
```

Build production:

```
npm run build
```

Preview build:

```
npm run preview
```

---

# 3. Project Structure

```
root/
 ├── backend/
 │    ├── pom.xml
 │    └── src/main/java/com/farmmanagement/
 │         ├── App.java
 │         ├── controllers/
 │         ├── models/
 │         ├── repositories/
 │         └── utils/
 └── frontend/
      ├── package.json
      ├── src/
      │    ├── components/
      │    ├── pages/
      │    ├── hooks/
      │    ├── services/     # API calls using Axios
      │    └── styles/
      └── public/
```

---

# 4. API Endpoints (Summary)

## Auth

* `POST /auth/login`
* `POST /auth/register`

## Crops

* `GET /crops`
* `POST /crops`
* `PUT /crops/:id`
* `DELETE /crops/:id`

## Planting

* `GET /plantings`
* `POST /plantings`

Additional endpoints can be added as the system evolves.

---

# 5. Deployment Notes

Both apps can be deployed separately.

**Backend**

* Deploy as JAR
* Deploy to VPS, Railway, Heroku alternative, or Docker

**Frontend**

* Deploy static build (Netlify, Vercel, Cloudflare Pages, Nginx)

---

# 6. License

Add the license text if needed.

---

# 7. Notes

This system is intentionally modular to support future extensions such as farm analytics, sensor monitoring, inventory tracking, and integrated financial tools.
