import React, { useState } from 'react';
import { Search, Loader2, Play, Globe, Heart } from 'lucide-react';
import type { Song } from '../types';
import { soundcloud } from '../services/soundcloud';

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
}

export function UnifiedSearch({ onPlayOnline, onToggleLike, isLiked }: UnifiedSearchProps) {
  const [query, setQuery] = useState('');
  const [onlineResults, setOnlineResults] = useState<SearchResult[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {onlineResults.map((result, index) => (
                  <div 
                    key={index}
                    className="group bg-[var(--bg-tertiary)] p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                    onClick={() => handlePlayOnlineResult(result)}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-[var(--bg-secondary)] relative shadow-md">
                      {result.thumbnail ? (
                        <img src={result.thumbnail} alt={result.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                          <Globe size={40} />
                        </div>
                      )}
                      
                      {/* Like Button Overlay */}
                      <button
                        className={`absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-md transition-colors z-20 hover:bg-black/70 ${isLiked?.(result.soundcloudId ? `soundcloud://${result.soundcloudId}` : result.url) ? 'text-[var(--accent)]' : 'text-white'}`}
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
                      >
                         <Heart size={18} fill={isLiked?.(result.soundcloudId ? `soundcloud://${result.soundcloudId}` : result.url) ? "currentColor" : "none"} />
                      </button>

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <div className="bg-[var(--accent)] text-white p-3 rounded-full transform scale-90 group-hover:scale-100 transition-transform shadow-xl">
                          <Play size={24} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-[var(--text-main)] truncate mb-1" title={result.title}>{result.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] truncate mb-2">{result.artist}</p>
                      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
                        <span className="bg-[var(--bg-secondary)] px-2 py-1 rounded-md border border-[var(--border)]">{formatDuration(result.duration)}</span>
                        <span className="flex items-center gap-1 text-[var(--accent)]">
                           SoundCloud
                        </span>
                      </div>
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
    </div>
  );
}
