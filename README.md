# Fanarrt

A self-hosted, Docker-contained web app for managing fanart for your Sonarr/Radarr media library.

## Features

- **Library Sync** — Imports TV shows from Sonarr and movies from Radarr
- **Fanart Browsing** — Pulls artwork from TheTVDB, TMDB, and Fanart.tv per title
- **Provider Filtering** — Filter and prioritise artwork by source
- **Favourites** — Star any artwork to save it as a favourite
- **Batch Download** — Download favourites as a ZIP: per title, current view, or entire library
- **Poster Cache** — Library thumbnails cached locally for fast loads
- **Clean UI** — Dark, modern interface with lightbox viewer, type filtering, and letter jump nav

## Quick Start (Production)

### 1. On your server — first time only

```bash
# Log in to Docker Hub (needed for private repo — once only)
docker login -u incredibad

# Create a folder for the compose file
mkdir fanarrt && cd fanarrt

# Download the compose file
curl -O https://raw.githubusercontent.com/incredibad/fanarrt/main/docker-compose.yml

# Start
docker compose up -d
```

Open **http://your-server:3579** — you'll be prompted to create an admin account.

### 2. Updating

```bash
docker compose pull && docker compose up -d
```

That's it. Your data (database, image cache) is in Docker volumes and is unaffected by updates.

### Optional: Auto-updates with Watchtower

Uncomment the `watchtower` section in `docker-compose.yml` to have the container check for and apply updates automatically every 6 hours.

---

## Development

### Prerequisites
- Node.js 20+
- Docker + Docker Compose

### Local dev server (hot reload)

```bash
# Terminal 1 — backend
cd backend && npm install && npm run dev

# Terminal 2 — frontend (proxies /api to localhost:3579)
cd frontend && npm install && npm run dev
```

Frontend dev server runs on port 5173.

### Build and test with Docker locally

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

### Deploying changes

Push to `main` on GitHub — the Actions workflow builds and pushes to Docker Hub automatically (~3 min). Then on your server:

```bash
docker compose pull && docker compose up -d
```

---

## First-Run Setup

1. Open the app and create your admin account
2. Go to **Settings** and enter your API keys:

| Setting | Where to find it |
|---|---|
| Sonarr URL | e.g. `http://your-server:8989` |
| Sonarr API Key | Sonarr → Settings → General → API Key |
| Radarr URL | e.g. `http://your-server:7878` |
| Radarr API Key | Radarr → Settings → General → API Key |
| TheTVDB API Key | [thetvdb.com/api-information](https://www.thetvdb.com/api-information) (free) |
| TMDB API Key | [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) (free) |
| Fanart.tv API Key | [fanart.tv/get-an-api-key](https://fanart.tv/get-an-api-key/) (free) |

3. Click **Sync Library** in the sidebar
4. Browse to any title and click **Fetch Fanart**
5. Star your favourites and download as ZIP

---

## GitHub Actions Setup (for contributors / forks)

Add these secrets to your GitHub repo (Settings → Secrets → Actions):

| Secret | Value |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token (Account Settings → Security) |

The workflow triggers on every push to `main` and tags images as both `latest` and the git short SHA.

---

## Data Persistence

| Volume | Contents |
|---|---|
| `fanarrt-data` | SQLite database, session secret, image caches |
| `fanarrt-downloads` | Reserved for future use |

Volumes survive `docker compose pull && docker compose up -d` updates.

## Tech Stack

- **Backend**: Node.js, Express, SQLite (better-sqlite3), Archiver
- **Frontend**: React 18, React Router, Vite, Lucide icons
- **APIs**: Sonarr v3, Radarr v3, TheTVDB v4, TMDB v3, Fanart.tv v3

## License

MIT — see [LICENSE](LICENSE)
