# Changelog

## [1.3.6] - 2026-06-21

### Security (Major Update)
- **Password Strength Requirements**: Passwords now require 8+ characters, uppercase, lowercase, number, and special character (!@#$%^&*)
- **Rate Limiting**: Implemented brute force protection with 5 login attempt limit per 15 minutes (backend)
- **JWT Improvements**: Shortened access token expiration to 15 minutes with secure refresh token flow (7 days)
- **Email Verification**: New users must verify their email before accessing the platform
- **Session Management**: Track active sessions per device and invalidate old sessions on password change
- **Password Reset**: Secure token-based password recovery with 1-hour expiration tokens
- **Account Protection**: All refresh tokens revoked on password change or reset
- **Environment Variables**: JWT secrets now required in environment variables (not optional defaults)
- **Secure Storage**: Added secure storage using Electron's keytar to store authentication tokens instead of localStorage
- **Content Security Policy (CSP)**: Added via meta tags in index.html
- **Input Sanitization**: Added XSS sanitization for all user inputs

### Added
- Email verification flow for new accounts
- Password reset functionality
- Refresh token system for secure session management
- Session tracking per device
- Login attempt rate limiting
- Back/forward navigation with history tracking
- Entire titlebar now draggable (except interactive elements)
- Back/forward buttons in custom titlebar
- Password strength indicator in Auth Modal
- Confirm password field during registration

### Changed
- **Login Response**: Now returns `accessToken` (15m) and `refreshToken` (7d) instead of single long-lived token
- **Registration**: Requires email address and enforces strong password policies
- **Auth Flow**: Updated entire authentication system to use secure storage instead of localStorage
- **API Service**: Refactored api.ts to use async/await, refresh tokens, and secure storage

### Breaking Changes
- Clients must update to use new token system (accessToken + refreshToken)
- Old single-token authentication no longer works
- All users must re-login after this update
- Password requirements are now enforced for all new and changed passwords

## [1.3.5] - 2026-7-1

### Changed
- **Backend**: Moved Songify Servers to another region.

## [1.3.4] - 2026-03-26

### Fixed
- **Account System**: A bug where u had to relogin everytime you opened the app.
- **Stats Leaderboard**: Fixed an issue where the Stats Leaderboard wasnt loading at all

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