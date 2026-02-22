import { app, BrowserWindow, ipcMain, dialog, protocol, net, shell, session } from 'electron';
import path from 'path';
import { pathToFileURL } from 'url';
import { parseFile } from 'music-metadata';
import fs from 'fs';
import mime from 'mime-types';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import DiscordRPC from 'discord-rpc';
import { CONFIG } from '../src/config';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Auto Updater Configuration
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

const sendStatusToWindow = (text: string, data?: any) => {
  log.info(text);
  // @ts-ignore
  if (typeof mainWindow !== 'undefined' && mainWindow) {
    // @ts-ignore
    mainWindow.webContents.send('update-message', { text, data });
  }
};

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.', info);
});

autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.', info);
});

autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message, progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded', info);
  
  // Ask user to install now or later
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'A new version of Songify is ready to install.',
    detail: 'Do you want to install it now? If you choose "Later", it will be installed when you exit the app.',
    buttons: ['Install Now', 'Later'],
    defaultId: 0,
    cancelId: 1
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// IPC Handlers for Auto Update
ipcMain.handle('check-for-updates', () => {
    if (CONFIG.AUTO_UPDATE.ENABLED) {
        autoUpdater.checkForUpdates();
    }
});

ipcMain.handle('download-update', () => {
    autoUpdater.downloadUpdate();
});

ipcMain.handle('quit-and-install', () => {
    autoUpdater.quitAndInstall();
});



// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Discord RPC Setup
const clientId = CONFIG.DISCORD_CLIENT_ID; 
let rpc: DiscordRPC.Client | null = null;

// SoundCloud Auth Cache
let soundcloudToken: string | null = null;
let soundcloudTokenExpiry = 0;
const FALLBACK_PUBLIC_ID = 'CkCiIyf14rHi27fhk7HxhPOzc85okfSJ'; // Working Public ID (2025)

ipcMain.handle('get-soundcloud-token', async () => {
    // Basic caching
    if (soundcloudToken && soundcloudTokenExpiry > Date.now()) {
        return soundcloudToken;
    }

    const scClientId = CONFIG.SOUNDCLOUD_CLIENT_ID;
    const scClientSecret = CONFIG.SOUNDCLOUD_CLIENT_SECRET;

    if (!scClientId || !scClientSecret) {
        console.warn('SoundCloud Client ID or Secret missing in config');
        return null;
    }

    try {
        console.log('Fetching SoundCloud access token...');
        const response = await fetch('https://secure.soundcloud.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json; charset=utf-8'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: scClientId,
                client_secret: scClientSecret
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('SoundCloud auth failed:', response.status, errorText);
            return null;
        }

        const data = await response.json();
        soundcloudToken = data.access_token;
        // Expires in seconds, convert to ms, subtract a buffer (e.g. 5 mins)
        soundcloudTokenExpiry = Date.now() + ((data.expires_in || 3600) * 1000) - 300000;
        
        console.log('SoundCloud token acquired successfully');
        return soundcloudToken;
    } catch (error) {
        console.error('SoundCloud auth error:', error);
        return null;
    }
});

ipcMain.handle('get-soundcloud-client-id', () => {
    return CONFIG.SOUNDCLOUD_CLIENT_ID;
});

// Helper for SoundCloud Requests
async function getSoundCloudTokenInternal() {
    if (soundcloudToken && soundcloudTokenExpiry > Date.now()) {
        return soundcloudToken;
    }

    const scClientId = CONFIG.SOUNDCLOUD_CLIENT_ID;
    const scClientSecret = CONFIG.SOUNDCLOUD_CLIENT_SECRET;

    if (!scClientId || !scClientSecret) return null;

    try {
        const response = await fetch('https://secure.soundcloud.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json; charset=utf-8'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: scClientId,
                client_secret: scClientSecret
            })
        });

        if (!response.ok) return null;

        const data = await response.json();
        soundcloudToken = data.access_token;
        soundcloudTokenExpiry = Date.now() + ((data.expires_in || 3600) * 1000) - 300000;
        return soundcloudToken;
    } catch (error) {
        console.error('SoundCloud auth error:', error);
        return null;
    }
}

// Helper to scrape a fresh Client ID from SoundCloud homepage
async function scrapeClientId(): Promise<string | null> {
    try {
        const response = await fetch('https://soundcloud.com/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = await response.text();
        const scriptUrls = (html.match(/<script[^>]+src="([^"]+)"/g) || [])
            .map(s => s.match(/src="([^"]+)"/)?.[1])
            .filter(u => u && (u.includes('sndcdn.com/assets/') || u.includes('sndcdn.com/app')));

        for (const url of scriptUrls) {
            if (!url) continue;
            try {
                const scriptRes = await fetch(url);
                const scriptText = await scriptRes.text();
                const match = scriptText.match(/client_id:"([a-zA-Z0-9]{32})"/) || scriptText.match(/client_id=([a-zA-Z0-9]{32})/);
                if (match) return match[1];
            } catch (e) {
                // Ignore error
            }
        }
    } catch (e) {
        console.error('Error scraping Client ID:', e);
    }
    return null;
}

// Helper to resolve stream via hydration (fallback)
async function resolveViaHydration(permalinkUrl: string): Promise<string | null> {
    try {
        console.log(`[SoundCloud] Attempting hydration fallback for: ${permalinkUrl}`);
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://soundcloud.com/',
            'Origin': 'https://soundcloud.com'
        };

        const response = await fetch(permalinkUrl, { headers });
        
        if (!response.ok) return null;
        
        const html = await response.text();
        const match = html.match(/window\.__sc_hydration\s*=\s*(\[.*?\]);/);
        
        let trackData = null;
        let clientId = null;

        if (match) {
            const data = JSON.parse(match[1]);
            const apiClient = data.find((item: any) => item.hydratable === 'apiClient');
            clientId = apiClient?.data?.client_id || apiClient?.data?.id;
            trackData = data.find((item: any) => item.hydratable === 'sound')?.data;
        }

        // If hydration lacks track data, try API resolve with the ID we found
        if (!trackData || !trackData.media || !trackData.media.transcodings) {
            console.log('[SoundCloud] Hydration incomplete, trying API resolve...');
            
            if (!clientId) {
                clientId = await scrapeClientId() || FALLBACK_PUBLIC_ID;
            }

            // Try /resolve first
            const resolveUrl = `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(permalinkUrl)}&client_id=${clientId}`;
            console.log(`[SoundCloud] Resolving via API: ${resolveUrl}`);
            
            let resolveRes = await fetch(resolveUrl, { headers });

            // If resolve failed, try scraping a FRESH client ID and retry
            if (!resolveRes.ok) {
                console.warn(`[SoundCloud] API Resolve failed (${resolveRes.status}). Trying fresh scrape...`);
                const freshId = await scrapeClientId();
                if (freshId && freshId !== clientId) {
                     clientId = freshId;
                     const retryUrl = `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(permalinkUrl)}&client_id=${clientId}`;
                     resolveRes = await fetch(retryUrl, { headers });
                }
            }

            let resolvedData = null;
            if (resolveRes.ok) {
                resolvedData = await resolveRes.json();
            } else {
                 // Fallback: Search for the track using the permalink parts
                 console.log('[SoundCloud] Resolve failed. Trying search fallback...');
                 // Extract parts from permalink: soundcloud.com/user/title -> "user title"
                 const parts = permalinkUrl.split('/').filter(Boolean); 
                 const query = parts.slice(-2).join(' ').replace(/-/g, ' ');
                 
                 const searchUrl = `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(query)}&client_id=${clientId}&limit=5`;
                 console.log(`[SoundCloud] Searching: ${searchUrl}`);
                 
                 const searchRes = await fetch(searchUrl, { headers });
                 
                 if (searchRes.ok) {
                     const searchData = await searchRes.json();
                     // Try to find exact match by permalink
                     resolvedData = searchData.collection.find((t: any) => t.permalink_url === permalinkUrl);
                     
                     if (!resolvedData && searchData.collection.length > 0) {
                         console.log('[SoundCloud] Using first search result as fallback');
                         resolvedData = searchData.collection[0];
                     }
                 }
            }
            
            if (resolvedData) {
                trackData = resolvedData;
            }
        }

        // Process Track Data (from Hydration or API/Search)
        if (trackData && trackData.media && trackData.media.transcodings) {
             const transcodings = trackData.media.transcodings;
             
             // Sort transcodings: HLS MP3 > HLS Opus > Progressive > Others
             const sortedTranscodings = transcodings.sort((a: any, b: any) => {
                 const getScore = (t: any) => {
                     if (t.format.protocol === 'hls' && t.format.mime_type.includes('mpeg')) return 3;
                     if (t.format.protocol === 'hls' && t.format.mime_type.includes('opus')) return 2;
                     if (t.format.protocol === 'progressive') return 1;
                     return 0;
                 };
                 return getScore(b) - getScore(a);
             });

             // Get Client ID (scrape if needed, or use fallback)
             if (!clientId) {
                  clientId = await scrapeClientId() || FALLBACK_PUBLIC_ID;
             }

             // Try each transcoding until one works
             for (const transcoding of sortedTranscodings) {
                 let url = transcoding.url;
                 const separator = url.includes('?') ? '&' : '?';
                 url += `${separator}client_id=${clientId}`;
                 
                 if (trackData.track_authorization) {
                     url += `&track_authorization=${trackData.track_authorization}`;
                 }

                 console.log(`[SoundCloud] Testing transcoding: ${transcoding.format.protocol} (${transcoding.format.mime_type})`);
                 
                 try {
                     const streamRes = await fetch(url, { headers });
                     if (streamRes.ok) {
                         const streamData = await streamRes.json();
                         console.log(`[SoundCloud] Success! Stream URL: ${streamData.url}`);
                         return streamData.url;
                     }

                     // If failed with track_authorization, try without it
                     if (url.includes('track_authorization')) {
                         console.log('[SoundCloud] Retrying without track_authorization...');
                         const urlObj = new URL(url);
                         urlObj.searchParams.delete('track_authorization');
                         const noAuthUrl = urlObj.toString();
                         
                         const noAuthRes = await fetch(noAuthUrl, { headers });
                         if (noAuthRes.ok) {
                             const streamData = await noAuthRes.json();
                             console.log(`[SoundCloud] Success (No Auth)! Stream URL: ${streamData.url}`);
                             return streamData.url;
                         }
                     }
                 } catch (e) {
                     console.warn(`[SoundCloud] Transcoding failed: ${e}`);
                 }
             }
        }
        
        return null;
    } catch (e) {
        console.error('Error in hydration fallback:', e);
        return null;
    }
}

ipcMain.handle('soundcloud-search', async (_, query) => {
    const token = await getSoundCloudTokenInternal();
    
    let url = `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(query)}&limit=50`;
    const headers: Record<string, string> = {};

    let clientId = CONFIG.SOUNDCLOUD_CLIENT_ID || FALLBACK_PUBLIC_ID;

    if (token) {
        headers['Authorization'] = `OAuth ${token}`;
    } else {
        url += `&client_id=${clientId}`;
    }

    try {
        let response = await fetch(url, { headers });

        if (!response.ok && !token) {
             console.warn(`SoundCloud search failed with ID ${clientId}. Trying scraped ID...`);
             const scrapedId = await scrapeClientId();
             if (scrapedId && scrapedId !== clientId) {
                 url = url.replace(`client_id=${clientId}`, `client_id=${scrapedId}`);
                 response = await fetch(url, { headers });
             } else if (clientId !== FALLBACK_PUBLIC_ID) {
                 // Try fallback if scraped failed or same as current
                 url = url.replace(`client_id=${clientId}`, `client_id=${FALLBACK_PUBLIC_ID}`);
                 response = await fetch(url, { headers });
             }
        }

        if (!response.ok) {
            console.error('SoundCloud search failed:', response.status);
            return [];
        }

        const data = await response.json();
        
        // Sort by playback count (popularity) descending
        if (data.collection && Array.isArray(data.collection)) {
            data.collection.sort((a: any, b: any) => (b.playback_count || 0) - (a.playback_count || 0));
        }

        return data.collection || [];
    } catch (error) {
        console.error('SoundCloud search error:', error);
        return [];
    }
});

ipcMain.handle('soundcloud-artist-tracks', async (_, artistName) => {
    const token = await getSoundCloudTokenInternal();
    const headers: Record<string, string> = {};

    if (token) {
        headers['Authorization'] = `OAuth ${token}`;
    }

    let clientId = CONFIG.SOUNDCLOUD_CLIENT_ID || FALLBACK_PUBLIC_ID;

    try {
        // 1. Search for the user first
        let userSearchUrl = `https://api-v2.soundcloud.com/search/users?q=${encodeURIComponent(artistName)}&limit=1`;
        
        if (!token) {
            userSearchUrl += `&client_id=${clientId}`;
        }

        let userRes = await fetch(userSearchUrl, { headers });
        
        // Retry with scraped ID if initial request fails
        if (!userRes.ok && !token) {
             console.warn(`SoundCloud user search failed with ID ${clientId}. Trying scraped ID...`);
             const scrapedId = await scrapeClientId();
             
             if (scrapedId && scrapedId !== clientId) {
                 userSearchUrl = userSearchUrl.replace(`client_id=${clientId}`, `client_id=${scrapedId}`);
                 userRes = await fetch(userSearchUrl, { headers });
                 if (userRes.ok) clientId = scrapedId;
             } else if (clientId !== FALLBACK_PUBLIC_ID) {
                 // Try fallback if scraped failed or same as current
                 userSearchUrl = userSearchUrl.replace(`client_id=${clientId}`, `client_id=${FALLBACK_PUBLIC_ID}`);
                 userRes = await fetch(userSearchUrl, { headers });
                 if (userRes.ok) clientId = FALLBACK_PUBLIC_ID;
             }
        }
        
        if (!userRes.ok) return [];
        
        const userData = await userRes.json();
        const user = userData.collection?.[0];
        
        if (!user) return [];

        // 2. Get user's tracks
        let tracksUrl = `https://api-v2.soundcloud.com/users/${user.id}/tracks?limit=50`;
        
        if (!token) {
             tracksUrl += `&client_id=${clientId}`;
        }

        let tracksRes = await fetch(tracksUrl, { headers });
        
        // Retry logic for tracks (if somehow the ID expired between calls or was bad for tracks)
        if (!tracksRes.ok && !token) {
             const scrapedId = await scrapeClientId();
             if (scrapedId && scrapedId !== clientId) {
                 tracksUrl = tracksUrl.replace(`client_id=${clientId}`, `client_id=${scrapedId}`);
                 tracksRes = await fetch(tracksUrl, { headers });
             }
        }
        
        if (!tracksRes.ok) return [];
        
        const tracksData = await tracksRes.json();
        
        // Sort by popularity (playback_count)
        if (tracksData.collection && Array.isArray(tracksData.collection)) {
            tracksData.collection.sort((a: any, b: any) => (b.playback_count || 0) - (a.playback_count || 0));
        }
        
        return tracksData.collection || [];
    } catch (error) {
        console.error('SoundCloud artist tracks error:', error);
        return [];
    }
});

ipcMain.handle('soundcloud-stream', async (_, transcodingUrl, permalinkUrl?: string) => {
    const token = await getSoundCloudTokenInternal();
    
    // Helper to add/replace client_id
    const withClientId = (u: string, id: string) => {
        try {
            const urlObj = new URL(u);
            urlObj.searchParams.set('client_id', id);
            return urlObj.toString();
        } catch (e) {
            return u;
        }
    };

    // Helper to remove track_authorization
    const withoutAuth = (u: string) => {
        try {
            const urlObj = new URL(u);
            urlObj.searchParams.delete('track_authorization');
            return urlObj.toString();
        } catch (e) {
            return u;
        }
    };

    let url = transcodingUrl;
    const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://soundcloud.com/',
        'Origin': 'https://soundcloud.com'
    };

    // Strategy 1: Use OAuth Token (if available)
    if (token) {
        headers['Authorization'] = `OAuth ${token}`;
    } else {
        // Strategy 2: Use Public Client ID immediately if no token
        url = withClientId(url, FALLBACK_PUBLIC_ID);
    }

    try {
        console.log(`[SoundCloud] Stream resolving (Strategy 1): ${url}`);
        let response = await fetch(url, { headers });
        
        if (response.ok) {
             const data = await response.json();
             console.log(`[SoundCloud] Stream resolved: ${data.url}`);
             return data.url;
        }

        console.warn(`[SoundCloud] Strategy 1 failed (${response.status}). Retrying with Public ID...`);

        // Strategy 3: Retry with Public ID (strip OAuth)
        delete headers['Authorization'];
        // Reset URL to base transcoding URL but with client_id
        url = withClientId(transcodingUrl, FALLBACK_PUBLIC_ID);
        
        console.log(`[SoundCloud] Stream resolving (Strategy 3): ${url}`);
        response = await fetch(url, { headers });

        if (response.ok) {
             const data = await response.json();
             console.log(`[SoundCloud] Stream resolved (Public ID): ${data.url}`);
             return data.url;
        }

        // Strategy 4: Retry without track_authorization (and with Public ID)
        if (url.includes('track_authorization')) {
            console.warn(`[SoundCloud] Strategy 3 failed (${response.status}). Retrying without track_authorization...`);
            url = withoutAuth(url);
            console.log(`[SoundCloud] Stream resolving (Strategy 4): ${url}`);
            response = await fetch(url, { headers });

            if (response.ok) {
                const data = await response.json();
                console.log(`[SoundCloud] Stream resolved (No Auth): ${data.url}`);
                return data.url;
            }
        }
        
        console.warn(`[SoundCloud] All API strategies failed for ${transcodingUrl}`);

        // Strategy 5: Hydration Fallback (if permalink available)
        if (permalinkUrl) {
            console.log(`[SoundCloud] Attempting Strategy 5: Hydration Fallback for ${permalinkUrl}`);
            const hydrationStream = await resolveViaHydration(permalinkUrl);
            if (hydrationStream) {
                console.log(`[SoundCloud] Stream resolved via hydration!`);
                return hydrationStream;
            }
        } else {
            console.warn('[SoundCloud] No permalink URL available for hydration fallback');
        }
        
        return null;

    } catch (error) {
        console.error('Error resolving stream URL:', error);
        return null;
    }
});

async function connectDiscordRPC() {
    try {
        if (rpc) {
            await rpc.destroy().catch(() => {});
        }
        
        // transport: 'ipc' is standard for desktop apps
        rpc = new DiscordRPC.Client({ transport: 'ipc' });

        rpc.on('ready', () => {
            console.log('Discord RPC connected successfully!');
            // Set initial activity immediately
            rpc?.setActivity({
                details: 'Listening to Music',
                state: 'Idle',
                largeImageKey: 'songify_logo',
                largeImageText: 'Songify',
                instance: false,
                // @ts-ignore
                type: 2 // LISTENING
                
            }).catch(e => console.error('Initial setActivity failed:', e));
        });

        // Add error handler to prevent crashes
        // @ts-ignore
        rpc.on('error', (e) => {
            console.warn('Discord RPC Error:', e);
        });

        rpc.on('disconnected', () => {
             console.log('Discord RPC disconnected. Retrying in 10s...');
             rpc = null;
             setTimeout(connectDiscordRPC, 10000);
        });

        console.log('Attempting to log into Discord RPC...');
        // scopes: ['rpc', 'rpc.api', 'messages.read'] is overkill, default is fine
        await rpc.login({ clientId });
    } catch (err) {
        console.warn('Discord RPC login failed:', err);
        console.log('Retrying Discord RPC in 10s...');
        rpc = null;
        setTimeout(connectDiscordRPC, 10000);
    }
}

// Register protocol and initialize RPC when app is ready
app.whenReady().then(() => {
    // Check for updates on startup and periodically
    if (CONFIG.AUTO_UPDATE.ENABLED && process.env.NODE_ENV !== 'development') {
        const checkUpdates = () => {
             console.log('Checking for updates...');
             autoUpdater.checkForUpdatesAndNotify().catch(e => console.error('Failed to check for updates:', e));
        };

        // Initial check
        checkUpdates();

        // Periodic check (default: every hour)
        const interval = CONFIG.AUTO_UPDATE.CHECK_INTERVAL || 3600000;
        setInterval(checkUpdates, interval);
    }

    // We intentionally SKIP DiscordRPC.register() here as it can be buggy in dev
    // and isn't strictly needed just for Rich Presence (only for joining/invites).
    
    // Start RPC connection loop
    connectDiscordRPC();
});

// Set custom userData path to avoid permission issues with previous installs
app.setPath('userData', path.join(app.getPath('appData'), 'Songify'));

let mainWindow: BrowserWindow | null;
const LYRICS_CACHE_FILE = path.join(app.getPath('userData'), 'lyrics_v2.json');
let lyricsCache: Record<string, string> = {};

// Load lyrics cache
try {
  if (fs.existsSync(LYRICS_CACHE_FILE)) {
    lyricsCache = JSON.parse(fs.readFileSync(LYRICS_CACHE_FILE, 'utf-8'));
  }
} catch (error) {
  console.error('Error loading lyrics cache:', error);
}

// Save lyrics cache
function saveLyricsCache() {
  try {
    const dir = path.dirname(LYRICS_CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LYRICS_CACHE_FILE, JSON.stringify(lyricsCache, null, 2));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('Warning: Could not save lyrics cache (offline mode might be limited):', errorMessage);
  }
}

// Register custom protocol for serving local files
protocol.registerSchemesAsPrivileged([
  { scheme: 'songify', privileges: { secure: true, standard: true, supportFetchAPI: true, bypassCSP: true, stream: true } }
]);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show until ready
    backgroundColor: '#121212', // Match dark theme
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true // Keep true for security, use custom protocol
    },
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
        color: '#000000', // Matches default theme background
        symbolColor: '#ffffff',
        height: 32
    },
    icon: path.join(__dirname, '../src/assets/Songify.png')
  });

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
        mainWindow.show();
    }
  });

  // Intercept requests to SoundCloud and MP3.pm domains to add Referer/Origin headers
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: [
      '*://*.soundcloud.com/*', 
      '*://*.sndcdn.com/*', 
      '*://api-v2.soundcloud.com/*', 
      '*://media.soundcloud.com/*',
      '*://*.mp3.pm/*'
    ] },
    (details, callback) => {
      const url = details.url;
      const headers = { ...details.requestHeaders };
      
      if (url.includes('soundcloud.com') || url.includes('sndcdn.com')) {
        headers['Referer'] = 'https://soundcloud.com/';
        headers['Origin'] = 'https://soundcloud.com';
      } else if (url.includes('mp3.pm')) {
        headers['Referer'] = 'https://mp3.pm/';
        headers['Origin'] = 'https://mp3.pm';
      }
      
      callback({ cancel: false, requestHeaders: headers });
    }
  );

  const devUrl = 'http://localhost:5173';
  const prodUrl = `file://${path.join(__dirname, '../dist/index.html')}`;

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL(devUrl).catch(e => console.error('Failed to load Dev URL:', e));
    mainWindow.webContents.openDevTools();
  } else {
    // In production, the path is relative to dist-electron/electron/main.js
    // We need to go up two levels to reach dist/index.html (dist-electron -> root -> dist)
    // Or if electron-builder packages it differently, usually resources/app.asar/dist/index.html
    const prodPath = path.join(__dirname, '../../dist/index.html');
    console.log('Loading production file:', prodPath);
    mainWindow.loadFile(prodPath).catch(e => {
        console.error('Failed to load File:', e);
        // Fallback to try one level up if structure is flat
        const fallbackPath = path.join(__dirname, '../dist/index.html');
        console.log('Trying fallback path:', fallbackPath);
        if (mainWindow) {
            mainWindow.loadFile(fallbackPath).catch(e2 => console.error('Fallback failed:', e2));
        }
    });
  }

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window finished loading');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Window failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Register protocol to handle local file requests
  protocol.handle('songify', (request) => {
    try {
      // Parse the URL to get the pathname
      const urlObj = new URL(request.url);
      const queryPath = urlObj.searchParams.get('path');
      
      if (!queryPath) {
          console.error('No path provided in query');
          return new Response('No path provided', { status: 400 });
      }

      const decodedPath = decodeURIComponent(queryPath);
      const filePath = path.normalize(decodedPath);
      
      console.log(`Serving audio file: ${filePath}`);
      
      // Get MIME type
      const mimeType = mime.lookup(filePath) || 'audio/mpeg';

      // Handle Range Request manually for seeking support
      const range = request.headers.get('Range');
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;

        const stream = fs.createReadStream(filePath, { start, end });
        
        // Convert Node stream to Web ReadableStream
        const readable = new ReadableStream({
            start(controller) {
                stream.on('data', (chunk) => controller.enqueue(chunk));
                stream.on('end', () => controller.close());
                stream.on('error', (err) => controller.error(err));
            }
        });

        return new Response(readable, {
            status: 206,
            headers: {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize.toString(),
                'Content-Type': mimeType,
                'Access-Control-Allow-Origin': '*',
            }
        });
      } else {
        const stream = fs.createReadStream(filePath);
        // Convert Node stream to Web ReadableStream
        const readable = new ReadableStream({
            start(controller) {
                stream.on('data', (chunk) => controller.enqueue(chunk));
                stream.on('end', () => controller.close());
                stream.on('error', (err) => controller.error(err));
            }
        });

        return new Response(readable, {
            status: 200,
            headers: {
                'Content-Length': fileSize.toString(),
                'Content-Type': mimeType,
                'Accept-Ranges': 'bytes', // Advertise support for ranges
                'Access-Control-Allow-Origin': '*',
            }
        });
      }
    } catch (error) {
      console.error('Protocol error:', error);
      return new Response('Internal Error', { status: 500 });
    }
  });

  // Create Downloads directory
  const downloadsDir = path.join(app.getPath('userData'), 'Downloads');
  try {
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating downloads directory:', error);
  }


  // Discord RPC Handler
  ipcMain.handle('set-activity', async (_, activity) => {
    if (!rpc) {
      // Try to reconnect if RPC is missing but user is asking for update
      console.log('RPC not ready, attempting to reconnect...');
      connectDiscordRPC();
      return;
    }
    try {
      // console.log('Setting activity:', activity); // Debug log
      await rpc.setActivity(activity);
    } catch (error) {
      console.error('Failed to set Discord activity:', error);
    }
  });

  // Online Search Handler (MP3.pm)
  ipcMain.handle('search-online', async (_, query) => {
    try {
      // Clean query for MP3.pm URL structure
      // Format: https://s-{query}.mp3.pm/
      // Query needs to be lowercased, spaces replaced by dashes, special chars removed
      const cleanQuery = query
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .trim()
        .replace(/\s+/g, '-'); // Replace spaces with dashes

      const searchUrl = `https://s-${cleanQuery}.mp3.pm/`;
      console.log(`Searching MP3.pm: ${searchUrl}`);

      const response = await fetch(searchUrl, {
          headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
      });

      if (!response.ok) {
          console.error(`MP3.pm search failed: ${response.status} ${response.statusText}`);
          return [];
      }

      const html = await response.text();
      const results = [];
      
      // Regex to match song items
      // Structure: <li ... data-download-url="..."> ... <i class="cplayer-data-sound-author">Artist</i> ... <b class="cplayer-data-sound-title">Title</b> ... <em class="cplayer-data-sound-time">Time</em>
      const itemRegex = /<li[^>]+class="[^"]*cplayer-sound-item[^"]*"[^>]+data-download-url="([^"]+)"[^>]*>([\s\S]+?)<\/li>/g;
      
      let match;
      while ((match = itemRegex.exec(html)) !== null) {
          let downloadUrl = match[1];
          if (downloadUrl.startsWith('/')) {
              downloadUrl = `https://mp3.pm${downloadUrl}`;
          } else if (!downloadUrl.startsWith('http')) {
               // Relative but no leading slash? unlikely but handle it
              downloadUrl = `https://mp3.pm/${downloadUrl}`;
          }
          const innerHtml = match[2];
          
          const authorMatch = /class="cplayer-data-sound-author">([^<]+)<\/i>/i.exec(innerHtml);
          const titleMatch = /class="cplayer-data-sound-title">([^<]+)<\/b>/i.exec(innerHtml);
          const timeMatch = /class="cplayer-data-sound-time">([^<]+)<\/em>/i.exec(innerHtml);
          
          if (authorMatch && titleMatch) {
              const artist = authorMatch[1].trim();
              const title = titleMatch[1].trim();
              const durationStr = timeMatch ? timeMatch[1].trim() : '00:00';
              
              // Helper to parse duration
              const parts = durationStr.split(':').map(Number);
              let duration = 0;
              if (parts.length === 2) duration = parts[0] * 60 + parts[1];
              else if (parts.length === 3) duration = parts[0] * 3600 + parts[1] * 60 + parts[2];

              results.push({
                  title,
                  artist,
                  duration,
                  thumbnail: '', // MP3.pm doesn't provide thumbnails in list
                  url: downloadUrl
              });
          }
      }
      
      return results;

    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  });

  // Download Song Handler (Direct MP3)
  ipcMain.handle('download-song', async (_, url) => {
    return new Promise(async (resolve) => {
      try {
        console.log(`Downloading: ${url}`);
        
        // Extract filename from URL or use timestamp if invalid
        // URL format: .../Artist_-_Title_(mp3.pm).mp3
        let filename = 'song.mp3';
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            filename = decodeURIComponent(pathParts[pathParts.length - 1]);
        } catch (e) {
            filename = `song-${Date.now()}.mp3`;
        }

        // Ensure it ends with .mp3
        if (!filename.toLowerCase().endsWith('.mp3')) filename += '.mp3';
        
        const filePath = path.join(downloadsDir, filename);
        console.log(`Saving to: ${filePath}`);
        
        const response = await fetch(url, {
             headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://mp3.pm/'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }
        
        if (!response.body) {
             throw new Error('No response body');
        }

        const fileStream = fs.createWriteStream(filePath);
        
        // Convert web stream to Node stream and pipe to file
        // @ts-ignore
        await pipeline(Readable.fromWeb(response.body), fileStream);

        console.log('Download complete');
        resolve({ success: true, path: filePath });

      } catch (error) {
        console.error('Download error:', error);
        resolve({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });
  });

  // Helper to clean strings
  function cleanString(str: string): string {
    return str
      .replace(/\(Official.*Video\)/gi, '')
      .replace(/\(Official.*Audio\)/gi, '')
      .replace(/\(Lyrics\)/gi, '')
      .replace(/\(Lyric.*Video\)/gi, '')
      .replace(/\[Official.*Video\]/gi, '')
      .replace(/\[Official.*Audio\]/gi, '')
      .replace(/\[Lyrics\]/gi, '')
      .replace(/\(Official\)/gi, '')
      .replace(/\[Official\]/gi, '')
      .replace(/\(HQ\)/gi, '')
      .replace(/\(4K\)/gi, '')
      .replace(/\(HD\)/gi, '')
      .replace(/\d+kbps/gi, '')
      .replace(/\(.*\)/g, (match) => match.length > 20 ? '' : match) // Remove long parentheticals that look like junk
      // Remove feat/ft
      .replace(/\(ft\..*\)/gi, '')
      .replace(/\(feat\..*\)/gi, '')
      .replace(/ft\..*/gi, '')
      .replace(/feat\..*/gi, '')
      .trim();
  }

  // Helper to check if strings are similar
  function isSimilar(s1: string, s2: string): boolean {
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const n1 = normalize(s1);
      const n2 = normalize(s2);
      return n1.includes(n2) || n2.includes(n1);
  }

  // Helper to clean up fetched lyrics
  function cleanLyrics(lyrics: string): string {
    if (!lyrics) return '';
    
    return lyrics
        .split('\n')
        .filter(line => {
            const trimLine = line.trim();
            if (!trimLine) return false;
            // Remove metadata tags like [ar:Artist], [ti:Title], [by:Creator], etc.
            if (/^\[(ar|ti|al|by|au|length|offset|re|ve):.*\]/i.test(trimLine)) return false;
            // Remove lines that are just URLs or promotional text
            if (/^(www\.|http:|https:)/i.test(trimLine)) return false;
            if (/Synced by/i.test(trimLine)) return false;
            return true;
        })
        .join('\n');
  }

  // Search Lyrics Handler
  async function fetchNeteaseLyrics(artist: string, title: string): Promise<string | null> {
    try {
      const searchUrl = `http://music.163.com/api/search/get/web?csrf_token=`;
      const searchParams = new URLSearchParams();
      searchParams.append('s', `${title} ${artist}`);
      searchParams.append('type', '1');
      searchParams.append('offset', '0');
      searchParams.append('limit', '5'); // Increase limit to find better match
      searchParams.append('total', 'true');
  
      const searchRes = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'http://music.163.com/'
        },
        body: searchParams
      });
  
      if (!searchRes.ok) return null;
      const searchData = await searchRes.json() as any;
      
      if (!searchData.result || !searchData.result.songs || searchData.result.songs.length === 0) {
        return null;
      }
  
      // Find the best match instead of just taking the first one
      const songs = searchData.result.songs;
      let bestMatch = songs.find((s: any) => 
          s.artists.some((a: any) => isSimilar(a.name, artist)) && isSimilar(s.name, title)
      );
  
      // Fallback to checking just artist on the first result if no perfect match
      if (!bestMatch) {
           const firstSong = songs[0];
           if (firstSong.artists.some((a: any) => isSimilar(a.name, artist))) {
               bestMatch = firstSong;
           }
      }
  
      if (!bestMatch) {
          console.log(`[Netease] No matching song found for ${artist} - ${title}`);
          return null;
      }
  
      const songId = bestMatch.id;
      
      const lyricUrl = `http://music.163.com/api/song/lyric?id=${songId}&lv=1&kv=1&tv=-1`;
      const lyricRes = await fetch(lyricUrl, {
          headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Referer': 'http://music.163.com/'
          }
      });
      
      if (!lyricRes.ok) return null;
      const lyricData = await lyricRes.json() as any;
      
      if (lyricData.lrc && lyricData.lrc.lyric) {
          return lyricData.lrc.lyric;
      }
      
      return null;
    } catch (error) {
      console.error('Netease API error:', error);
      return null;
    }
  }

  ipcMain.handle('search-lyrics', async (_, artist: string, title: string) => {
    try {
      // Clean artist and title for better search results
      const cleanArtist = cleanString(artist);
      const cleanTitle = cleanString(title);
      
      console.log(`Searching lyrics for: ${cleanArtist} - ${cleanTitle} (Original: ${artist} - ${title})`);
      
      const cacheKey = `${cleanArtist.toLowerCase()}-${cleanTitle.toLowerCase()}`;
      if (lyricsCache[cacheKey]) {
        console.log('Found lyrics in cache');
        return lyricsCache[cacheKey];
      }

      // 1. Try LRCLIB (Best source)
      try {
        console.log('Trying LRCLIB (Get)...');
        // Try strict match first
        const lrcResponse = await fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`, {
          headers: { 'User-Agent': 'Songify v0.0.1' }
        });
        
        if (lrcResponse.ok) {
          const lrcData = await lrcResponse.json();
          if (lrcData && (lrcData.syncedLyrics || lrcData.plainLyrics)) {
            console.log('Found lyrics on LRCLIB (Get)');
            let lyrics = lrcData.syncedLyrics || lrcData.plainLyrics;
            lyrics = cleanLyrics(lyrics);
            lyricsCache[cacheKey] = lyrics;
            saveLyricsCache();
            return lyrics;
          }
        } else if (lrcResponse.status === 404) {
             console.log('LRCLIB (Get) not found, trying search...');
             // Try fuzzy search
             const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanArtist + ' ' + cleanTitle)}`;
             const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'Songify v0.0.1' } });
             if (searchRes.ok) {
                 const searchData = await searchRes.json();
                 // Find best match
                 const match = searchData.find((item: any) => 
                     isSimilar(item.artistName, cleanArtist) && isSimilar(item.trackName, cleanTitle)
                 );
                 
                 if (match && (match.syncedLyrics || match.plainLyrics)) {
                    console.log(`Found lyrics on LRCLIB (Search): ${match.trackName} by ${match.artistName}`);
                    let lyrics = match.syncedLyrics || match.plainLyrics;
                    lyrics = cleanLyrics(lyrics);
                    lyricsCache[cacheKey] = lyrics;
                    saveLyricsCache();
                    return lyrics;
                 }
             }
        }
      } catch (e) {
        console.error('LRCLIB error:', e);
      }

      // 2. Try Netease (High Quality / Musixmatch proxy)
      try {
        console.log('Trying Netease (HQ)...');
        let neteaseLyrics = await fetchNeteaseLyrics(cleanArtist, cleanTitle);
        // Verify Netease result (fetchNeteaseLyrics needs to be updated or we check here if we can)
        // Since fetchNeteaseLyrics returns string, we assume it did some checking or we accept it for now as fallback
        if (neteaseLyrics) {
           neteaseLyrics = cleanLyrics(neteaseLyrics);
           lyricsCache[cacheKey] = neteaseLyrics;
           saveLyricsCache();
           return neteaseLyrics;
        }
      } catch (e) {
        console.error('Netease error:', e);
      }

      // 3. Try lyrics.ovh (fallback)
      console.log('Trying lyrics.ovh...');
      const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.lyrics) {
          let lyrics = cleanLyrics(data.lyrics);
          lyricsCache[cacheKey] = lyrics;
          saveLyricsCache();
          return lyrics;
        }
      }
      
      console.log('Lyrics not found in any source');
      return null;
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      return null;
    }
  });

  // Search Metadata Handler (iTunes API)
  ipcMain.handle('search-metadata', async (_, query: string) => {
    try {
      console.log(`Searching metadata for: ${query}`);
      // Use iTunes Search API
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`);
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.resultCount === 0) return null;
      
      const track = data.results[0];
      // Get high-res artwork (replace 100x100 with 600x600)
      const artwork = track.artworkUrl100 ? track.artworkUrl100.replace('100x100', '600x600') : null;
      
      return {
        artist: track.artistName,
        title: track.trackName,
        album: track.collectionName,
        artwork: artwork
      };
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  });

  // Helper function to parse song metadata
  async function parseSong(filePath: string) {
    try {
      const metadata = await parseFile(filePath);
      let lyrics = metadata.common.lyrics ? metadata.common.lyrics.join('\n') : undefined;

      // If no embedded lyrics, check for local .lrc or .txt file
      if (!lyrics) {
        const baseName = path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)));
        const lrcPath = baseName + '.lrc';
        const txtPath = baseName + '.txt';

        if (fs.existsSync(lrcPath)) {
          lyrics = fs.readFileSync(lrcPath, 'utf-8');
        } else if (fs.existsSync(txtPath)) {
          lyrics = fs.readFileSync(txtPath, 'utf-8');
        }
      }

      let artist = metadata.common.artist || 'Unknown Artist';
      let title = metadata.common.title || path.basename(filePath, path.extname(filePath));
      let album = metadata.common.album || 'Unknown Album';
      
      let artwork: string | undefined = undefined;
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        const format = picture.format || 'image/jpeg';
        artwork = `data:${format};base64,${picture.data.toString('base64')}`;
      }

      // Try to parse Artist - Title from filename if metadata is missing
      if (artist === 'Unknown Artist') {
        let baseName = path.basename(filePath, path.extname(filePath));
        
        // Clean up junk from filename (Official Video, Lyrics, etc.)
        baseName = baseName
          .replace(/\(Official.*Video\)/gi, '')
          .replace(/\(Official.*Audio\)/gi, '')
          .replace(/\(Lyrics\)/gi, '')
          .replace(/\(Lyric.*Video\)/gi, '')
          .replace(/\[Official.*Video\]/gi, '')
          .replace(/\[Official.*Audio\]/gi, '')
          .replace(/\[Lyrics\]/gi, '')
          .replace(/\(Official\)/gi, '')
          .replace(/\[Official\]/gi, '')
          .replace(/\(HQ\)/gi, '')
          .replace(/\(4K\)/gi, '')
          .replace(/\(HD\)/gi, '')
          .trim();

        const match = baseName.match(/^(.+?)\s*-\s*(.+)$/);
        if (match) {
          artist = match[1].trim();
          title = match[2].trim();
        } else {
            // If no hyphen, treat whole cleaned name as title
            title = baseName;
        }
      }

      return {
        path: filePath,
        title: title,
        artist: artist,
        album: album,
        duration: metadata.format.duration || 0,
        lyrics: lyrics,
        artwork: artwork,
      };
    } catch (error) {
      console.error(`Error parsing metadata for ${filePath}:`, error);
      // Fallback
      return {
        path: filePath,
        title: path.basename(filePath, path.extname(filePath)),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: 0,
        artwork: undefined,
      };
    }
  }

  // IPC Handlers
  ipcMain.handle('select-music', async () => {
    if (!mainWindow) return null;
    
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'webm'] }]
    });

    if (result.canceled) return [];

    const songs = [];
    for (const filePath of result.filePaths) {
      songs.push(await parseSong(filePath));
    }
    return songs;
  });

  // Get single song metadata (used after download)
  ipcMain.handle('get-song', async (_, filePath) => {
    return await parseSong(filePath);
  });

  // Delete Song Handler
  ipcMain.handle('delete-song', async (_, filePath: string) => {
    try {
      console.log(`Deleting file permanently: ${filePath}`);
      if (fs.existsSync(filePath)) {
        // Permanent delete as requested
        fs.unlinkSync(filePath);
      }
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  });

  // Get User Data Path
  ipcMain.handle('get-user-data-path', () => {
    return app.getPath('userData');
  });

  // Get App Version
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // Get Changelog
  ipcMain.handle('get-changelog', () => {
    try {
      const changelogPath = path.join(__dirname, '../../CHANGELOG.md');
      if (fs.existsSync(changelogPath)) {
        return fs.readFileSync(changelogPath, 'utf-8');
      }
      return '# Changelog\n\nNo changelog available.';
    } catch (error) {
      console.error('Error reading changelog:', error);
      return '# Changelog\n\nFailed to load changelog.';
    }
  });

  // Open External Link
  ipcMain.handle('open-external', async (_, url) => {
    await shell.openExternal(url);
  });

  // Show in Folder Handler
  ipcMain.handle('show-in-folder', async (_, filePath) => {
    shell.showItemInFolder(filePath);
  });

  // Open Path Handler
  ipcMain.handle('open-path', async (_, pathString) => {
    try {
        await shell.openPath(pathString);
        return true;
    } catch (e) {
        console.error('Error opening path:', e);
        return false;
    }
  });

  // Get Downloads Path
  ipcMain.handle('get-downloads-path', () => {
    return path.join(app.getPath('userData'), 'Downloads');
  });

  // Library Persistence
  const LIBRARY_FILE = path.join(app.getPath('userData'), 'library_v2.json');
  
  ipcMain.handle('save-library', async (_, data: { songs: any[], playlists: any[] }) => {
    try {
      fs.writeFileSync(LIBRARY_FILE, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving library:', error);
      return false;
    }
  });

  ipcMain.handle('load-library', async () => {
    try {
      if (fs.existsSync(LIBRARY_FILE)) {
        const data = fs.readFileSync(LIBRARY_FILE, 'utf-8');
        return JSON.parse(data);
      }
      return { songs: [], playlists: [] };
    } catch (error) {
      console.error('Error loading library:', error);
      return { songs: [], playlists: [] };
    }
  });

  // Clear Cache Handler
  ipcMain.handle('clear-cache', async () => {
    try {
      console.log('Clearing lyrics cache...');
      if (fs.existsSync(LYRICS_CACHE_FILE)) {
        fs.unlinkSync(LYRICS_CACHE_FILE);
      }
      lyricsCache = {};
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
