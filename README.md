# URL Health Monitor — Frontend

A React dashboard for the URL Health Monitor API — add URLs to track, watch their live status, and dig into uptime and response-time history with charts.

> 🔗 Backend API companion lives on the [`main`](../../tree/main) branch of this repo.

## Features

- **Dashboard** with live-refreshing status overview of all monitored URLs
- **Add / edit / delete URLs** to track
- **Health details view** with response-time and uptime charts (Recharts)
- **Auto-polling** for near-real-time status updates without manual refresh
- **Fully tested** — every page has a dedicated Vitest + React Testing Library suite

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite |
| Routing | React Router 7 |
| HTTP client | Axios |
| Charts | Recharts |
| Testing | Vitest, React Testing Library, jsdom |
| Linting | ESLint |
| Web server (prod) | Nginx (reverse-proxies `/api` to the backend) |
| Containerization | Docker |

## Project Structure

```
frontend/
├── src/
│   ├── assets/            # Images/static assets
│   ├── components/        # Shared UI components (Navbar, Loading, ErrorMessage)
│   ├── pages/              # Route-level pages
│   │   ├── Dashboard.jsx
│   │   ├── Urls.jsx
│   │   ├── AddUrl.jsx
│   │   ├── EditUrl.jsx
│   │   └── HealthDetails.jsx
│   ├── services/api.js     # Axios instance (baseURL: /api/urls)
│   ├── App.jsx
│   └── main.jsx
├── public/
├── nginx.conf              # Reverse proxy config for production
├── Dockerfile
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- The [backend API](../../tree/main) running (locally on `:8888` or via Docker)

### 1. Clone and install

```bash
git clone https://github.com/AdityaRoy0804/URL-Health-Monitor.git
cd URL-Health-Monitor/frontend
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Opens at **http://localhost:5173** by default. API calls to `/api/urls` need to be proxied to the backend in dev — either run behind the same Nginx setup, or configure a [Vite dev proxy](https://vite.dev/config/server-options.html#server-proxy) pointing `/api` at `http://localhost:8888`.

### 3. Build for production

```bash
npm run build
```

Outputs static assets to `dist/`.

### 4. Run with Docker

The production image builds the app and serves it via Nginx, which proxies `/api/*` requests to the `backend` container:

```bash
docker compose up --build
```

The frontend is served on **http://localhost:80**. This expects the `backend` service to be reachable at `http://backend:8888` inside the Docker network (already wired in `docker-compose.yml`).

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the Vitest test suite |

## Pages

| Page | Description |
|---|---|
| `Dashboard` | Overview of all URLs with live status polling |
| `Urls` | List/manage tracked URLs |
| `AddUrl` | Form to register a new URL |
| `EditUrl` | Form to update an existing URL |
| `HealthDetails` | Per-URL history and charts (response time, uptime %) |

## API Integration

The app talks to the backend through a single Axios instance (`src/services/api.js`) with `baseURL: "/api/urls"`. In production, Nginx (`nginx.conf`) proxies any request to `/api/` through to the backend container, so the frontend never needs to know the backend's host directly.

## Testing

```bash
npm run test
```

Every page component has a matching `*.test.jsx` file covering rendering, user interactions, and mocked API calls (e.g. CRUD flows, chart rendering, error and loading states).

## Roadmap Ideas

- Dark mode
- Per-URL notification preferences
- Export health history as CSV

## License

MIT (or update to match your preferred license)
