import React, { useState } from 'react';
import { Search, Loader2, Play, Globe, Heart, Clock, MoreHorizontal } from 'lucide-react';
import type { Song, Playlist } from '../types';
import { soundcloud } from '../services/soundcloud';
import { SongContextMenu } from './SongContextMenu';

interface SearchResult {
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  url: string;
  streamUrl?: string; 
  isOnline: boolean;
  soundcloudId?: number;
}

interface UnifiedSearchProps {
  onPlayOnline: (song: Song) => void;
  onDownload: (url: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  onToggleLike?: (song: Song) => void;
  isLiked?: (songPath: string) => boolean;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, song: Song | string) => void;
  onPlayNext?: (song: Song | string) => void;
  onAddToQueue?: (song: Song | string) => void;
  onGoToArtist?: (artist: string) => void;
}

export function UnifiedSearch({ 
    onPlayOnline, 
    // onDownload, 
    onToggleLike, 
    isLiked,
    playlists,
    onAddToPlaylist,
    onPlayNext,
    onAddToQueue,
    onGoToArtist
}: UnifiedSearchProps) {
  const [query, setQuery] = useState('');
  const [onlineResults, setOnlineResults] = useState<SearchResult[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, song: Song } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, result: SearchResult) => {
      e.preventDefault();
      const song: Song = {
          path: result.soundcloudId ? `soundcloud://${result.soundcloudId}` : result.url,
          title: result.title,
          artist: result.artist,
          album: result.soundcloudId ? 'SoundCloud' : 'Online Search',
          duration: result.duration,
          artwork: result.thumbnail,
          isOnline: true,
          streamUrl: result.streamUrl,
          soundcloudId: result.soundcloudId,
          permalink: result.url
      };
      setContextMenu({ x: e.clientX, y: e.clientY, song });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearchingOnline(true);
    try {
        const results = await soundcloud.search(query);
        const formattedResults: SearchResult[] = results.map(track => {
            const bestStreamUrl = soundcloud.getBestTranscodingUrl(track);
            return {
                title: track.title,
                artist: track.user.username,
                duration: track.duration / 1000,
                thumbnail: track.artwork_url || '',
                url: track.permalink_url,
                streamUrl: bestStreamUrl || undefined,
                isOnline: true,
                soundcloudId: track.id
            };
        });
        setOnlineResults(formattedResults);
    } catch (error) {
        console.error("Online search failed:", error);
        setOnlineResults([]);
    } finally {
        setIsSearchingOnline(false);
    }
  };

  const handlePlayOnlineResult = (result: SearchResult) => {
      const song: Song = {
          path: result.soundcloudId ? `soundcloud://${result.soundcloudId}` : result.url,
          title: result.title,
          artist: result.artist,
          album: result.soundcloudId ? 'SoundCloud' : 'Online Search',
          duration: result.duration,
          artwork: result.thumbnail,
          isOnline: true,
          streamUrl: result.streamUrl,
          soundcloudId: result.soundcloudId,
          permalink: result.url
      };
      onPlayOnline(song);
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 bg-[var(--bg-secondary)] rounded-3xl overflow-y-auto relative border border-[var(--border)] shadow-2xl p-8 custom-scrollbar">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-8 text-[var(--text-main)] tracking-tight">Online Search</h1>
        <form onSubmit={handleSearch} className="flex gap-4 max-w-3xl mb-10 relative z-10">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent)] transition-colors" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search SoundCloud..."
              className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 text-lg text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingOnline}
            className="bg-[var(--accent)] text-white px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--accent)]/20 flex items-center gap-2"
          >
            {isSearchingOnline ? <Loader2 className="animate-spin" /> : <Search />}
            Search
          </button>
        </form>

        <div className="space-y-4">
          {onlineResults.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="text-[var(--accent)]" size={20} />
                <h2 className="text-xl font-bold text-[var(--text-main)]">Online Results</h2>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border)] mb-2">
                  <div className="w-8 text-center">#</div>
                  <div>Title</div>
                  <div className="flex justify-end"><Clock size={14} /></div>
                  <div className="w-8"></div>
                </div>

                {onlineResults.map((result, index) => (
                  <div 
                    key={index}
                    className="group grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 rounded-xl items-center hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]"
                    onClick={() => handlePlayOnlineResult(result)}
                    onContextMenu={(e) => handleContextMenu(e, result)}
                  >
                    <div className="w-8 text-center flex justify-center text-[var(--text-secondary)] font-mono text-sm">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <Play size={16} className="hidden group-hover:block text-[var(--text-main)]" />
                    </div>
                    
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--bg-secondary)] flex-shrink-0">
                        {result.thumbnail ? (
                          <img src={result.thumbnail} alt={result.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                            <Globe size={20} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold truncate text-sm text-[var(--text-main)]" title={result.title}>{result.title}</div>
                        <div className="text-xs text-[var(--text-secondary)] truncate">{result.artist}</div>
                      </div>
                    </div>

                    <div className="text-sm text-[var(--text-secondary)] font-mono text-right">
                      {formatDuration(result.duration)}
                    </div>
                    
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className={`p-2 rounded-lg transition-colors ${isLiked?.(result.soundcloudId ? `soundcloud://${result.soundcloudId}` : result.url) ? 'text-[var(--accent)] opacity-100' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const song: Song = {
                              path: result.soundcloudId ? `soundcloud://${result.soundcloudId}` : result.url,
                              title: result.title,
                              artist: result.artist,
                              album: result.soundcloudId ? 'SoundCloud' : 'Online Search',
                              duration: result.duration,
                              artwork: result.thumbnail,
                              isOnline: true,
                              streamUrl: result.streamUrl,
                              soundcloudId: result.soundcloudId,
                              permalink: result.url
                          };
                          onToggleLike?.(song);
                        }}
                        title={isLiked?.(result.soundcloudId ? `soundcloud://${result.soundcloudId}` : result.url) ? "Unlike" : "Like"}
                      >
                        <Heart size={16} fill={isLiked?.(result.soundcloudId ? `soundcloud://${result.soundcloudId}` : result.url) ? "currentColor" : "none"} />
                      </button>
                      
                      <button
                          className="p-2 hover:bg-[var(--bg-main)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                          onClick={(e) => {
                              handleContextMenu(e, result);
                          }}
                      >
                          <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!isSearchingOnline && onlineResults.length === 0 && query && (
             <div className="text-center py-20 text-[var(--text-secondary)]">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No results found for "{query}"</p>
                <p className="text-sm mt-2">Try searching for a different song or artist</p>
             </div>
          )}
        </div>
      </div>

      {contextMenu && (
        <SongContextMenu
            song={contextMenu.song}
            playlists={playlists}
            onClose={() => setContextMenu(null)}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            onAddToPlaylist={(id) => onAddToPlaylist(id, contextMenu.song)}
            onPlayNext={() => onPlayNext?.(contextMenu.song)}
            onAddToQueue={() => onAddToQueue?.(contextMenu.song)}
            onGoToArtist={(artist) => {
                 onGoToArtist?.(artist);
                 setContextMenu(null);
            }}
            onDeleteSong={() => {
                // Cannot delete online song from search result
                setContextMenu(null);
            }}
        />
      )}
    </div>
  );
}
