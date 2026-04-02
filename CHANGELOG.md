# Changelog

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
