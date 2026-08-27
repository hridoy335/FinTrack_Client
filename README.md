# FinTrack Client

Angular 21 frontend for **FinTrack**, connected to an ASP.NET Core Web API.

## Run

### API

```bash
cd D:\Hridoy\FinTrack
dotnet run --project src/FinTrackCore.Api
```

API: `http://localhost:5027`

### Client

```bash
cd D:\Hridoy\FinTrack_Client
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
* **API configuration:** `environment.development.ts`
* **API URL:** `http://localhost:5027`
