# FinTrack Client

Angular 21 frontend for **FinTrack**, connected to an ASP.NET Core Web API.

## Run with Docker (no Node/.NET install)

Keep this repo next to the backend as siblings, then from the backend folder:

```text
Hridoy/
  FinTrack/
  FinTrack_Client/   ← this repo
```

```bash
cd ../FinTrack
docker compose up --build
```

| Service | URL |
|---------|-----|
| **App** | http://localhost:4200 |
| **API** | http://localhost:5027 |
| **Swagger** | http://localhost:5027/swagger |

Nginx serves this app and proxies `/api` to the API container.

## Run locally

### API

```bash
cd ../FinTrack
dotnet run --project src/FinTrackCore.Api
```

API: `http://localhost:5027`

### Client

```bash
npm install
npm start
```

Client: `http://localhost:4200`

## Application Flow

```text
/ → /auth/register → /auth/login → /app/dashboard
```

Logout redirects the user to `/`.

## Project Structure

```text
src/app/
├── core/        # Auth, HTTP, models
├── layout/      # Public, auth, and app layouts
└── features/    # Landing, login, register, dashboard, profile
```

## Configuration

* **Global styles:** `src/styles.scss`
* **Local API URL:** `environment.development.ts` → `http://localhost:5027`
* **Docker API URL:** `environment.docker.ts` → same-origin (`/api` via nginx)

