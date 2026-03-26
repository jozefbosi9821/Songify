# Changelog

## [1.3.3] - 2026-03-26

### Fixed
- **Bugs**: Many Bug Fixes that included Profile not loading sometimes and also random glitches in audio

### Changed
- **UI Redesign**: We have made many changes to make the UI feel more polished and make it better for every user on the platform
- **API**: We have also updated our API so it doesnt error for users from certain ISPs

## [1.3.2] - 2026-02-23

### Added
- **User Profile**: A dedicated profile page displaying detailed listening statistics, including top songs, top artists, total play time, and activity charts.
- **Global Stats**: Added a "Global Stats" tab to the user profile to see community-wide top songs and artists.
- **Zoom Controls**: Added `Ctrl+` and `Ctrl-` shortcuts for zooming in and out.
- **UI Improvements**: Enhanced the visual design of User Menu and User Profile pages.

### Changed
- **Changelog UI**: A completely redesigned changelog modal that automatically parses markdown into structured sections (Added, Fixed, etc.) with colorful badges and supports browsing previous version history.
- **Update Modal UI**: Improved the look and feel of the update modal, including a progress bar and more detailed release notes.

## [1.3.1] - 2026-02-23

### Fixed
- We couldnt release this version because of a github bug

## [1.3.0] - 2026-02-22

### Added
- **Smart Recommendations**: Automatically play similar songs when your queue ends, powered by SoundCloud related tracks.
- **Autoplay Settings**: New toggle in Settings to enable/disable autoplay recommendations.
- **Liked Songs Lockdown**: The "Liked Songs" playlist is now permanent (non-deletable), has a distinctive heart icon, and cannot be renamed or customized, ensuring a consistent experience.

### Fixed
- **User Interface**: Fixed an issue where the User Menu would flicker or flash repeatedly while music was playing.

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