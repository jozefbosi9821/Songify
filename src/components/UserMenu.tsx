import { User, LogOut, X, Settings, BarChart2, Music, Clock, Loader2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { CONFIG } from '../config';

interface UserMenuProps {
  username: string | null;
  onLogin: () => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  onShowProfile?: (tab?: 'personal' | 'global' | 'settings') => void;
}

interface UserStats {
  totalPlays?: number;
  totalTime?: number; // in seconds
  topArtist?: string;
  memberSince?: string;
  avatarUrl?: string;
}

export const UserMenu = React.memo(function UserMenu({ username, onLogin, onLogout, isOpen, onClose, onShowProfile }: UserMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const justOpenedRef = useRef(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Prevent the first document click after opening from immediately closing the menu.
      if (justOpenedRef.current) {
        justOpenedRef.current = false;
        return;
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      justOpenedRef.current = true;
      // Use `click` (not `mousedown`) so button `onClick` handlers run first.
      document.addEventListener('click', handleClickOutside);
      if (username) {
        fetchStats();
      }
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, onClose, username]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const data = await api.getStats();
      if (data) setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 flex items-start justify-end pointer-events-none">
      <div 
        ref={menuRef} 
        className="mt-16 mr-4 bg-black/80 border border-white/10 rounded-2xl shadow-2xl p-0 w-full sm:w-96 backdrop-blur-2xl max-h-[80vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User size={20} className="text-purple-500" />
            Profile
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {username ? (
          <div className="p-6 space-y-6">
            {/* User Info Card */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  {stats?.avatarUrl ? (
                    <img 
                      src={stats.avatarUrl.startsWith('http') ? stats.avatarUrl : `${CONFIG.BACKEND.URL}${stats.avatarUrl}`} 
                      alt={username || 'User'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('bg-zinc-800');
                      }}
                    />
                  ) : (
                    <User size={32} className="text-gray-400" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white truncate">{username}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">
                    Free Plan
                  </span>
                  {stats?.memberSince && (
                    <span>Since {new Date(stats.memberSince).getFullYear()}</span>
                  )}
                </div>
              </div>
            </div>

            {loadingStats ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-purple-500" />
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <Music size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Plays</span>
                  </div>
                  <p className="text-2xl font-black text-white">{stats.totalPlays?.toLocaleString() || 0}</p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 text-pink-400 mb-2">
                    <Clock size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Minutes</span>
                  </div>
                  <p className="text-2xl font-black text-white">
                    {Math.round((stats.totalTime || 0) / 60).toLocaleString()}
                  </p>
                </div>

                <div className="col-span-2 bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-2 text-blue-400 mb-2 relative z-10">
                    <BarChart2 size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Top Artist</span>
                  </div>
                  <p className="text-lg font-bold text-white truncate relative z-10">
                    {stats.topArtist || 'No data yet'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm bg-white/5 rounded-xl border border-dashed border-white/10">
                Start listening to see stats!
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <button 
                onClick={() => {
                    onShowProfile?.('personal');
                    onClose();
                }}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/5 hover:border-white/20 flex items-center px-4 group"
              >
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors mr-3">
                  <BarChart2 size={18} />
                </div>
                <span className="font-medium text-sm">View Full Profile</span>
              </button>

              <button 
                onClick={() => {
                  onShowProfile?.('settings');
                  onClose();
                }}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/5 hover:border-white/20 flex items-center px-4 group"
              >
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors mr-3">
                  <Settings size={18} />
                </div>
                <span className="font-medium text-sm">Account Settings</span>
              </button>
              
              <button 
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-3 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl transition-all border border-red-500/10 hover:border-red-500/20 flex items-center px-4 group mt-4"
              >
                <div className="p-2 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors mr-3">
                  <LogOut size={18} />
                </div>
                <span className="font-medium text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <User size={32} className="text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Not Signed In</h3>
              <p className="text-gray-400 text-sm">
                Sign in to sync your library, track stats, and access your music anywhere.
              </p>
            </div>
            <button
              onClick={() => {
                onLogin();
                onClose();
              }}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
