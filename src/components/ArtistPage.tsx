
import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Music, Globe, Play, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { soundcloud } from '../services/soundcloud';
import type { Song } from '../types';

interface ArtistPageProps {
  artistName: string;
  localSongs: Song[];
  onBack: () => void;
  onPlayLocal: (song: Song, contextSongs?: Song[]) => void;
  onPlayOnline: (song: Song) => void;
}

interface OnlineTrack {
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  url: string;
  streamUrl?: string;
  soundcloudId?: number;
}

export function ArtistPage({ artistName, localSongs, onBack, onPlayLocal, onPlayOnline }: ArtistPageProps) {
  const { t } = useLanguage();
  const [onlineTracks, setOnlineTracks] = useState<OnlineTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter local songs by artist
  const artistLocalSongs = useMemo(() => {
    return localSongs.filter(song => 
      song.artist.toLowerCase() === artistName.toLowerCase() || 
      song.artist.toLowerCase().includes(artistName.toLowerCase())
    );
  }, [localSongs, artistName]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchArtistTracks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const tracks = await soundcloud.getArtistTracks(artistName);
        if (isMounted) {
            const formattedTracks = tracks.map(track => ({
                title: track.title,
                artist: track.user.username,
                duration: track.duration / 1000,
                thumbnail: track.artwork_url || '',
                url: track.permalink_url,
                streamUrl: soundcloud.getBestTranscodingUrl(track) || undefined,
                soundcloudId: track.id
            }));
            setOnlineTracks(formattedTracks);
        }
      } catch (err) {
        console.error("Failed to fetch artist tracks:", err);
        if (isMounted) {
            setError("Failed to load artist tracks");
        }
      } finally {
        if (isMounted) {
            setIsLoading(false);
        }
      }
    };

    fetchArtistTracks();

    return () => {
      isMounted = false;
    };
  }, [artistName]);

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handlePlayOnline = (track: OnlineTrack) => {
    const song: Song = {
        path: track.soundcloudId ? `soundcloud://${track.soundcloudId}` : track.url,
        title: track.title,
        artist: track.artist,
        album: 'SoundCloud',
        duration: track.duration,
        artwork: track.thumbnail,
        isOnline: true,
        streamUrl: track.streamUrl,
        soundcloudId: track.soundcloudId,
        permalink: track.url
    };
    onPlayOnline(song);
  };

  return (
    <div className="flex-1 bg-[var(--bg-secondary)] rounded-3xl overflow-y-auto relative border border-[var(--border)] shadow-2xl p-8 custom-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-main)]"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight">{artistName}</h1>
      </div>

      <div className="space-y-12">
        {/* Local Songs Section */}
        {artistLocalSongs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-[var(--text-main)] flex items-center gap-2">
              <Music size={24} className="text-[var(--accent)]" />
              {t.localLibrary} ({artistLocalSongs.length})
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {artistLocalSongs.map((song) => (
                <div 
                  key={song.path}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-tertiary)] group transition cursor-pointer border border-transparent hover:border-[var(--border)]"
                  onClick={() => onPlayLocal(song, artistLocalSongs)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text-main)] relative overflow-hidden shadow-sm">
                      {song.artwork ? (
                         <img src={song.artwork} alt={song.title} className="w-full h-full object-cover" />
                      ) : (
                         <Music size={24} />
                      )}
                      <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center backdrop-blur-sm transition-all">
                        <Play size={24} className="text-white fill-white" />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">{song.title}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{song.album || 'Unknown Album'}</div>
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] font-mono">
                    {formatDuration(song.duration)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Online Songs Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <Globe size={24} className="text-[var(--accent)]" />
              {t.onlineSearch}
            </h2>
            <span className="text-xs font-bold text-[#ff5500] bg-[#ff5500]/10 px-2 py-0.5 rounded-full border border-[#ff5500]/20">
               {t.poweredBy}
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="text-[var(--accent)] animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
              {error}
            </div>
          ) : onlineTracks.length === 0 ? (
            <div className="text-[var(--text-secondary)] text-center py-12 bg-[var(--bg-tertiary)]/30 rounded-2xl border border-dashed border-[var(--border)]">
              No online tracks found for this artist.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {onlineTracks.map((track) => (
                <div 
                  key={track.soundcloudId || track.url}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-tertiary)] group transition cursor-pointer border border-transparent hover:border-[var(--border)]"
                  onClick={() => handlePlayOnline(track)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text-main)] relative overflow-hidden shadow-sm">
                      {track.thumbnail ? (
                         <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                         <Music size={24} />
                      )}
                      <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center backdrop-blur-sm transition-all">
                        <Play size={24} className="text-white fill-white" />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">{track.title}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{track.artist}</div>
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] font-mono">
                    {formatDuration(track.duration)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
