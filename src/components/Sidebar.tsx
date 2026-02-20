import { Home, Search, Library, Plus, Settings, List, Trash2 } from 'lucide-react';
import type { Playlist } from '../types';
import songifyLogo from '../assets/Songify.png';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  onNavigate?: (view: 'home' | 'search' | 'settings' | 'playlist' | 'library' | 'artist', playlistId?: string) => void;
  currentView?: 'home' | 'search' | 'settings' | 'playlist' | 'library' | 'artist';
  playlists?: Playlist[];
  onCreatePlaylist?: () => void;
  onDeletePlaylist?: (id: string) => void;
  currentPlaylistId?: string | null;
}

export function Sidebar({ onNavigate, currentView, playlists = [], onCreatePlaylist, onDeletePlaylist, currentPlaylistId }: SidebarProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full h-full flex flex-col gap-6 bg-[var(--bg-secondary)]/80 backdrop-blur-2xl border border-[var(--border)] rounded-3xl shadow-2xl transition-all duration-300">
      {/* App Logo/Header */}
      <div className="px-6 pt-8 pb-2 flex items-center gap-3">
        <div className="p-1.5 rounded-xl shadow-lg shadow-[var(--accent)]/10 ring-1 ring-white/10" style={{ backgroundColor: '#0D0F13' }}>
            <img src={songifyLogo} alt="Songify Logo" className="w-8 h-8 object-contain" />
        </div>
        <span className="text-2xl font-black tracking-tight text-[var(--text-main)]">Songify</span>
      </div>

      <div className="flex flex-col gap-2 px-4">
        <div 
          className={`group flex items-center gap-4 cursor-pointer transition-all duration-300 px-4 py-3.5 rounded-2xl font-bold ${currentView === 'home' ? 'bg-[var(--accent)] text-[var(--bg-main)] shadow-xl shadow-[var(--accent)]/30 scale-[1.02]' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-tertiary)] hover:scale-[1.02]'}`}
          onClick={() => onNavigate?.('home')}
        >
          <Home size={22} className={`transition-transform duration-300 ${currentView === 'home' ? 'scale-110' : 'group-hover:scale-110'}`} />
          <span className="text-base tracking-wide">{t.home}</span>
        </div>
        <div 
          className={`group flex items-center gap-4 cursor-pointer transition-all duration-300 px-4 py-3.5 rounded-2xl font-bold ${currentView === 'search' || currentView === 'artist' ? 'bg-[var(--accent)] text-[var(--bg-main)] shadow-xl shadow-[var(--accent)]/30 scale-[1.02]' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-tertiary)] hover:scale-[1.02]'}`}
          onClick={() => onNavigate?.('search')}
        >
          <Search size={22} className={`transition-transform duration-300 ${currentView === 'search' || currentView === 'artist' ? 'scale-110' : 'group-hover:scale-110'}`} />
          <span className="text-base tracking-wide">{t.search}</span>
        </div>
        <div 
          className={`group flex items-center gap-4 cursor-pointer transition-all duration-300 px-4 py-3.5 rounded-2xl font-bold ${currentView === 'library' ? 'bg-[var(--accent)] text-[var(--bg-main)] shadow-xl shadow-[var(--accent)]/30 scale-[1.02]' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-tertiary)] hover:scale-[1.02]'}`}
          onClick={() => onNavigate?.('library')}
        >
          <Library size={22} className={`transition-transform duration-300 ${currentView === 'library' ? 'scale-110' : 'group-hover:scale-110'}`} />
          <span className="text-base tracking-wide">{t.myMusic || t.library}</span>
        </div>
        <div 
          className={`group flex items-center gap-4 cursor-pointer transition-all duration-300 px-4 py-3.5 rounded-2xl font-bold ${currentView === 'settings' ? 'bg-[var(--accent)] text-[var(--bg-main)] shadow-xl shadow-[var(--accent)]/30 scale-[1.02]' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-tertiary)] hover:scale-[1.02]'}`}
          onClick={() => onNavigate?.('settings')}
        >
          <Settings size={22} className={`transition-transform duration-300 ${currentView === 'settings' ? 'scale-110' : 'group-hover:scale-110'}`} />
          <span className="text-base tracking-wide">{t.settings}</span>
        </div>
      </div>

      <div className="flex-1 mx-4 mb-4 bg-[var(--bg-tertiary)]/30 rounded-2xl overflow-hidden flex flex-col border border-[var(--border)]/50">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest">
            <Library size={14} />
            <span>{t.library}</span>
          </div>
          <div className="flex items-center gap-1">
             <button 
               className="text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-tertiary)] p-2 rounded-lg transition-all hover:scale-110 active:scale-95"
               onClick={onCreatePlaylist}
               title={t.createPlaylist}
             >
                <Plus size={16} />
             </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar space-y-1">
            {playlists.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center p-4 opacity-50">
                  <div className="bg-[var(--bg-tertiary)] p-4 rounded-full mb-3 shadow-inner">
                    <List size={24} />
                  </div>
                  <p className="text-sm font-medium">{t.noPlaylistsCreated}</p>
                  <button onClick={onCreatePlaylist} className="text-xs text-[var(--accent)] hover:underline mt-2 font-bold uppercase tracking-wide">{t.newPlaylist}</button>
              </div>
            ) : (
                playlists.map(playlist => (
                  <div 
                    key={playlist.id}
                    className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${currentView === 'playlist' && currentPlaylistId === playlist.id ? 'bg-[var(--bg-tertiary)] text-[var(--text-main)] border-[var(--border)] shadow-sm' : 'hover:bg-[var(--bg-tertiary)] hover:border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'}`}
                    onClick={() => onNavigate?.('playlist', playlist.id)}
                  >
                    <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text-main)] shadow-sm group-hover:shadow-md transition-all group-hover:scale-105 overflow-hidden">
                      {playlist.coverPath ? (
                          <img src={playlist.coverPath} alt="" className="w-full h-full object-cover" />
                      ) : (
                          <List size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate text-sm">{playlist.name}</div>
                      <div className="text-xs opacity-60 truncate font-medium">{playlist.songs.length} {t.songs}</div>
                    </div>
                    <button 
                      className="opacity-0 group-hover:opacity-100 p-2 text-[var(--text-secondary)] hover:text-red-500 transition-all hover:bg-[var(--bg-main)] rounded-lg hover:scale-110 active:scale-95 shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlaylist?.(playlist.id);
                      }}
                      title={t.deletePlaylist}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
