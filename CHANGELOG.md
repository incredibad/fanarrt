# Changelog

All notable changes are documented here, newest first.

---

## [1.12.7] — 2026-04-06

### Changed
- README: expanded AI disclaimer with author's note on intent, security auditing, and recommended precautions for security-conscious users

---

## [1.12.6] — 2026-04-06

### Security
- Added `SECURE_COOKIES=1` environment variable: when set, session cookies are flagged `Secure` so browsers never transmit them over plain HTTP — recommended for deployments behind an HTTPS reverse proxy (Nginx, Caddy, Traefik)
- Added `trust proxy` so the real client IP (from `X-Forwarded-For`) is used for rate-limiting rather than the proxy's IP
- Global error handler no longer echoes internal error messages or stack traces to the client; errors are logged server-side only

---

## [1.12.5] — 2026-04-06

### Removed
- Sonarr/Radarr instance badge from item hero (shown without a link — will be re-added properly with deep links in a future release; see TODO #12)

---

## [1.12.4] — 2026-04-06

### Added
- AniList badge link in the item hero for anime — shown when AniList is enabled in settings; the AniList ID is stored on first fanart fetch (or next auto-refresh for existing items)

### Changed
- DB migration: `anilist_id` column added to `media_items`; populated automatically when AniList fanart is fetched

---

## [1.12.3] — 2026-04-06

### Changed
- Backfilled CHANGELOG for versions 1.11.6–1.12.2; added changelog update rule to CLAUDE.md

---

## [1.12.2] — 2026-04-06

### Fixed
- Download All and Download Favourites buttons on the item page are now amber/yellow on desktop as well as mobile

---

## [1.12.1] — 2026-04-06

### Fixed
- Mobile item page: poster hidden in the hero header to free up space for title and actions
- Download All and Download Favourites sit side-by-side at 50 % width each on mobile, styled in amber/yellow
- Filters on the item page collapse into an accordion on mobile (default closed), matching the favourites page behaviour

---

## [1.12.0] — 2026-04-06

### Added
- Collapsible **Titles** and **Filters** accordions on the favourites page for mobile — both default to closed, with chevron-in-circle icons that rotate on expand; Download View button always visible below the accordions
- Download View button styled in amber/yellow on all screen sizes

### Fixed
- Fanart grid was invisible in favourites on mobile — the sidebar's `width: 100%` rule was collapsing the grid panel to zero width in the row-flex layout; fixed by switching to a column layout on mobile
- Filter chips on the favourites page are now left-aligned on mobile (were centred)
- Download View button moved above the filter chip rows on mobile for easier reach

---

## [1.11.6] — 2026-04-06

### Added
- App version number displayed in the sidebar footer and on the Settings → System tab

---

## [1.11.0] — 2026-04-06

### Security
- Image proxy now enforces a strict domain allowlist — only known CDN hostnames (TVDB, TMDB, Fanart.tv, AniList) are permitted, preventing SSRF attacks
- Proxy rejects responses that are not `image/*` content-type; cached files capped at 20 MB
- Login and account setup endpoints limited to 10 requests per 15 minutes per IP (rate limiting)
- Session ID is regenerated after successful login and account creation (session fixation fix)
- Added `helmet` for standard security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, etc.)
- Removed string interpolation of `collection_id` in library SQL — now fully parameterized
- Collection names capped at 100 characters on create and rename
- Removed overly permissive CORS (frontend is served from the same origin in production)

---

## [1.10.x] — 2026-03 – 2026-04-05

### Added
- **Prev/next item navigation** — chevron buttons in the top-right of the item hero let you browse alphabetically through the current library without going back to the list; scoped to whichever library section you came from (All, TV, Movies, Anime) and the active collection
- **Anime library** — anime split into its own sidebar entry and library page
- **Anime in favourites filter** — Anime tab added alongside All / TV / Movies on the favourites page
- **AniList fanart source** — optional toggle in Settings; uses the anime-lists TVDB→MAL mapping for accurate ID lookup, with fuzzy title search as a fallback
- **Resolution filters** — HD / FHD / 4K filter chips on item and favourites pages; matches exact standard dimensions rather than minimums
- **Default filters per media type** — configurable default art type, source, and resolution saved per library type in settings
- **Title on hover in favourites** — media title appears as a small pill overlay (top-left) when hovering a favourite thumbnail; also shown persistently in the lightbox top-left
- Distinct empty states for "no artwork fetched yet" vs "filters produced no results"
- Language code badges on fanart thumbnails, with full language name expansion in the lightbox

### Changed
- Filter bar split into two rows — art type tabs on top, provider and resolution chips below
- Category tabs restyled as larger, more visually distinct chips
- Section headers (Backgrounds, Posters, Banners, etc.) significantly enlarged with a bottom border separator for easier scanning
- Collection names in the sidebar truncated at 24 characters with ellipsis; full name shown on hover
- "No results" empty state icon changed from a star to a Ban (circle-slash) icon
- Download View button repositioned to the top-right of the filter bar

### Fixed
- All art type tabs always visible regardless of which types have content
- Provider filter chips based on which API keys are configured, not which sources happen to have content
- Active nav item correctly highlighted when navigating from favourites into an item page
- AniList fanart excluded from results when the AniList toggle is disabled

---

## [1.9.0]

### Added
- Per-type provider priority order — configure preferred fanart source order separately for shows, movies, and anime
- System tab in Settings with a Danger Zone containing purge actions (clear cache, reset fanart data)
- Settings auto-save on change (no save button required)

---

## [1.8.x]

### Added
- **AniList fanart source** — poster and banner artwork for anime titles via the AniList API
- Language code badges on fanart thumbnails; full language name shown in the lightbox
- Download All button on item pages

### Changed
- Structured zip download filenames — `title-type-provider-res-lang-001.jpg` format
- Resolution labels (HD / FHD / 4K) on thumbnails restricted to backgrounds and banners only

### Fixed
- Auto-fetch triggered correctly when AniList is enabled after the initial fanart fetch
- Filename counter resets per title in view downloads; counter only increments on actual name collisions

---

## [1.3.0]

### Added
- Floating refresh FAB on mobile item pages

### Fixed
- Mobile filter bar spacing and full-width action buttons
- Hero backdrop uses full-size image with correct cover sizing
- FAB portalled to document body to escape overflow clipping

---

## [1.2.1]

### Changed
- Flat collection list in the sidebar replaces the previous accordion style
- Collection rename and delete accessible via a ⋮ menu on the favourites page header

---

## [1.2.0]

### Added
- **Collections system** — replaced the single favourites list with multiple named collections; artwork can belong to multiple collections simultaneously
- Collection picker on thumbnail overlays and the lightbox — add artwork to any collection without switching the active one
- Inline new collection creation from the sidebar
- Delete collection confirmation modal showing how many items will be removed

### Changed
- Star badges on library cards and item pages reflect the active collection only
- Active collection highlighted in a distinct amber colour in the sidebar
- Default collection "My Favourites" created automatically on first launch

---

## [1.1.11]

### Changed
- Download zip filenames now use the format `title_type_001.jpg` (3-digit zero-padded counter, flat structure)

---

## [1.1.10]

### Changed
- Settings page reorganised into three tabs: Media Servers, Providers, and Account

---

## [1.1.9]

### Fixed
- Banner thumbnails use a 16:3 aspect ratio with `object-fit: contain` so the full banner is always visible; wider grid columns for banners

---

## [1.1.8]

### Fixed
- Provider sort order not being respected — `settings.get()` already JSON-parses stored values; double-parsing was coercing the array to a string silently

---

## [1.1.7]

### Fixed
- Library sort ignores leading "The", "A", and "An" — e.g. "The Wire" now sorts under W

---

## [1.1.6]

### Fixed
- Search and filter bar is now sticky on library pages

---

## [1.1.5]

### Fixed
- Scroll areas now correctly scroll — root cause was `.app-layout` using `min-height` instead of `height`, so the window was the scroll container rather than `.scroll-area`

---

## [1.1.4]

### Fixed
- Scroll position restoration uses `useLayoutEffect` to restore before browser paint; ref used to track position so the value saved on unmount is never stale

---

## [1.1.3]

### Fixed
- Scroll position restoration — replaced save-on-unmount with a continuous scroll listener persisting to `sessionStorage`

---

## [1.1.2]

### Fixed
- Scroll position not restoring when navigating back to the library list

---

## [1.1.1]

### Fixed
- TMDB badge not appearing on TV show pages — Sonarr's `tmdbId` was being discarded during sync

---

## [1.1.0]

### Added
- Real-time favourite count in the sidebar — updates instantly when starring or unstarring artwork, without a page reload
- Favourites page groups artwork by type (backgrounds, posters, banners, logos, etc.) with correct aspect ratios
- Resolution badges on favourite cards

---

## [1.0.0] — Initial release

- Docker-contained web app for managing fanart for Sonarr and Radarr media libraries
- Browse and search your library; fetch artwork from TheTVDB, TMDB, and Fanart.tv
- Star favourites and download them as a ZIP
- Dark UI with lightbox viewer, type filtering, and letter-jump navigation
- Poster cache for fast library thumbnail loads
