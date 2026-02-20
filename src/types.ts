export interface Song {
  path: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  lyrics?: string;
  artwork?: string;
  isOnline?: boolean;
  streamUrl?: string;
  soundcloudId?: number;
  permalink?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverPath?: string;
  songs: string[]; // Array of song paths
  createdAt: number;
}

export interface ElectronAPI {
  selectMusic: () => Promise<Song[]>;
  searchLyrics: (artist: string, title: string) => Promise<string | null>;
  searchMetadata: (query: string) => Promise<{ artist: string; title: string; album: string; artwork?: string } | null>;
  clearCache: () => Promise<boolean>;
  saveLibrary: (data: { songs: Song[], playlists: Playlist[] }) => Promise<boolean>;
  loadLibrary: () => Promise<{ songs: Song[], playlists: Playlist[] }>;
  searchOnline: (query: string) => Promise<{ title: string; artist: string; duration: number; thumbnail: string; url: string; }[]>;
  downloadSong: (url: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  getSong: (filePath: string) => Promise<Song>;
  deleteSong: (filePath: string) => Promise<boolean>;
  showInFolder: (filePath: string) => Promise<void>;
  getUserDataPath: () => Promise<string>;
  getAppVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
  openPath: (path: string) => Promise<boolean>;
  getDownloadsPath: () => Promise<string>;
  setActivity: (activity: any) => Promise<void>;
  getSoundCloudToken: () => Promise<string | null>;
  getSoundCloudClientId: () => Promise<string | null>;
  soundcloudSearch: (query: string) => Promise<any[]>;
  soundcloudArtistTracks: (artistName: string) => Promise<any[]>;
  soundcloudStream: (transcodingUrl: string, permalinkUrl?: string) => Promise<string | null>;
  
  // Auto Update
  checkForUpdates: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  quitAndInstall: () => Promise<void>;
  onUpdateMessage: (callback: (event: any, data: any) => void) => () => void;
}


declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
