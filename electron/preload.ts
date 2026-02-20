import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  selectMusic: () => ipcRenderer.invoke('select-music'),
  searchLyrics: (artist: string, title: string) => ipcRenderer.invoke('search-lyrics', artist, title),
  searchMetadata: (query: string) => ipcRenderer.invoke('search-metadata', query),
  clearCache: () => ipcRenderer.invoke('clear-cache'),
  saveLibrary: (data: { songs: any[], playlists: any[] }) => ipcRenderer.invoke('save-library', data),
  loadLibrary: () => ipcRenderer.invoke('load-library'),
  searchOnline: (query: string) => ipcRenderer.invoke('search-online', query),
  downloadSong: (url: string) => ipcRenderer.invoke('download-song', url),
  getSong: (filePath: string) => ipcRenderer.invoke('get-song', filePath),
  deleteSong: (filePath: string) => ipcRenderer.invoke('delete-song', filePath),
  showInFolder: (filePath: string) => ipcRenderer.invoke('show-in-folder', filePath),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  getDownloadsPath: () => ipcRenderer.invoke('get-downloads-path'),
  setActivity: (activity: any) => ipcRenderer.invoke('set-activity', activity),
  getSoundCloudToken: () => ipcRenderer.invoke('get-soundcloud-token'),
  getSoundCloudClientId: () => ipcRenderer.invoke('get-soundcloud-client-id'),
  soundcloudSearch: (query: string) => ipcRenderer.invoke('soundcloud-search', query),
  soundcloudArtistTracks: (artistName: string) => ipcRenderer.invoke('soundcloud-artist-tracks', artistName),
  soundcloudStream: (transcodingUrl: string, permalinkUrl?: string) => ipcRenderer.invoke('soundcloud-stream', transcodingUrl, permalinkUrl),
  
  // Auto Update
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onUpdateMessage: (callback: (event: any, data: any) => void) => {
    const subscription = (_event: any, data: any) => callback(_event, data);
    ipcRenderer.on('update-message', subscription);
    return () => {
        ipcRenderer.removeListener('update-message', subscription);
    };
  }
});
