import type { Song, Playlist } from '../types';

const isElectron = () => {
    return (window as any).electron !== undefined;
};

class PlatformService {
    
    async selectMusic(): Promise<Song[]> {
        if (isElectron()) {
            return window.electron.selectMusic();
        }
        console.warn('Select music only available in Electron');
        return [];
    }

    async searchLyrics(artist: string, title: string): Promise<string | null> {
        if (isElectron()) {
            return window.electron.searchLyrics(artist, title);
        }
        return null; 
    }

    async searchMetadata(query: string): Promise<{ artist: string; title: string; album: string; artwork?: string } | null> {
        if (isElectron()) {
            return window.electron.searchMetadata(query);
        }
        return null;
    }

    async clearCache(): Promise<boolean> {
        if (isElectron()) {
            return window.electron.clearCache();
        }
        return true;
    }

    async saveLibrary(data: { songs: Song[], playlists: Playlist[] }): Promise<boolean> {
        if (isElectron()) {
            return window.electron.saveLibrary(data);
        }
        // Fallback for web dev - just localstorage for persistence across reloads
        try {
            localStorage.setItem('songify_library', JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Failed to save library', e);
            return false;
        }
    }

    async loadLibrary(): Promise<{ songs: Song[], playlists: Playlist[] }> {
        if (isElectron()) {
            return window.electron.loadLibrary();
        }
        try {
            const data = localStorage.getItem('songify_library');
            if (data) return JSON.parse(data);
        } catch (e) {
            console.error('Failed to load library', e);
        }
        return { songs: [], playlists: [] };
    }

    async getAppVersion(): Promise<string> {
        if (isElectron()) {
            return window.electron.getAppVersion();
        }
        return '1.0.0';
    }

    async openExternal(url: string): Promise<void> {
        if (isElectron()) {
            return window.electron.openExternal(url);
        }
        window.open(url, '_blank');
    }

    async showInFolder(path: string): Promise<void> {
        if (isElectron()) {
            return window.electron.showInFolder(path);
        }
    }

    async deleteSong(path: string): Promise<boolean> {
        if (isElectron()) {
            return window.electron.deleteSong(path);
        }
        return true; 
    }

    async getUserDataPath(): Promise<string> {
        if (isElectron()) {
            return window.electron.getUserDataPath();
        }
        return '';
    }

    async getDownloadsPath(): Promise<string> {
        if (isElectron()) {
            return window.electron.getDownloadsPath();
        }
        return '';
    }

    async searchOnline(query: string): Promise<any[]> {
        if (isElectron() && window.electron.searchOnline) {
            return window.electron.searchOnline(query);
        }
        console.warn('Online search not available (electron bridge missing)');
        return [];
    }

    async getSoundCloudToken(): Promise<string | null> {
        if (isElectron()) {
            return window.electron.getSoundCloudToken();
        }
        return null;
    }
    
    async getSoundCloudClientId(): Promise<string | null> {
        if (isElectron()) {
            return window.electron.getSoundCloudClientId();
        }
        return null;
    }

    async soundcloudSearch(query: string): Promise<any[]> {
        if (isElectron() && window.electron.soundcloudSearch) {
            return window.electron.soundcloudSearch(query);
        }
        console.warn('SoundCloud search not available (electron bridge missing)');
        return [];
    }

    async soundcloudArtistTracks(artistName: string): Promise<any[]> {
        if (isElectron() && window.electron.soundcloudArtistTracks) {
            return window.electron.soundcloudArtistTracks(artistName);
        }
        console.warn('SoundCloud artist tracks not available (electron bridge missing)');
        return [];
    }

    async soundcloudStream(transcodingUrl: string, permalinkUrl?: string): Promise<string | null> {
        if (isElectron() && window.electron.soundcloudStream) {
            return window.electron.soundcloudStream(transcodingUrl, permalinkUrl);
        }
        console.warn('SoundCloud stream not available (electron bridge missing)');
        return null;
    }

    async openPath(path: string): Promise<boolean> {
        if (isElectron()) {
            return window.electron.openPath(path);
        }
        return false;
    }

    async setActivity(activity: any): Promise<void> {
        if (isElectron()) {
            return window.electron.setActivity(activity);
        }
    }

    async downloadSong(url: string): Promise<{ success: boolean; path?: string; error?: string }> {
        if (isElectron()) {
            return window.electron.downloadSong(url);
        }
        return { success: false, error: 'Not implemented for this platform' };
    }

    async getSong(filePath: string): Promise<Song> {
        if (isElectron()) {
            return window.electron.getSong(filePath);
        }
        // Return dummy song for now
        return {
            path: filePath,
            title: filePath.split('/').pop() || 'Unknown',
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            duration: 0
        };
    }

    async checkForUpdates(): Promise<void> {
        if (isElectron()) {
            return window.electron.checkForUpdates();
        }
    }

    async downloadUpdate(): Promise<void> {
        if (isElectron()) {
            return window.electron.downloadUpdate();
        }
    }

    async quitAndInstall(): Promise<void> {
        if (isElectron()) {
            return window.electron.quitAndInstall();
        }
    }

    onUpdateMessage(callback: (event: any, data: any) => void): () => void {
        if (isElectron()) {
            return window.electron.onUpdateMessage(callback);
        }
        return () => {};
    }
}

export const platform = new PlatformService();
