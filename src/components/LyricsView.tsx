import { ChevronLeft, Music } from 'lucide-react';
import { useRef, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Song } from '../types';

interface LyricsViewProps {
  currentSong: Song | null;
  currentTime: number;
  onClose: () => void;
}

export function LyricsView({ currentSong, currentTime, onClose }: LyricsViewProps) {
  const { t } = useLanguage();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  
  const parsedLyrics = useMemo(() => {
    if (!currentSong?.lyrics) return null;
    
    const lines = currentSong.lyrics.split('\n');
    const parsed = lines
        .map(line => {
            const match = line.match(/^\s*\[?(\d+):(\d{2})([.:]\d+)?\]?\s*(.*)/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                let ms = 0;
                if (match[3]) {
                    const decimalPart = match[3].substring(1); 
                    ms = parseFloat(`0.${decimalPart}`) * 1000;
                }
                
                const time = minutes * 60 + seconds + ms / 1000;
                return { time, text: match[4].trim(), isSynced: true };
            }
            if (/^\[(ar|ti|al|by|au|length|offset|re|ve):.*\]/i.test(line)) {
                return null;
            }
            if (/^(www\.|http:|https:|Synced by|Created by)/i.test(line.trim())) {
                return null;
            }
            
            return { time: 0, text: line, isSynced: false };
        })
        .filter((line): line is { time: number; text: string; isSynced: boolean } => line !== null);

    const hasSynced = parsed.some(l => l.isSynced);
    
    return { 
      type: hasSynced ? 'synced' : 'plain', 
      lines: parsed 
    };
  }, [currentSong?.lyrics]);

  const activeLineIndex = useMemo(() => {
    if (!parsedLyrics || parsedLyrics.type !== 'synced') return -1;
    const adjustedTime = currentTime + 0.2;
    
    for (let i = parsedLyrics.lines.length - 1; i >= 0; i--) {
      const line = parsedLyrics.lines[i];
      if (line.isSynced && line.time <= adjustedTime) {
        return i;
      }
    }
    return -1;
  }, [parsedLyrics, currentTime]);

  const [isHoveringLyrics, setIsHoveringLyrics] = useState(false);

  useEffect(() => {
    if (activeLineIndex !== -1 && lyricsContainerRef.current && !isHoveringLyrics) {
       const activeEl = lyricsContainerRef.current.children[activeLineIndex] as HTMLElement;
       
       if (activeEl) {
         const scrollContainer = lyricsContainerRef.current.closest('.overflow-y-auto');
         
         if (scrollContainer) {
             const containerHeight = scrollContainer.clientHeight;
             const elementTop = activeEl.offsetTop;
             const elementHeight = activeEl.clientHeight;
             
             const targetScrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
             
             scrollContainer.scrollTo({
               top: Math.max(0, targetScrollTop),
               behavior: 'smooth'
             });
         }
       }
    }
  }, [activeLineIndex, isHoveringLyrics]);

  return (
    <div className="flex-1 bg-[var(--bg-secondary)] rounded-3xl overflow-y-auto m-4 relative scroll-smooth border border-[var(--border)] shadow-2xl z-50">
        <div className="sticky top-0 bg-[var(--bg-secondary)]/90 backdrop-blur-md px-8 py-6 flex items-center justify-between z-10 border-b border-[var(--border)]">
            <div className="flex items-center gap-4">
                <div 
                    className="bg-[var(--bg-tertiary)]/70 rounded-full p-2 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-all hover:scale-110 active:scale-95"
                    onClick={onClose}
                >
                    <ChevronLeft size={24} className="text-[var(--text-secondary)]" />
                </div>
            </div>
        </div>

        <div 
          className="px-12 pb-32 min-h-full flex flex-col items-start justify-start text-left pt-12"
          onMouseEnter={() => setIsHoveringLyrics(true)}
          onMouseLeave={() => setIsHoveringLyrics(false)}
        >
            {currentSong ? (
                <div className="max-w-5xl w-full animate-in fade-in duration-500">
                    <div className="mb-16 flex items-end gap-10">
                        {currentSong.artwork ? (
                            <img src={currentSong.artwork} alt="Album Art" className="w-48 h-48 object-cover rounded-2xl shadow-2xl ring-1 ring-white/10" />
                        ) : (
                            <div className="w-48 h-48 bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] rounded-2xl shadow-2xl flex items-center justify-center border border-[var(--border)] ring-1 ring-white/10">
                                <Music size={56} className="text-[var(--text-secondary)]" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-5xl font-bold text-[var(--text-main)] mb-4 tracking-tight">{currentSong.title}</h1>
                            <p className="text-2xl text-[var(--text-secondary)] font-medium">{currentSong.artist}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-8" ref={lyricsContainerRef}>
                        {parsedLyrics && parsedLyrics.lines.length > 0 ? (
                            parsedLyrics.lines.map((line, index) => {
                              const isActive = index === activeLineIndex;
                              
                              return (
                                <p 
                                  key={index} 
                                  className={`
                                    text-4xl font-bold transition-all duration-300 leading-normal origin-left cursor-pointer
                                    ${isActive ? 'text-[var(--accent)] scale-105' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'}
                                    ${parsedLyrics.type === 'plain' ? 'text-[var(--text-secondary)] hover:text-[var(--text-main)]' : ''}
                                  `}
                                >
                                  {line.text || t.instrumental}
                                </p>
                              );
                            })
                        ) : (
                            <div className="flex flex-col items-start gap-4 py-10">
                                <p className="text-3xl font-bold text-[var(--text-secondary)]">{t.noLyricsFound}</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 w-full justify-center h-[60vh]">
                    <Music size={64} className="text-[var(--text-secondary)]" />
                    <p className="text-xl text-[var(--text-secondary)]">{t.playToSeeLyrics}</p>
                </div>
            )}
        </div>
    </div>
  );
}
