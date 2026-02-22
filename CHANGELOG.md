# Changelog

## [1.2.2] - 2026-02-22

### Added
- **Search Layout**: Redesigned online search results to use a clean list layout (similar to Spotify) instead of grid cards, including columns for duration and actions.
- **Player Enhancements**: Added a "+" button in the player controls to quickly add the currently playing song to any playlist.
- **Context Menu**: Added full right-click context menu support to online search results and ensured "Add to Playlist" is available everywhere.
- **My Music**: "My Music" now aggregates all songs from your playlists into a single view.
- **Artist Playback**: Playing a song from an artist's page now queues all local songs by that artist.

### Changed
- **UI Consistency**: Unified the look and feel of song lists across Library, Playlists, and Search.

### Fixed
- **Navigation**: Fixed an issue where going back from an artist page would incorrectly redirect to Search.
- **Types**: Fixed a runtime error caused by incorrect type imports.
- **Online Search**: Fixed issues with online artist search and general search by adding robust client ID fallback mechanisms.
