import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CONFIG } from '../config';
import { Clock, Music, Mic2, BarChart2, Globe, Calendar, Play, Settings, Camera, Upload, Loader2, Lock } from 'lucide-react';

interface UserStats {
    totalPlays: number;
    totalTime: number;
    memberSince: string;
    avatarUrl: string;
    topArtist: string;
    topSongs: { title: string; artist: string; plays: number }[];
    topArtists: { artist: string; plays: number }[];
    activity: { date: string; count: number }[];
}

interface GlobalStats {
    totalPlays: number;
    topSongs: { title: string; artist: string; plays: number }[];
    topArtists: { artist: string; plays: number }[];
}

interface UserProfileProps {
    initialTab?: 'personal' | 'global' | 'settings';
}

export function UserProfile({ initialTab = 'personal' }: UserProfileProps) {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [activeTab, setActiveTab] = useState<'personal' | 'global' | 'settings'>(initialTab);
    const [loading, setLoading] = useState(true);
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    const [loadError, setLoadError] = useState<string | null>(null);

    // Settings state
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    // Update active tab if initialTab changes (e.g. navigation from menu)
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    async function loadData() {
        setLoading(true);
        setLoadError(null);
        try {
            const [personal, global] = await Promise.all([
                api.getStats(),
                api.getGlobalStats()
            ]);
            setStats(personal);
            setGlobalStats(global);
        } catch (error) {
            console.error('Failed to load profile data', error);
            setLoadError((error as any)?.message || 'Could not load profile stats right now.');
        } finally {
            setLoading(false);
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdateAvatar = async () => {
        if (!avatarFile) return;
        setActionLoading(true);
        setMessage(null);
        try {
            const res = await api.updateAvatar(avatarFile);
            setMessage({ type: 'success', text: 'Profile picture updated!' });
            setAvatarFile(null);
            // Update local stats with new avatar URL
            if (res.avatarUrl) {
                setStats(prev => prev ? { ...prev, avatarUrl: res.avatarUrl } : null);
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update avatar' });
        } finally {
            setActionLoading(false);
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
        
        setActionLoading(true);
        setMessage(null);
        try {
            await api.changePassword(passwords.current, passwords.new);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to change password' });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!stats) {
        if (!token) {
            return (
                <div className="p-8 text-center text-gray-500">
                    Please sign in again to load your stats.
                </div>
            );
        }

        return (
            <div className="p-8 text-center text-gray-500">
                {loadError || 'Could not load profile stats right now.'}
            </div>
        );
    }

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-black/40">
            {/* Hero Section */}
            <div className="relative h-64 w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 to-black/90 z-0" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=2800&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay z-0" />
                
                <div className="absolute bottom-0 left-0 w-full p-8 z-10 flex items-end gap-8">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 shadow-2xl shadow-purple-900/50">
                            <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                {stats.avatarUrl ? (
                                    <img 
                                        src={stats.avatarUrl.startsWith('http') ? stats.avatarUrl : `${CONFIG.BACKEND.URL}${stats.avatarUrl}`} 
                                        alt={username || 'User'} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-gray-500 text-4xl font-bold">
                                        {(username || 'U')[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setActiveTab('settings')}>
                                    <Camera className="text-white" size={32} />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-4 flex-1">
                        <h4 className="text-white/80 font-bold uppercase tracking-widest text-sm mb-1">Profile</h4>
                        <h1 className="text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">{username}</h1>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-300">
                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
                                <Calendar size={14} className="text-purple-400" />
                                Member since {new Date(stats.memberSince).getFullYear()}
                            </span>
                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
                                <BarChart2 size={14} className="text-pink-400" />
                                {stats.totalPlays.toLocaleString()} total plays
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center gap-5 hover:bg-white/10 transition-colors group">
                        <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/10">
                            <Play size={28} fill="currentColor" />
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Total Plays</div>
                            <div className="text-3xl font-black text-white">{stats.totalPlays.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center gap-5 hover:bg-white/10 transition-colors group">
                        <div className="w-14 h-14 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-pink-500/10">
                            <Clock size={28} />
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Time Listened</div>
                            <div className="text-3xl font-black text-white">{formatTime(stats.totalTime)}</div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center gap-5 hover:bg-white/10 transition-colors group">
                        <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/10">
                            <Mic2 size={28} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">Top Artist</div>
                            <div className="text-2xl font-black text-white truncate">{stats.topArtist || 'N/A'}</div>
                        </div>
                    </div>
                </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 mb-6 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('personal')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${
                        activeTab === 'personal' ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    My Statistics
                    {activeTab === 'personal' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('global')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${
                        activeTab === 'global' ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        Global Stats <Globe size={14} />
                    </span>
                    {activeTab === 'global' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${
                        activeTab === 'settings' ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        Account Settings <Settings size={14} />
                    </span>
                    {activeTab === 'settings' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'personal' ? (
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* Activity Chart (Simple Bar) */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <BarChart2 size={18} className="text-purple-400" />
                            Listening Activity (Last 7 Days)
                        </h3>
                        <div className="flex items-end justify-between h-32 gap-2">
                            {stats.activity.map((day, idx) => {
                                const max = Math.max(...stats.activity.map(d => d.count), 1);
                                const height = (day.count / max) * 100;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="w-full bg-white/5 rounded-t-lg relative h-full flex items-end overflow-hidden">
                                            <div 
                                                className="w-full bg-purple-500/50 group-hover:bg-purple-500 transition-colors rounded-t-lg min-h-[4px]"
                                                style={{ height: `${height}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 font-mono">
                                            {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                                        </span>
                                    </div>
                                );
                            })}
                            {stats.activity.length === 0 && (
                                <div className="w-full text-center text-gray-500 text-sm py-10">No recent activity</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Songs */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Music size={18} className="text-blue-400" />
                                Your Top Songs
                            </h3>
                            <div className="space-y-3">
                                {stats.topSongs.map((song, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="text-lg font-bold text-gray-600 w-6 text-center group-hover:text-white transition-colors">#{idx + 1}</span>
                                            <div className="truncate">
                                                <div className="font-medium text-white truncate">{song.title}</div>
                                                <div className="text-xs text-gray-400 truncate">{song.artist}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-full group-hover:bg-white/10 group-hover:text-gray-300 transition-colors">
                                            {song.plays} plays
                                        </div>
                                    </div>
                                ))}
                                {stats.topSongs.length === 0 && <div className="text-gray-500 text-sm">No songs played yet.</div>}
                            </div>
                        </div>

                        {/* Top Artists */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Mic2 size={18} className="text-pink-400" />
                                Your Top Artists
                            </h3>
                            <div className="space-y-3">
                                {stats.topArtists.map((artist, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="text-lg font-bold text-gray-600 w-6 text-center group-hover:text-white transition-colors">#{idx + 1}</span>
                                            <div className="truncate">
                                                <div className="font-medium text-white truncate">{artist.artist}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-full group-hover:bg-white/10 group-hover:text-gray-300 transition-colors">
                                            {artist.plays} plays
                                        </div>
                                    </div>
                                ))}
                                {stats.topArtists.length === 0 && <div className="text-gray-500 text-sm">No artists played yet.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'global' ? (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/5 rounded-xl p-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white">Global Community Stats</h3>
                            <p className="text-sm text-gray-400">See what everyone else is listening to</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Total Community Plays</div>
                            <div className="text-3xl font-bold text-white">{globalStats?.totalPlays.toLocaleString() || 0}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Global Top Songs */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Globe size={18} className="text-green-400" />
                                Global Top Songs
                            </h3>
                            <div className="space-y-3">
                                {globalStats?.topSongs.map((song, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="text-lg font-bold text-gray-600 w-6 text-center group-hover:text-white transition-colors">#{idx + 1}</span>
                                            <div className="truncate">
                                                <div className="font-medium text-white truncate">{song.title}</div>
                                                <div className="text-xs text-gray-400 truncate">{song.artist}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-full group-hover:bg-white/10 group-hover:text-gray-300 transition-colors">
                                            {song.plays} plays
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Global Top Artists */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Globe size={18} className="text-yellow-400" />
                                Global Top Artists
                            </h3>
                            <div className="space-y-3">
                                {globalStats?.topArtists.map((artist, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="text-lg font-bold text-gray-600 w-6 text-center group-hover:text-white transition-colors">#{idx + 1}</span>
                                            <div className="truncate">
                                                <div className="font-medium text-white truncate">{artist.artist}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-full group-hover:bg-white/10 group-hover:text-gray-300 transition-colors">
                                            {artist.plays} plays
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-300 max-w-2xl mx-auto">
                    {/* Settings Form */}
                    {message && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${
                            message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-8 space-y-8">
                        {/* Avatar Change */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Camera size={20} /> Profile Picture
                            </h3>
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border-2 border-white/10 relative group">
                                    {previewUrl || stats.avatarUrl ? (
                                        <img src={previewUrl || stats.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-500">{(username || 'U')[0].toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <label className="block w-full">
                                        <span className="sr-only">Choose profile photo</span>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="block w-full text-sm text-gray-400
                                                file:mr-4 file:py-2.5 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-purple-500 file:text-white
                                                hover:file:bg-purple-600
                                                cursor-pointer transition-colors"
                                        />
                                    </label>
                                    <p className="text-xs text-gray-500">Recommended: Square image, max 2MB.</p>
                                </div>
                            </div>
                            {avatarFile && (
                                <button 
                                    onClick={handleUpdateAvatar}
                                    disabled={actionLoading}
                                    className="w-full py-2.5 bg-purple-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-purple-600 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    Save New Picture
                                </button>
                            )}
                        </div>

                        <div className="h-px bg-white/10" />

                        {/* Password Change */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Lock size={20} /> Change Password
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Current Password</label>
                                    <input 
                                        type="password"
                                        value={passwords.current}
                                        onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">New Password</label>
                                    <input 
                                        type="password"
                                        value={passwords.new}
                                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                                        placeholder="Enter new password (min. 6 chars)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Confirm New Password</label>
                                    <input 
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleChangePassword}
                                disabled={actionLoading || !passwords.current || !passwords.new || !passwords.confirm}
                                className="w-full py-2.5 bg-white/10 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
    );
}
