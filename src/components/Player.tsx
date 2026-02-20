import { Play, SkipBack, SkipForward, Repeat, Shuffle, Mic2, ListMusic, Volume2, Pause, VolumeX, Repeat1, Music } from 'lucide-react';
import type { Song } from '../types';
import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  progress: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  showLyrics: boolean;
  onToggleLyrics: () => void;
  isShuffled: boolean;
  onToggleShuffle: () => void;
  repeatMode: 'off' | 'all' | 'one';
  onToggleRepeat: () => void;
  showQueue: boolean;
  onToggleQueue: () => void;
}

export function Player({ 
  currentSong, 
  isPlaying, 
  onTogglePlay, 
  onNext, 
  onPrev, 
  progress, 
  duration, 
  onSeek,
  volume,
  onVolumeChange,
  showLyrics,
  onToggleLyrics,
  isShuffled,
  onToggleShuffle,
  repeatMode,
  onToggleRepeat,
  showQueue,
  onToggleQueue
}: PlayerProps) {
  
  const { t } = useLanguage();
  const volumeRef = useRef<HTMLDivElement>(null);
  const lastVolumeRef = useRef(1);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  useEffect(() => {
    if (volume > 0) {
      lastVolumeRef.current = volume;
    }
  }, [volume]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingVolume && volumeRef.current) {
        const rect = volumeRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        onVolumeChange(percent);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingVolume(false);
    };

    if (isDraggingVolume) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingVolume, onVolumeChange]);

  const formatTime = (time: number) => {
    if (!time) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="mx-4 mb-4 h-24 bg-[var(--bg-secondary)]/80 backdrop-blur-2xl border border-[var(--border)] rounded-3xl px-8 flex items-center justify-between z-50 shadow-2xl transition-all hover:scale-[1.002] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      {/* Song Info */}
      <div className="flex items-center gap-5 flex-1 w-[30%] min-w-0">
        {currentSong ? (
          <>
            <div className="relative group shrink-0">
                {currentSong.artwork ? (
                    <img src={currentSong.artwork} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-500 ring-1 ring-white/10" />
                ) : (
                    <div className="w-16 h-16 bg-[var(--bg-tertiary)] flex items-center justify-center rounded-2xl text-[var(--text-secondary)] shadow-lg group-hover:scale-105 transition-transform duration-500 ring-1 ring-white/10">
                        <Music size={28} />
                    </div>
                )}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
            </div>
            <div className="overflow-hidden flex flex-col justify-center min-w-0">
                <div className="text-[var(--text-main)] font-bold truncate hover:underline cursor-pointer text-lg tracking-tight">{currentSong.title || t.unknownTitle}</div>
                <div className="text-[var(--text-secondary)] hover:underline cursor-pointer font-medium opacity-80 truncate text-sm">{currentSong.artist || t.unknownArtist}</div>
            </div>
          </>
        ) : (
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[var(--bg-tertiary)]/50 rounded-2xl animate-pulse"></div>
                <div className="space-y-2.5 block">
                    <div className="w-32 h-4 bg-[var(--bg-tertiary)]/50 rounded-full animate-pulse"></div>
                    <div className="w-20 h-3 bg-[var(--bg-tertiary)]/50 rounded-full animate-pulse"></div>
                </div>
            </div>
        )}
      </div>

      {/* Playback Controls */}
      <div className="flex flex-col items-center gap-2 w-[40%] shrink-0">
        <div className="flex items-center gap-6">
          <button 
            className={`p-2.5 rounded-full transition-all hover:bg-[var(--bg-tertiary)] active:scale-95 ${isShuffled ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-secondary)]'}`}
            onClick={onToggleShuffle}
            title={t.shuffle}
          >
            <Shuffle size={18} />
          </button>
          <button 
            className="p-2.5 rounded-full text-[var(--text-main)] hover:bg-[var(--bg-tertiary)] transition-all hover:scale-110 active:scale-95"
            onClick={onPrev}
          >
            <SkipBack size={26} fill="currentColor" />
          </button>
          <button 
            className="w-14 h-14 bg-[var(--text-main)] rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-[var(--bg-main)] shadow-xl hover:shadow-[var(--accent)]/20 shadow-black/20"
            onClick={onTogglePlay}
          >
            {isPlaying ? (
                <Pause size={28} fill="currentColor" />
            ) : (
                <Play size={28} className="ml-1" fill="currentColor" />
            )}
          </button>
          <button 
            className="p-2.5 rounded-full text-[var(--text-main)] hover:bg-[var(--bg-tertiary)] transition-all hover:scale-110 active:scale-95"
            onClick={onNext}
          >
            <SkipForward size={26} fill="currentColor" />
          </button>
          <button 
            className={`p-2.5 rounded-full transition-all hover:bg-[var(--bg-tertiary)] active:scale-95 ${repeatMode !== 'off' ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-secondary)]'}`}
            onClick={onToggleRepeat}
            title={`${t.repeat}: ${repeatMode === 'off' ? t.repeatOff : repeatMode === 'all' ? t.repeatAll : t.repeatOne}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>
        
        <div className="flex items-center gap-3 w-full max-w-lg text-xs font-bold text-[var(--text-secondary)]">
            <span className="min-w-[40px] text-right font-mono opacity-80">{formatTime(progress)}</span>
            <div 
                className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full relative group cursor-pointer overflow-hidden"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    onSeek(percent * duration);
                }}
            >
                <div 
                    className="absolute top-0 left-0 h-full bg-[var(--text-main)] rounded-full group-hover:bg-[var(--accent)] transition-all shadow-[0_0_10px_rgba(var(--accent),0.5)]"
                    style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                />
            </div>
            <span className="min-w-[40px] font-mono opacity-80">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume & Extra Controls */}
      <div className="flex items-center justify-end gap-3 w-[30%]">
         <button 
            className={`p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${showLyrics ? 'text-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]/20' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-main)]'}`}
            onClick={onToggleLyrics}
            title={t.lyrics}
         >
            <Mic2 size={20} />
         </button>
         <button 
            className={`p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${showQueue ? 'text-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]/20' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-main)]'}`}
            onClick={onToggleQueue}
            title={t.queue}
         >
            <ListMusic size={20} />
         </button>
         
         <div className="w-px h-8 bg-[var(--border)] mx-1" />
         
         <div className="flex items-center gap-3 w-36 group bg-[var(--bg-tertiary)]/30 p-2.5 rounded-xl border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-tertiary)]/50 transition-all">
            <button 
                onClick={() => onVolumeChange(volume === 0 ? lastVolumeRef.current : 0)}
                className="text-[var(--text-secondary)] group-hover:text-[var(--text-main)] transition-all duration-300 hover:scale-110 active:scale-95"
            >
                {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div 
                className="flex-1 h-1.5 bg-[var(--bg-secondary)] rounded-full relative cursor-pointer"
                ref={volumeRef}
                onMouseDown={() => setIsDraggingVolume(true)}
            >
                <div 
                    className="absolute top-0 left-0 h-full bg-[var(--text-secondary)] group-hover:bg-[var(--text-main)] rounded-full transition-all"
                    style={{ width: `${volume * 100}%` }}
                />
                <div 
                    className="absolute top-1/2 w-3 h-3 bg-[var(--text-main)] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ left: `${volume * 100}%`, transform: 'translate(-50%, -50%)' }}
                />
            </div>
         </div>
      </div>
    </div>
  );
}
