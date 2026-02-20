import React, { useState, useMemo } from 'react';
import { Search, Loader2, Music, Play, Globe } from 'lucide-react';
import type { Song } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
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
  songs: Song[];
  onPlayLocal: (song: Song) => void;
  onPlayOnline: (song: Song) => void;
  onDownload: (url: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  onArtistClick: (artist: string) => void;
}

export function UnifiedSearch({ songs, onPlayLocal, onPlayOnline, onArtistClick }: UnifiedSearchProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [onlineResults, setOnlineResults] = useState<SearchResult[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'local' | 'online'>('all');

  const localResults = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return songs.filter(song => 
      song.title.toLowerCase().includes(lowerQuery) || 
      song.artist.toLowerCase().includes(lowerQuery) ||
      song.album?.toLowerCase().includes(lowerQuery)
    );
  }, [query, songs]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (activeTab === 'online' || activeTab === 'all') {
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
        <h1 className="text-4xl font-black mb-8 text-[var(--text-main)] tracking-tight">{t.search}</h1>
        <form onSubmit={handleSearch} className="flex gap-4 max-w-3xl mb-10 relative z-10">
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-[var(--accent)] opacity-0 blur-2xl rounded-full transition-opacity duration-500 group-hover:opacity-20 pointer-events-none" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent)] transition-colors" size={24} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-[var(--bg-tertiary)] text-[var(--text-main)] pl-16 pr-6 py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all border border-[var(--border)] shadow-lg relative z-10 text-lg placeholder:text-[var(--text-secondary)]/50"
            />
          </div>
        </form>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1.5 bg-[var(--bg-tertiary)]/50 rounded-2xl w-fit border border-[var(--border)] backdrop-blur-sm">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-8 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'all' ? 'bg-[var(--accent)] text-[var(--bg-main)] shadow-lg scale-105' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-tertiary)]'}`}
          >
            {t.all}
          </button>
          <button 
            onClick={() => setActiveTab('local')}
            className={`px-8 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'local' ? 'bg-[var(--accent)] text-[var(--bg-main)] shadow-lg scale-105' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-tertiary)]'}`}
          >
            {t.local} ({localResults.length})
          </button>
          <button 
            onClick={() => setActiveTab('online')}
            className={`px-8 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'online' ? 'bg-[var(--accent)] text-[var(--bg-main)] shadow-lg scale-105' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-tertiary)]'}`}
          >
            {t.online}
          </button>
        </div>

        {/* 
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-red-500/20 text-red-500'}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}
        */}
      </div>

      <div className="flex-1 space-y-8">
        {/* Local Results */}
        {(activeTab === 'all' || activeTab === 'local') && localResults.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4 text-[var(--text-main)] flex items-center gap-2">
                <Music size={20} className="text-[var(--accent)]" />
                {t.localLibrary}
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {localResults.map((song) => (
                <div 
                  key={song.path}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-tertiary)] group transition cursor-pointer border border-transparent hover:border-[var(--border)]"
                  onClick={() => onPlayLocal(song)}
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
                      <div 
                        className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:underline cursor-pointer relative z-10 w-fit"
                        onClick={(e) => {
                            e.stopPropagation();
                            onArtistClick(song.artist);
                        }}
                      >{song.artist}</div>
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

        {/* Online Results */}
        {(activeTab === 'all' || activeTab === 'online') && (
          <section>
             <div className="flex items-center gap-2 mb-4">
                 <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Globe size={20} className="text-[var(--accent)]" />
                    {t.onlineSearch}
                 </h2>
                 <span className="text-xs font-bold text-[#ff5500] bg-[#ff5500]/10 px-2 py-0.5 rounded-full border border-[#ff5500]/20">
                    {t.poweredBy}
                 </span>
             </div>

             {isSearchingOnline ? (
                <div className="flex items-center justify-center py-12">
                   <Loader2 size={32} className="text-[var(--accent)] animate-spin" />
                </div>
             ) : onlineResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                   {onlineResults.map((result) => (
                      <div 
                        key={result.url}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-tertiary)] group transition cursor-pointer border border-transparent hover:border-[var(--border)]"
                        onClick={() => handlePlayOnlineResult(result)}
                      >
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text-main)] relative overflow-hidden shadow-sm">
                             {result.thumbnail ? (
                                <img src={result.thumbnail} alt={result.title} className="w-full h-full object-cover" />
                             ) : (
                                <Music size={24} />
                             )}
                             <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center backdrop-blur-sm transition-all">
                               <Play size={24} className="text-white fill-white" />
                             </div>
                           </div>
                           <div>
                             <div className="font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">{result.title}</div>
                             <div 
                                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:underline cursor-pointer relative z-10 w-fit"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onArtistClick(result.artist);
                                }}
                             >{result.artist}</div>
                           </div>
                         </div>
                         <div className="text-sm text-[var(--text-secondary)] font-mono">
                           {formatDuration(result.duration)}
                         </div>
                      </div>
                   ))}
                </div>
             ) : (
                query.trim() && !isSearchingOnline && (
                   <div className="text-center py-8 text-[var(--text-secondary)]">
                      {t.noResultsFound}
                   </div>
                )
             )}
             
             {!query.trim() && (
                <div className="text-center py-8 text-[var(--text-secondary)] italic">
                   {t.enterSearchTerm}
                </div>
             )}
          </section>
        )}
        
        {/* No Results State */}
        {query.trim() && !isSearchingOnline && localResults.length === 0 && onlineResults.length === 0 && (
           <div className="text-center text-[var(--text-secondary)] mt-10 p-10 bg-[var(--bg-tertiary)]/30 rounded-3xl border border-[var(--border)] border-dashed">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl font-bold text-[var(--text-main)]">{t.noResultsFor} "{query}"</p>
              <p className="text-sm mt-2">{t.tryDifferentKeywords}</p>
           </div>
        )}
      </div>
    </div>
  );
}
