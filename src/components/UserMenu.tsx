import { User, LogOut, Cloud, X, Settings, Camera, Lock, Music, Clock, BarChart2, Loader2, Upload, Calendar } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { CONFIG } from '../config';

interface UserMenuProps {
  username: string | null;
  onLogin: () => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface UserStats {
  totalPlays?: number;
  totalTime?: number; // in seconds
  topArtist?: string;
  memberSince?: string;
  avatarUrl?: string;
}

export function UserMenu({ username, onLogin, onLogout, isOpen, onClose }: UserMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<'overview' | 'settings'>('overview');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Settings state
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
        setView('overview'); // Reset view on close
        setMessage(null);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (username) {
        fetchStats();
      }
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatarFile) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.updateAvatar(avatarFile);
      setMessage({ type: 'success', text: 'Profile picture updated!' });
      setAvatarFile(null);
      // Update local stats with new avatar URL
      if (res.avatarUrl) {
        setStats(prev => prev ? { ...prev, avatarUrl: res.avatarUrl } : { avatarUrl: res.avatarUrl });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update avatar' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwords.new.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      await api.changePassword(passwords.current, passwords.new);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-8 z-50 animate-in fade-in zoom-in-95 duration-200">
      <div ref={menuRef} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 w-96 backdrop-blur-xl max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-main)]">
            {view === 'settings' ? 'Account Settings' : 'Profile'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-[var(--bg-tertiary)] rounded-full text-[var(--text-secondary)] transition-colors">
            <X size={20} />
          </button>
        </div>

        {username ? (
          <>
            {view === 'overview' ? (
              <div className="flex flex-col gap-6">
                {/* User Info */}
                <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border)]">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] overflow-hidden relative">
                    {stats?.avatarUrl ? (
                      <img 
                        src={`${CONFIG.BACKEND.URL}${stats.avatarUrl}`} 
                        alt={username || 'User'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon on error
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.remove('bg-transparent');
                          e.currentTarget.parentElement?.classList.add('bg-[var(--accent)]/20');
                        }}
                      />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-main)] text-lg">{username}</h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                      Synced & Backup enabled
                    </p>
                    {stats?.memberSince && (
                      <p className="text-[10px] text-[var(--text-secondary)]/70 mt-1 flex items-center gap-1">
                        <Calendar size={10} />
                        Since {new Date(stats.memberSince).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Statistics</h3>
                  {loadingStats ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-[var(--accent)]" />
                    </div>
                  ) : stats ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[var(--bg-tertiary)]/30 p-3 rounded-lg border border-[var(--border)]">
                        <div className="flex items-center gap-2 text-[var(--accent)] mb-1">
                          <Music size={16} />
                          <span className="text-xs font-bold">Plays</span>
                        </div>
                        <p className="text-xl font-black text-[var(--text-main)]">{stats.totalPlays || 0}</p>
                      </div>
                      <div className="bg-[var(--bg-tertiary)]/30 p-3 rounded-lg border border-[var(--border)]">
                        <div className="flex items-center gap-2 text-pink-500 mb-1">
                          <Clock size={16} />
                          <span className="text-xs font-bold">Time</span>
                        </div>
                        <p className="text-xl font-black text-[var(--text-main)]">
                          {Math.round((stats.totalTime || 0) / 60)}m
                        </p>
                      </div>
                      <div className="col-span-2 bg-[var(--bg-tertiary)]/30 p-3 rounded-lg border border-[var(--border)]">
                        <div className="flex items-center gap-2 text-purple-500 mb-1">
                          <BarChart2 size={16} />
                          <span className="text-xs font-bold">Top Artist</span>
                        </div>
                        <p className="text-lg font-bold text-[var(--text-main)] truncate">
                          {stats.topArtist || 'No data yet'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-[var(--text-secondary)] text-sm">
                      Start listening to see stats!
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button 
                    onClick={() => setView('settings')}
                    className="w-full py-3 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 text-[var(--text-main)] rounded-xl transition-colors text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Settings size={18} />
                    Account Settings
                  </button>
                  <button 
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="w-full py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <button 
                  onClick={() => {
                    setView('overview');
                    setMessage(null);
                  }}
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] flex items-center gap-1 font-medium"
                >
                  ← Back to Profile
                </button>

                {message && (
                  <div className={`p-3 rounded-lg text-sm font-medium ${
                    message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {message.text}
                  </div>
                )}

                {/* Avatar Change */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Camera size={16} /> Profile Picture
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden border-2 border-[var(--border)]">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User size={32} className="text-[var(--text-secondary)]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block w-full">
                        <span className="sr-only">Choose profile photo</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="block w-full text-xs text-[var(--text-secondary)]
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-xs file:font-semibold
                            file:bg-[var(--accent)] file:text-white
                            hover:file:bg-[var(--accent)]/90
                            cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                  {avatarFile && (
                    <button 
                      onClick={handleUpdateAvatar}
                      disabled={loading}
                      className="w-full py-2 bg-[var(--accent)] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      Update Picture
                    </button>
                  )}
                </div>

                <div className="h-px bg-[var(--border)]" />

                {/* Password Change */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Lock size={16} /> Change Password
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={passwords.current}
                      onChange={e => setPasswords({...passwords, current: e.target.value})}
                      className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      value={passwords.new}
                      onChange={e => setPasswords({...passwords, new: e.target.value})}
                      className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwords.confirm}
                      onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                      className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                  <button 
                    onClick={handleChangePassword}
                    disabled={loading || !passwords.current || !passwords.new}
                    className="w-full py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 text-[var(--text-main)] rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : 'Update Password'}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border)]">
                <div className="w-12 h-12 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                    <User size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-[var(--text-main)]">Guest User</h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                        Sign in to sync your library
                    </p>
                </div>
            </div>
            <button 
                onClick={() => {
                    onLogin();
                    onClose();
                }}
                className="w-full py-3 bg-[var(--accent)] text-white hover:opacity-90 rounded-xl transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/20"
            >
                <Cloud size={18} />
                Sign In / Register
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
