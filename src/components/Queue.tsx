import { X, Music, Play, ListMusic, Clock } from 'lucide-react';
import type { Song } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface QueueProps {
  songs: Song[];
  currentSongIndex: number;
  onClose: () => void;
  onPlaySong: (index: number) => void;
  shuffleOrder: number[] | null;
}

export function Queue({ songs, currentSongIndex, onClose, onPlaySong, shuffleOrder }: QueueProps) {
  const { t } = useLanguage();
  
  // Calculate upcoming songs
  const upcomingIndices = [];
  if (shuffleOrder) {
    const currentShuffleIndex = shuffleOrder.indexOf(currentSongIndex);
    if (currentShuffleIndex !== -1) {
      for (let i = currentShuffleIndex + 1; i < shuffleOrder.length; i++) {
        upcomingIndices.push(shuffleOrder[i]);
      }
    }
  } else {
    for (let i = currentSongIndex + 1; i < songs.length; i++) {
      upcomingIndices.push(i);
    }
  }

  return (
    <div className="w-[400px] flex flex-col bg-[var(--bg-secondary)]/95 backdrop-blur-2xl border border-[var(--border)] shadow-2xl animate-in slide-in-from-right duration-300 z-50 rounded-3xl">
      <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-secondary)]/50 rounded-t-3xl">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--accent)]/10 rounded-lg text-[var(--accent)]">
                <ListMusic size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-[var(--text-main)]">{t.playQueue}</h2>
                <p className="text-xs text-[var(--text-secondary)] font-medium">{upcomingIndices.length} {t.songsNext}</p>
            </div>
        </div>
        <button 
            onClick={onClose} 
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-8">
        {/* Now Playing Section */}
        <section>
          <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></span>
            {t.nowPlaying}
          </h3>
          
          {currentSongIndex !== -1 && songs[currentSongIndex] ? (
            <div className="relative group overflow-hidden rounded-xl border border-[var(--accent)]/30 shadow-[0_0_20px_rgba(var(--accent),0.15)] bg-gradient-to-r from-[var(--bg-tertiary)] to-[var(--bg-secondary)] p-4 transition-all hover:shadow-[0_0_25px_rgba(var(--accent),0.25)]">
               <div className="flex items-center gap-4 relative z-10">
                   <div className="relative shrink-0">
                       {songs[currentSongIndex].artwork ? (
                          <img src={songs[currentSongIndex].artwork} className="w-16 h-16 rounded-lg object-cover shadow-lg" />
                        ) : (
                          <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center text-[var(--text-secondary)] border border-[var(--border)] shadow-inner">
                            <Music size={24} />
                          </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-[var(--accent)] text-[var(--bg-main)] p-1.5 rounded-full shadow-lg">
                            <Play size={12} fill="currentColor" />
                        </div>
                   </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[var(--text-main)] text-lg line-clamp-1 mb-1">{songs[currentSongIndex].title}</div>
                      <div className="text-sm text-[var(--text-secondary)] line-clamp-1 font-medium">{songs[currentSongIndex].artist}</div>
                    </div>
               </div>
               
               {/* Animated background effect */}
               <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--text-secondary)] italic bg-[var(--bg-tertiary)]/30 rounded-xl border border-[var(--border)] border-dashed">
                {t.nothingPlaying}
            </div>
          )}
        </section>

        {/* Up Next Section */}
        <section>
          <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
            <Clock size={12} />
            {t.nextUp}
          </h3>
          
          {upcomingIndices.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-3 text-[var(--text-secondary)] bg-[var(--bg-tertiary)]/30 rounded-xl border border-[var(--border)] border-dashed">
                <Music size={32} className="opacity-20" />
                <span className="text-sm font-medium">{t.queueEmpty}</span>
            </div>
          ) : (
            <div className="space-y-1">
              {upcomingIndices.map((originalIndex, i) => {
                const song = songs[originalIndex];
                return (
                  <div 
                    key={`${originalIndex}-${i}`}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-tertiary)] cursor-pointer transition-all border border-transparent hover:border-[var(--border)] hover:shadow-sm"
                    onClick={() => onPlaySong(originalIndex)}
                  >
                    <div className="w-6 text-center text-xs font-bold text-[var(--text-secondary)] group-hover:hidden transition-all">
                        {i + 1}
                    </div>
                    <div className="w-6 hidden group-hover:flex items-center justify-center text-[var(--accent)] transition-all">
                        <Play size={14} fill="currentColor" />
                    </div>
                    
                    {song.artwork ? (
                        <img src={song.artwork} className="w-10 h-10 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform" />
                    ) : (
                        <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center text-[var(--text-secondary)] border border-[var(--border)] group-hover:bg-[var(--bg-secondary)] transition-colors">
                            <Music size={16} />
                        </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[var(--text-main)] text-sm line-clamp-1 group-hover:text-[var(--accent)] transition-colors">{song.title}</div>
                      <div className="text-xs text-[var(--text-secondary)] line-clamp-1">{song.artist}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
