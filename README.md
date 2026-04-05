# Fanarrt

A self-hosted, Docker-contained web app for managing fanart for your Sonarr/Radarr media library.

## Features

- **Library Sync** — Imports TV shows, movies, and anime from Sonarr and Radarr
- **Fanart Browsing** — Pulls artwork from TheTVDB, TMDB, Fanart.tv, and AniList per title
- **Provider & Resolution Filtering** — Filter artwork by source and resolution (HD, FHD, 4K)
- **Collections** — Organise favourites into multiple named collections
- **Batch Download** — Download as a ZIP: per title, current filtered view, or entire collection
- **Item Navigation** — Browse prev/next items alphabetically without returning to the library
- **Poster Cache** — Library thumbnails cached locally for fast loads
- **Clean UI** — Dark, modern interface with lightbox viewer, art type tabs, and letter jump nav

---

## Installation

### Docker Compose (recommended)

Create a `docker-compose.yml` with the following content:

```yaml
services:
  fanarrt:
    image: incredibad/fanarrt:latest
    container_name: fanarrt
    ports:
      - "3579:3579"
    volumes:
      - fanarrt-data:/app/data
      - fanarrt-downloads:/app/downloads
    environment:
      - PORT=3579
    restart: unless-stopped


volumes:
  fanarrt-data:
  fanarrt-downloads:
```

Then run:

```bash
docker compose up -d
```

### Docker Run

```bash
docker run -d \
  --name fanarrt \
  --restart unless-stopped \
  -p 3579:3579 \
  -v fanarrt-data:/app/data \
  -v fanarrt-downloads:/app/downloads \
  incredibad/fanarrt:latest
```

Open **http://your-server:3579** — you'll be prompted to create an admin account.

### Updating

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

## Data Persistence

| Volume | Contents |
|---|---|
| `fanarrt-data` | SQLite database, session secret, image caches |
| `fanarrt-downloads` | Reserved for future use |

Volumes survive `docker compose pull && docker compose up -d` updates.

---

## Tech Stack

- **Backend**: Node.js, Express, SQLite (better-sqlite3), Archiver
- **Frontend**: React 18, React Router, Vite, Lucide icons
- **APIs**: Sonarr v3, Radarr v3, TheTVDB v4, TMDB v3, Fanart.tv v3

## License

MIT — see [LICENSE](LICENSE)
