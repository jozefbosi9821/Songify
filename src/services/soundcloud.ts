import { platform } from './platform';

export interface SoundCloudTrack {
    id: number;
    title: string;
    user: {
        username: string;
        avatar_url: string;
    };
    duration: number; // in milliseconds
    artwork_url: string | null;
    permalink_url: string;
    track_authorization?: string;
    policy?: string;
    media: {
        transcodings: Array<{
            url: string;
            preset: string;
            format: {
                protocol: string;
                mime_type: string;
            }
        }>
    };
}

export class SoundCloudService {
    private static instance: SoundCloudService;

    private constructor() {
        // No local config access
    }

    public static getInstance(): SoundCloudService {
        if (!SoundCloudService.instance) {
            SoundCloudService.instance = new SoundCloudService();
        }
        return SoundCloudService.instance;
    }

    public async getClientId(): Promise<string | null> {
        return platform.getSoundCloudClientId();
    }

    public async search(query: string): Promise<SoundCloudTrack[]> {
        return platform.soundcloudSearch(query);
    }

    public async getArtistTracks(artistName: string): Promise<SoundCloudTrack[]> {
        return platform.soundcloudArtistTracks(artistName);
    }

    public getBestTranscodingUrl(track: SoundCloudTrack): string | null {
        if (!track.media || !track.media.transcodings) return null;
        
        const transcodings = track.media.transcodings;

        // 1. Prefer HLS MP3 (standard quality, most compatible, best for seeking)
        const hlsMp3 = transcodings.find(
            t => t.format.protocol === 'hls' && t.format.mime_type.includes('mpeg')
        );

        // 2. Prefer HLS Opus (high quality)
        const hlsOpus = transcodings.find(
            t => t.format.protocol === 'hls' && t.format.mime_type.includes('opus')
        );

        // 3. Fallback to progressive mp3 (simple playback but less reliable)
        const progressive = transcodings.find(
            t => t.format.protocol === 'progressive' && t.format.mime_type.includes('mpeg')
        );

        let url: string | null = null;

        if (hlsMp3) {
            url = hlsMp3.url;
        } else if (hlsOpus) {
            url = hlsOpus.url;
        } else if (progressive) {
            url = progressive.url;
        } else {
            // Fallback: take first available
            url = transcodings[0]?.url || null;
        }

        if (url && track.track_authorization) {
            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}track_authorization=${track.track_authorization}`;
        }

        return url;
    }

    public async resolveStreamUrl(transcodingUrl: string, permalinkUrl?: string): Promise<string | null> {
        return platform.soundcloudStream(transcodingUrl, permalinkUrl);
    }
}

export const soundcloud = SoundCloudService.getInstance();
