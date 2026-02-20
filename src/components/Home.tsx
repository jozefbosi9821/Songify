import { Play, Music, ListMusic, Search, Zap, BarChart3, Trophy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { useEffect, useState } from 'react';
import type { Song, Playlist } from '../types';

interface HomeProps {
  songs: Song[];
  playlists: Playlist[];
  onNavigate: (view: 'search' | 'library' | 'playlist', id?: string) => void;
  onPlaySong: (index: number) => void;
}

interface UserStats {
    totalPlays: number;
    topSongs: { title: string; artist: string; plays: number }[];
    topArtists: { artist: string; plays: number }[];
    activity: { date: string; count: number }[];
}

export function Home({ songs, playlists, onNavigate, onPlaySong }: HomeProps) {
  const { t } = useLanguage();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
      // Fetch stats immediately
      api.getStats().then(setStats).catch(console.error);

      // Poll for updates every 5 seconds
      const interval = setInterval(() => {
          api.getStats().then(setStats).catch(console.error);
      }, 5000);

      return () => clearInterval(interval);
  }, []);

  // Mock recently played for now, or just random songs
  const recentSongs = songs.slice(0, 4);
  const recentPlaylists = playlists.slice(0, 4);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning;
    if (hour < 18) return t.goodAfternoon;
    return t.goodEvening;
  };

  return (
    <div className="flex-1 bg-[var(--bg-secondary)] rounded-3xl overflow-y-auto relative border border-[var(--border)] shadow-2xl p-8 custom-scrollbar">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2 text-[var(--text-main)] tracking-tight">{getGreeting()}</h1>
        <p className="text-[var(--text-secondary)]">{t.welcomeBack}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* Your Stats */}
        {stats && (
            <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-500/30 p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform">
                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <BarChart3 size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-[var(--text-main)]">{stats.totalPlays}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Total Plays</p>
                </div>
            </div>
        )}

        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => onNavigate('library')}>
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <Music size={24} />
            </div>
            <div>
                <h3 className="font-bold text-lg text-[var(--text-main)]">{songs.length}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{t.songs}</p>
            </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => onNavigate('library')}>
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                <ListMusic size={24} />
            </div>
            <div>
                <h3 className="font-bold text-lg text-[var(--text-main)]">{playlists.length}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{t.playlists}</p>
            </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => onNavigate('search')}>
            <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
                <Search size={24} />
            </div>
            <div>
                <h3 className="font-bold text-lg text-[var(--text-main)]">Online</h3>
                <p className="text-sm text-[var(--text-secondary)]">{t.searchAndDownload}</p>
            </div>
        </div>
      </div>

      {/* Top Artists & Songs */}
      {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Top Artists */}
              <div className="bg-[var(--bg-tertiary)]/30 rounded-2xl p-6 border border-[var(--border)]">
                  <h2 className="text-xl font-bold mb-6 text-[var(--text-main)] flex items-center gap-2">
                      <Trophy size={20} className="text-yellow-500" />
                      Your Top Artists
                  </h2>
                  <div className="space-y-4">
                      {stats.topArtists.length > 0 ? stats.topArtists.map((artist, i) => (
                          <div key={i} className="flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                  <span className="text-2xl font-black text-[var(--text-secondary)]/30 w-8">{i + 1}</span>
                                  <div>
                                      <div className="font-bold text-[var(--text-main)]">{artist.artist}</div>
                                      <div className="text-sm text-[var(--text-secondary)]">{artist.plays} plays</div>
                                  </div>
                              </div>
                          </div>
                      )) : (
                          <p className="text-[var(--text-secondary)] italic">Play some music to see your top artists!</p>
                      )}
                  </div>
              </div>

              {/* Top Songs */}
              <div className="bg-[var(--bg-tertiary)]/30 rounded-2xl p-6 border border-[var(--border)]">
                  <h2 className="text-xl font-bold mb-6 text-[var(--text-main)] flex items-center gap-2">
                      <Music size={20} className="text-pink-500" />
                      Your Top Songs
                  </h2>
                  <div className="space-y-4">
                      {stats.topSongs.length > 0 ? stats.topSongs.map((song, i) => (
                          <div key={i} className="flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                  <span className="text-2xl font-black text-[var(--text-secondary)]/30 w-8">{i + 1}</span>
                                  <div>
                                      <div className="font-bold text-[var(--text-main)] truncate max-w-[200px]">{song.title}</div>
                                      <div className="text-sm text-[var(--text-secondary)]">{song.artist} • {song.plays} plays</div>
                                  </div>
                              </div>
                          </div>
                      )) : (
                          <p className="text-[var(--text-secondary)] italic">Play some music to see your top songs!</p>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Quick Play */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 text-[var(--text-main)] flex items-center gap-2">
            <Zap size={20} className="text-[var(--accent)]" />
            {t.quickPlay}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentSongs.map(song => (
                <div 
                    key={song.path} 
                    className="group bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] p-4 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-[var(--border)]"
                    onClick={() => onPlaySong(songs.indexOf(song))}
                >
                    <div className="relative aspect-square mb-4 rounded-xl overflow-hidden shadow-lg bg-[var(--bg-secondary)]">
                        {song.artwork ? (
                            <img src={song.artwork} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                                <Music size={32} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <div className="bg-[var(--accent)] p-3 rounded-full text-white shadow-xl transform scale-50 group-hover:scale-100 transition-transform">
                                <Play size={20} fill="currentColor" />
                            </div>
                        </div>
                    </div>
                    <h3 className="font-bold text-[var(--text-main)] truncate mb-1">{song.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{song.artist}</p>
                </div>
            ))}
            {recentSongs.length === 0 && (
                <div className="col-span-full py-8 text-center text-[var(--text-secondary)] bg-[var(--bg-tertiary)]/30 rounded-2xl border border-dashed border-[var(--border)]">
                    <Music size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No songs found. Add music to get started!</p>
                </div>
            )}
        </div>
      </div>

      {/* Your Playlists */}
      {playlists.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-[var(--text-main)] flex items-center gap-2">
                <ListMusic size={20} className="text-[var(--accent)]" />
                Your Playlists
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentPlaylists.map(playlist => (
                    <div 
                        key={playlist.id} 
                        className="bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] p-4 rounded-2xl transition-all cursor-pointer flex items-center gap-4 border border-transparent hover:border-[var(--border)]"
                        onClick={() => onNavigate('playlist', playlist.id)}
                    >
                        <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center text-[var(--text-secondary)] shadow-sm">
                            <ListMusic size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--text-main)] text-lg">{playlist.name}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{playlist.songs.length} songs</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}
    </div>
  );
}
