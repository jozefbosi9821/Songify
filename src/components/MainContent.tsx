import { ChevronLeft, ChevronRight, Music, Play, Clock, MoreHorizontal, Edit2, ArrowDownAZ, User, ListPlus, PlayCircle, Disc, Search } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Song, Playlist } from '../types';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface MainContentProps {
  songs?: Song[];
  currentSongIndex?: number;
  isPlaying?: boolean;
  onPlaySong?: (index: number) => void;
  currentTime?: number;
  playlists?: Playlist[];
  onAddToPlaylist?: (playlistId: string, songPath: string) => void;
  title?: string;
  subtitle?: string;
  color?: string;
  currentPlaylistId?: string | null;
  onRemoveFromPlaylist?: (playlistId: string, songPath: string) => void;
  onReorderPlaylist?: (playlistId: string, fromIndex: number, toIndex: number) => void;
  onRenamePlaylist?: (id: string, newName: string) => void;
  onDeleteSong?: (songPath: string) => void;
  onPlayNext?: (songPath: string) => void;
  onAddToQueue?: (songPath: string) => void;
  onGoToArtist?: (artist: string) => void;
  onEditPlaylist?: (id: string, data: Partial<Playlist>) => void;
  onSortPlaylist?: (playlistId: string, sortBy: 'title' | 'artist' | 'album') => void;
}

export function MainContent({ 
  songs = [], 
  currentSongIndex, 
  isPlaying, 
  onPlaySong, 
  playlists = [],
  onAddToPlaylist,
  title = "My Music",
  subtitle = "Jozef Gaming",
  color = "from-[var(--accent)]/50 to-[var(--bg-secondary)]",
  currentPlaylistId,
  onRenamePlaylist,
  onRemoveFromPlaylist,
  onDeleteSong,
  onPlayNext,
  onAddToQueue,
  onGoToArtist,
  onEditPlaylist,
  onSortPlaylist,
  onReorderPlaylist
}: MainContentProps) {
  const { t } = useLanguage();
  const [activeMenuSongPath, setActiveMenuSongPath] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredSongs = songs.filter(song => {
      if (!searchTerm) return true;
      const lower = searchTerm.toLowerCase();
      return (
          song.title.toLowerCase().includes(lower) ||
          song.artist.toLowerCase().includes(lower) ||
          song.album.toLowerCase().includes(lower)
      );
  });

  const handleDragStart = (e: React.DragEvent, index: number) => {
      if (searchTerm) return; // Disable drag when searching
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      // Set a ghost image or data if needed, but usually default is fine
  };

  const handleDragOver = (e: React.DragEvent) => {
      if (searchTerm) return;
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      if (searchTerm) return;
      e.preventDefault();
      
      if (draggedIndex !== null && draggedIndex !== dropIndex && currentPlaylistId && onReorderPlaylist) {
          onReorderPlaylist(currentPlaylistId, draggedIndex, dropIndex);
      }
      setDraggedIndex(null);
  };

  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  useEffect(() => {
      if (currentPlaylistId) {
          const p = playlists.find(pl => pl.id === currentPlaylistId);
          setTempDescription(p?.description || '');
      } else {
          setTempDescription('');
      }
  }, [currentPlaylistId, playlists]);

  const handleSaveTitle = () => {
    if (currentPlaylistId && onRenamePlaylist && tempTitle.trim()) {
      onRenamePlaylist(currentPlaylistId, tempTitle);
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (currentPlaylistId && onEditPlaylist) {
        onEditPlaylist(currentPlaylistId, { description: tempDescription });
    }
    setIsEditingDescription(false);
  };

  const handleCoverClick = () => {
      if (currentPlaylistId) {
          fileInputRef.current?.click();
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && currentPlaylistId && onEditPlaylist) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onEditPlaylist(currentPlaylistId, { coverPath: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuSongPath(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 bg-[var(--bg-secondary)] rounded-3xl overflow-y-auto relative border border-[var(--border)] shadow-2xl">
        <div className="sticky top-0 bg-[var(--bg-secondary)]/90 backdrop-blur-md px-8 py-6 flex items-center justify-between z-10 border-b border-[var(--border)]">
            <div className="flex items-center gap-4">
                <div className="bg-[var(--bg-tertiary)]/70 rounded-full p-2 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-all hover:scale-110 active:scale-95">
                    <ChevronLeft size={24} className="text-[var(--text-secondary)]" />
                </div>
                <div className="bg-[var(--bg-tertiary)]/70 rounded-full p-2 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-all hover:scale-110 active:scale-95">
                    <ChevronRight size={24} className="text-[var(--text-secondary)]" />
                </div>
            </div>
        </div>

        <div className="px-8 pb-32">
            {/* Header Section */}
            <div className="mb-10 relative group">
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20 rounded-3xl blur-3xl transition-opacity duration-700 group-hover:opacity-30`} />
              
              <div className="relative z-10 flex flex-row items-end gap-8 p-8 bg-[var(--bg-tertiary)]/20 backdrop-blur-md rounded-3xl border border-[var(--border)] shadow-xl">
                  <div 
                      className={`w-48 h-48 shadow-2xl flex items-center justify-center rounded-2xl border border-[var(--border)]/50 bg-[var(--bg-secondary)] overflow-hidden shrink-0 relative group/cover ${currentPlaylistId ? 'cursor-pointer' : ''}`}
                      onClick={handleCoverClick}
                  >
                    {currentPlaylistId && playlists.find(p => p.id === currentPlaylistId)?.coverPath ? (
                        <img src={playlists.find(p => p.id === currentPlaylistId)?.coverPath} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <Music size={64} className="text-[var(--text-main)] drop-shadow-lg opacity-80" />
                    )}
                    {currentPlaylistId && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity">
                            <Edit2 className="text-white" size={32} />
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                  
                  <div className="flex flex-col justify-end w-full overflow-hidden pb-2 text-left items-start">
                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 bg-[var(--bg-tertiary)]/50 w-fit px-3 py-1 rounded-full border border-[var(--border)]">{!currentPlaylistId ? t.library : t.playlist}</span>
                    
                    {isEditingTitle && currentPlaylistId ? (
                        <input
                            className="text-6xl font-black mb-4 bg-transparent border-b-2 border-[var(--text-main)] outline-none w-full text-[var(--text-main)] placeholder-[var(--text-secondary)] text-left"
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={handleSaveTitle}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                            autoFocus
                        />
                    ) : (
                        <h1 
                            className={`text-6xl font-black mb-2 truncate text-[var(--text-main)] tracking-tight ${currentPlaylistId ? 'cursor-pointer hover:text-[var(--accent)] transition-colors' : ''}`}
                            onClick={() => {
                                if (currentPlaylistId) {
                                    setTempTitle(title);
                                    setIsEditingTitle(true);
                                }
                            }}
                            title={currentPlaylistId ? t.clickToRename : undefined}
                        >
                            {title}
                        </h1>
                    )}
                    
                    {currentPlaylistId ? (
                        isEditingDescription ? (
                            <textarea
                                className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--text-secondary)] mb-4 outline-none resize-none focus:border-[var(--accent)]"
                                value={tempDescription}
                                onChange={(e) => setTempDescription(e.target.value)}
                                onBlur={handleSaveDescription}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSaveDescription();
                                    }
                                }}
                                rows={2}
                                autoFocus
                                placeholder={t.addDescription || "Add a description..."}
                            />
                        ) : (
                            <p 
                                className="text-sm text-[var(--text-secondary)] mb-4 font-medium max-w-2xl line-clamp-2 hover:text-[var(--text-main)] cursor-pointer transition-colors"
                                onClick={() => setIsEditingDescription(true)}
                                title="Click to edit description"
                            >
                                {playlists.find(p => p.id === currentPlaylistId)?.description || t.noDescription || "No description"}
                            </p>
                        )
                    ) : (
                        <div className="flex items-center gap-4 text-sm font-bold text-[var(--text-secondary)] mb-4">
                            <span>{subtitle}</span>
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-4 w-full mt-2">
                        <div className="flex items-center justify-between w-full">
                             <div className="flex items-center gap-4">
                                <button 
                                    className="bg-[var(--accent)] text-black rounded-full p-4 hover:scale-105 active:scale-95 transition-transform shadow-lg hover:shadow-[var(--accent)]/50 flex items-center justify-center"
                                    onClick={() => {
                                        if (filteredSongs.length > 0 && onPlaySong) {
                                            const firstSong = filteredSongs[0];
                                            const originalIndex = songs.findIndex(s => s.path === firstSong.path);
                                            if (originalIndex !== -1) onPlaySong(originalIndex);
                                        }
                                    }}
                                >
                                    <Play size={28} fill="currentColor" className="ml-1" />
                                </button>
                                
                                <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)]">
                                    <span>{filteredSongs.length} {t.songs}</span>
                                </div>
                             </div>

                             <div className="flex items-center gap-3">
                                <div className="relative group/search">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within/search:text-[var(--accent)] transition-colors" />
                                    <input 
                                        type="text"
                                        placeholder={t.search || "Search in playlist"}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] focus:bg-[var(--bg-tertiary)] border border-transparent focus:border-[var(--accent)] rounded-full py-2 pl-10 pr-4 text-sm text-[var(--text-main)] outline-none transition-all w-48 focus:w-64 placeholder-[var(--text-secondary)]"
                                    />
                                </div>

                                {currentPlaylistId && (
                                    <div className="flex items-center gap-1 bg-[var(--bg-tertiary)]/50 p-1 rounded-lg border border-[var(--border)]">
                                        <button 
                                            className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                                            onClick={() => onSortPlaylist?.(currentPlaylistId, 'title')}
                                            title="Sort by Title"
                                        >
                                            <ArrowDownAZ size={16} />
                                        </button>
                                        <button 
                                            className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                                            onClick={() => onSortPlaylist?.(currentPlaylistId, 'artist')}
                                            title="Sort by Artist"
                                        >
                                            <User size={16} />
                                        </button>
                                        <button 
                                            className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                                            onClick={() => onSortPlaylist?.(currentPlaylistId, 'album')}
                                            title="Sort by Album"
                                        >
                                            <Disc size={16} />
                                        </button>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                  </div>
              </div>
            </div>

            {/* Song List */}
            <div className="space-y-2">
                <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-3 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border)] mb-2">
                    <div className="w-8 text-center">#</div>
                    <div>{t.title}</div>
                    <div>{t.album}</div>
                    <div className="flex justify-end"><Clock size={14} /></div>
                    <div className="w-8"></div>
                </div>

                {filteredSongs.map((song, index) => {
                    const originalIndex = songs.findIndex(s => s.path === song.path);
                    const isCurrentSong = currentSongIndex === originalIndex;
                    
                    return (
                        <div 
                            key={song.path}
                            draggable={!searchTerm && !!currentPlaylistId}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`group grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-3 rounded-xl items-center hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)] ${isCurrentSong ? 'bg-[var(--bg-tertiary)] border-[var(--border)] shadow-sm' : ''} ${draggedIndex === index ? 'opacity-40 border-dashed border-[var(--accent)]' : ''}`}
                            onDoubleClick={() => onPlaySong?.(originalIndex)}
                        >
                            <div className="w-8 text-center flex justify-center text-[var(--text-secondary)] font-mono text-sm">
                                {isCurrentSong && isPlaying ? (
                                    <div className="flex items-end gap-0.5 h-4 w-4 justify-center pb-0.5">
                                        <div className="w-1 bg-[var(--accent)] animate-[music-bar_1s_ease-in-out_infinite]" style={{ animationDelay: '0s' }} />
                                        <div className="w-1 bg-[var(--accent)] animate-[music-bar_1s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-1 bg-[var(--accent)] animate-[music-bar_1s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                ) : (
                                    <span className="group-hover:hidden">{index + 1}</span>
                                )}
                                <Play size={16} className={`hidden group-hover:block ${isCurrentSong ? 'text-[var(--accent)]' : 'text-[var(--text-main)]'}`} onClick={() => onPlaySong?.(originalIndex)} />
                            </div>
                            
                            <div className="flex items-center gap-4 overflow-hidden">
                                {song.artwork ? (
                                    <img src={song.artwork} alt="" className="w-10 h-10 rounded-lg object-cover shadow-sm select-none" />
                                ) : (
                                    <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center shadow-sm">
                                        <Music size={20} className="text-[var(--text-secondary)]" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <div className={`font-bold truncate text-sm ${isCurrentSong ? 'text-[var(--accent)]' : 'text-[var(--text-main)]'}`}>{song.title}</div>
                                    <div className="text-xs text-[var(--text-secondary)] truncate">{song.artist}</div>
                                </div>
                            </div>
                            
                            <div className="text-sm text-[var(--text-secondary)] truncate font-medium">
                                {song.album !== 'Unknown Album' ? song.album : <span className="opacity-50">-</span>}
                            </div>
                            
                            <div className="text-sm text-[var(--text-secondary)] font-mono text-right">
                                {formatTime(song.duration)}
                            </div>
                            
                            <div className="relative flex justify-end">
                                <div 
                                    className="p-2 hover:bg-[var(--bg-main)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuSongPath(activeMenuSongPath === song.path ? null : song.path);
                                    }}
                                >
                                    <MoreHorizontal size={16} />
                                </div>
                                
                                {activeMenuSongPath === song.path && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="py-1 border-b border-[var(--border)]">
                                            <button 
                                                className="w-full text-left px-4 py-2 hover:bg-[var(--bg-tertiary)] text-sm font-medium text-[var(--text-main)] transition-colors flex items-center gap-3"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onPlayNext?.(song.path);
                                                    setActiveMenuSongPath(null);
                                                }}
                                            >
                                                <PlayCircle size={14} />
                                                <span>{t.playNext || "Play Next"}</span>
                                            </button>
                                            <button 
                                                className="w-full text-left px-4 py-2 hover:bg-[var(--bg-tertiary)] text-sm font-medium text-[var(--text-main)] transition-colors flex items-center gap-3"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddToQueue?.(song.path);
                                                    setActiveMenuSongPath(null);
                                                }}
                                            >
                                                <ListPlus size={14} />
                                                <span>{t.addToQueue || "Add to Queue"}</span>
                                            </button>
                                            <button 
                                                className="w-full text-left px-4 py-2 hover:bg-[var(--bg-tertiary)] text-sm font-medium text-[var(--text-main)] transition-colors flex items-center gap-3"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (song.artist) onGoToArtist?.(song.artist);
                                                    setActiveMenuSongPath(null);
                                                }}
                                            >
                                                <User size={14} />
                                                <span>{t.goToArtist || "Go to Artist"}</span>
                                            </button>
                                        </div>

                                        {currentPlaylistId ? (
                                             <button 
                                                className="w-full text-left px-4 py-3 hover:bg-[var(--bg-tertiary)] text-sm font-bold text-red-500 hover:text-red-400 transition-colors flex items-center gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRemoveFromPlaylist?.(currentPlaylistId, song.path);
                                                    setActiveMenuSongPath(null);
                                                }}
                                            >
                                                <span>{t.removeFromPlaylist}</span>
                                            </button>
                                        ) : (
                                            <>
                                                <div className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-tertiary)]/30 border-b border-[var(--border)]">
                                                    {t.addToPlaylist}
                                                </div>
                                                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                                    {playlists.length > 0 ? (
                                                        playlists.map(playlist => (
                                                            <button 
                                                                key={playlist.id}
                                                                className="w-full text-left px-4 py-3 hover:bg-[var(--bg-tertiary)] text-sm font-medium text-[var(--text-main)] transition-colors truncate"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onAddToPlaylist?.(playlist.id, song.path);
                                                                    setActiveMenuSongPath(null);
                                                                }}
                                                            >
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteSong?.(song.path);
                                                            setActiveMenuSongPath(null);
                                                        }}
                                                    >
                                                        <span>{t.removeFromLibrary}</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
}
