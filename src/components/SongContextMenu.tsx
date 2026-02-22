import { PlayCircle, ListPlus, User, Trash2 } from 'lucide-react';
import type { Song, Playlist } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SongContextMenuProps {
  song: Song;
  playlists: Playlist[];
  onClose: () => void;
  onPlayNext?: (path: string) => void;
  onAddToQueue?: (path: string) => void;
  onGoToArtist?: (artist: string) => void;
  onAddToPlaylist?: (playlistId: string, path: string) => void;
  onRemoveFromPlaylist?: (playlistId: string, path: string) => void;
  onDeleteSong?: (path: string) => void;
  currentPlaylistId?: string | null;
  position?: { x: number, y: number } | null;
}

export function SongContextMenu({ 
  song, 
  playlists, 
  onClose, 
  onPlayNext, 
  onAddToQueue, 
  onGoToArtist, 
  onAddToPlaylist, 
  onRemoveFromPlaylist, 
  onDeleteSong,
  currentPlaylistId,
  position 
}: SongContextMenuProps) {
  const { t } = useLanguage();

  // If position is provided, use fixed positioning (Context Menu)
  // Otherwise, use absolute positioning relative to parent (Button Menu)
  const style: React.CSSProperties = position ? {
    position: 'fixed',
    left: position.x,
    top: position.y,
    zIndex: 1000,
  } : {
    position: 'absolute',
    right: 0,
    top: '100%',
    marginTop: '0.5rem',
    zIndex: 50,
  };

  return (
    <>
        {/* Backdrop for fixed positioning to close on click outside */}
        {position && (
            <div 
                className="fixed inset-0 z-[999]" 
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }} 
            />
        )}

        <div 
            className="w-56 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={style}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="py-1 border-b border-[var(--border)]">
                <button 
                    className="w-full text-left px-4 py-2 hover:bg-[var(--bg-tertiary)] text-sm font-medium text-[var(--text-main)] transition-colors flex items-center gap-3"
                    onClick={() => {
                        onPlayNext?.(song.path);
                        onClose();
                    }}
                >
                    <PlayCircle size={14} />
                    <span>{t.playNext || "Play Next"}</span>
                </button>
                <button 
                    className="w-full text-left px-4 py-2 hover:bg-[var(--bg-tertiary)] text-sm font-medium text-[var(--text-main)] transition-colors flex items-center gap-3"
                    onClick={() => {
                        onAddToQueue?.(song.path);
                        onClose();
                    }}
                >
                    <ListPlus size={14} />
                    <span>{t.addToQueue || "Add to Queue"}</span>
                </button>
                <button 
                    className="w-full text-left px-4 py-2 hover:bg-[var(--bg-tertiary)] text-sm font-medium text-[var(--text-main)] transition-colors flex items-center gap-3"
                    onClick={() => {
                        if (song.artist) onGoToArtist?.(song.artist);
                        onClose();
                    }}
                >
                    <User size={14} />
                    <span>{t.goToArtist || "Go to Artist"}</span>
                </button>
            </div>

            {currentPlaylistId && (
                <button 
                    className="w-full text-left px-4 py-3 hover:bg-[var(--bg-tertiary)] text-sm font-bold text-red-500 hover:text-red-400 transition-colors flex items-center gap-2 border-b border-[var(--border)]"
                    onClick={() => {
                        onRemoveFromPlaylist?.(currentPlaylistId, song.path);
                        onClose();
                    }}
                >
                    <Trash2 size={14} />
                    <span>{t.removeFromPlaylist}</span>
                </button>
            )}

            <div className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-tertiary)]/30 border-b border-[var(--border)] flex justify-between items-center">
                {t.addToPlaylist}
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {playlists.length > 0 ? (
                    playlists.map(playlist => (
                        <button 
                            key={playlist.id}
                            className="w-full text-left px-4 py-3 hover:bg-[var(--bg-tertiary)] text-sm font-medium text-[var(--text-main)] transition-colors truncate flex items-center gap-2"
                            onClick={() => {
                                onAddToPlaylist?.(playlist.id, song.path);
                                onClose();
                            }}
                        >
                            <ListPlus size={14} className="text-[var(--text-secondary)]" />
                            {playlist.name}
                        </button>
                    ))
                ) : (
                    <div className="px-4 py-3 text-xs text-[var(--text-secondary)] italic text-center">
                        {t.noPlaylistsCreated}
                    </div>
                )}
            </div>
            <div className="border-t border-[var(--border)]">
                <button 
                    className="w-full text-left px-4 py-3 hover:bg-[var(--bg-tertiary)] text-sm font-bold text-red-500 hover:text-red-400 transition-colors flex items-center gap-2"
                    onClick={() => {
                        onDeleteSong?.(song.path);
                        onClose();
                    }}
                >
                    <Trash2 size={14} />
                    <span>{t.deleteSong}</span>
                </button>
            </div>
        </div>
    </>
  );
}
