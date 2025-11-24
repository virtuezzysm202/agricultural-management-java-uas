# Farm Management Backend

A lightweight backend service for a farm management system, built using **Spark Java**, **Sql2o**, and **PostgreSQL**.
This project provides RESTful APIs for managing crops, planting activities, user authentication, and overall farm data operations.

---

## Features

* REST API using Spark Java
* PostgreSQL database integration via Sql2o
* Secure authentication with JWT
* Password hashing with BCrypt
* Environment configuration using Dotenv
* JSON serialization using Gson
* JUnit 5 for automated testing
* SLF4J for logging

---

## Tech Stack

* **Java 17**
* **Maven**
* **Spark Java (2.9.4)**
* **Sql2o (1.6.0)**
* **PostgreSQL Driver (42.7.4)**
* **Gson (2.10.1)**
* **BCrypt (0.4)**
* **JWT (4.4.0)**
* **Dotenv Java (3.0.0)**
* **JUnit Jupiter (5.10.2)**
* **SLF4J (2.0.7)**

---


## Requirements

* Java 17
* Maven 3.8+
* PostgreSQL database
* `.env` file for environment variables

Example `.env`:

```
DB_URL=jdbc:postgresql://localhost:5432/farmdb
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your_jwt_secret_key
```

---

## Installation

1. Clone the repository:

```
git clone <repo-url>
cd farm-management-backend
```

2. Configure your `.env` file.

3. Install dependencies:

```
mvn clean install
```

4. Run the server:

```
mvn exec:java
```

---

## API Endpoints (Overview)

**Authentication**

* `POST /auth/login` – User login
* `POST /auth/register` – Create new user

**Crops Management**

* `GET /crops` – Fetch all crops
* `POST /crops` – Add new crop
* `PUT /crops/:id` – Update crop
* `DELETE /crops/:id` – Remove crop

**Planting Activities**

* `GET /plantings`
* `POST /plantings`

More endpoints can be added as needed for farm expansion.

---

## Running Tests

```
mvn test
```

---

## Logging

The application uses SLF4J Simple Logger.
Configure logging through `simplelogger.properties` if needed.

---

## Build & Deployment

To package the application:

```
mvn package
```

The project can be deployed to any Java-based server, containerized with Docker, or run as a standalone JAR.

---

## License

This project may be licensed according to your preference. Add the license text if applicable.

---

## Notes

This backend is intentionally lightweight to make the system easy to extend. Future modules such as inventory tracking, financial reporting, IoT sensor integration, and field monitoring can be incorporated without major architectural changes.
