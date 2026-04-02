# Changelog

## v1.1.6

- Search/filter bar is now sticky on library pages so it remains accessible while scrolling.

## v1.1.5

- Fixed scroll restoration properly — the root cause was a CSS layout issue where .app-layout used min-height instead of height, so .scroll-area was never actually the scroll container (the window was). Changed to height: 100vh so .scroll-area has a bounded height and scrolls correctly.

## v1.1.4

- Fixed scroll position restoration (again) — use useLayoutEffect to restore before the browser paints, and a ref to track scroll position so the value saved on unmount is never stale.

## v1.1.3

- Fixed scroll position restoration on back navigation — replaced unreliable save-on-unmount with a continuous scroll listener that persists position to sessionStorage.

## v1.1.2

- Fixed scroll position not restoring when navigating back to the library list.

## v1.1.1

- Fixed TMDB badge not appearing on TV show pages — Sonarr's `tmdbId` was being discarded during sync.

## v1.1.0

- Real-time favourites count in the nav sidebar — increments/decrements instantly when starring or unstarring artwork on the item page or removing from the favourites page, without requiring a full page reload.
- Favourites page now groups artwork by type (backgrounds, posters, banners, logos, etc.) with correct aspect ratios: 16:9 for backgrounds and banners, 1:1 for logos/clearart/disc/icon/characterart, and 2:3 for everything else.
- Resolution badges shown on each favourite card; Fanart.tv images use the proxy thumbnail endpoint and read natural dimensions on load when stored dimensions are absent.

## v1.0.0

- Initial release.
- Docker-contained web app for managing fanart for Sonarr/Radarr media libraries.
- Browse and search your library, fetch artwork from TVDB, TMDB, and Fanart.tv, star favourites, and download them as a zip.
