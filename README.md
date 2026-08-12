# URL Health Monitor — Backend

A Spring Boot REST API that tracks a list of URLs, pings each one on a schedule, and records uptime/response-time history — the engine behind the URL Health Monitor app.

> 🔗 Frontend companion app lives on the [`feature/frontend`](../../tree/feature/frontend) branch of this repo.

## Features

- **CRUD for monitored URLs** — register, view, update, enable/disable, and delete URLs
- **Automated health checks** — a background scheduler pings every enabled URL once a minute
- **Health history** — every check is persisted with status, HTTP code, response time, and error message
- **Aggregated stats** — uptime %, average/min/max response time per URL
- **Paginated history** with optional status filtering (UP / DOWN)
- **OpenAPI/Swagger docs** generated automatically via springdoc

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 4.0.8 (Web MVC, Data JPA, Validation) |
| Database | MySQL 8.0 |
| HTTP Client | Spring `RestClient` (for outbound health checks) |
| API Docs | springdoc-openapi (Swagger UI) |
| Boilerplate | Lombok |
| Testing | JUnit 5, Spring Boot Test, TestNG |
| Build | Maven |
| Containerization | Docker |

## Project Structure

```
backend/
├── src/main/java/in/akr/URLMonitor/
│   ├── config/          # CORS & RestClient bean configuration
│   ├── controller/      # REST controllers (Url, HealthHistory)
│   ├── dto/              # Request/response DTOs
│   ├── entity/           # JPA entities (Url, HealthRecord, HealthStatus)
│   ├── exception/        # Global exception handling
│   ├── mapper/           # Entity ↔ DTO mappers
│   ├── repository/       # Spring Data JPA repositories
│   ├── scheduler/        # Scheduled health-check job
│   └── service/          # Business logic
├── src/test/              # Unit & integration tests
├── Dockerfile
└── pom.xml
```

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.9+ (or use the included `./mvnw`)
- MySQL 8.0 running locally, **or** Docker

### 1. Clone and configure

```bash
git clone https://github.com/AdityaRoy0804/URL-Health-Monitor.git
cd URL-Health-Monitor/backend
```

Update `src/main/resources/application.properties` with your local database credentials, or override them with environment variables (recommended — see [Configuration](#configuration) below).

### 2. Run locally

```bash
./mvnw spring-boot:run
```

The API starts on **http://localhost:8888**.

### 3. Run with Docker

From the repository root (where `docker-compose.yml` lives):

```bash
docker compose up --build
```

This spins up MySQL, the backend (port `8888`), and the frontend together. See [Configuration](#configuration) for the required `.env` file.

## Configuration

The app reads DB settings from `application.properties` by default. For Docker/production, set these environment variables instead (a root-level `.env` file is used by `docker-compose.yml`):

| Variable | Description |
|---|---|
| `MYSQL_DATABASE` | Database name |
| `MYSQL_USER` | Database user |
| `MYSQL_PASSWORD` | Database password |
| `MYSQL_ROOT_PASSWORD` | MySQL root password |
| `SPRING_DATASOURCE_URL` | Full JDBC URL (auto-set by Compose) |


## API Reference

Base path: `/api/urls`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/urls/health` | API liveness check |
| `POST` | `/api/urls/new` | Register a new URL |
| `GET` | `/api/urls/view` | List all monitored URLs |
| `GET` | `/api/urls/view/{id}` | Get a single URL |
| `PUT` | `/api/urls/edit/{id}` | Update a URL |
| `DELETE` | `/api/urls/delete/{id}` | Delete a URL |
| `GET` | `/api/urls/{urlId}/health` | Paginated health history (`page`, `size`, `status`) |
| `GET` | `/api/urls/{urlId}/health/latest` | Most recent health check |
| `GET` | `/api/urls/{urlId}/health/stats` | Aggregated uptime/response-time stats |

### Example — Register a URL

```http
POST /api/urls/new
Content-Type: application/json

{
  "name": "My Portfolio",
  "url": "https://example.com",
  "enabled": true
}
```

**Response `201 Created`**
```json
{
  "id": 1,
  "name": "My Portfolio",
  "url": "https://example.com",
  "enabled": true,
  "createdAt": "2026-08-13T10:00:00"
}
```

### Example — Health stats

```http
GET /api/urls/1/health/stats
```

```json
{
  "totalChecks": 120,
  "successfulChecks": 118,
  "failedChecks": 2,
  "uptimePercentage": 98.33,
  "averageResponseTime": 214.5,
  "minResponseTime": 98,
  "maxResponseTime": 610
}
```

Interactive Swagger UI is available at **`/swagger-ui.html`** once the app is running.

## How Health Checks Work

A `@Scheduled` job (`HealthScheduler`) runs every **60 seconds**, fetches all URLs marked `enabled = true`, and issues an HTTP GET to each via `RestClient`. A response with status `200–399` is recorded as `UP`; anything else (or a network exception) is recorded as `DOWN`, along with the response time and error message.

## Testing

```bash
./mvnw test
```

Covers controller and service layers for both URL management and health-history retrieval.

## Roadmap Ideas

- Alerting (email/webhook) on status change
- Configurable check interval per URL
- Authentication for multi-user support

## License

MIT (or update to match your preferred license)
