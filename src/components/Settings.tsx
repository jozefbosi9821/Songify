import { Trash2, ArrowLeft, Palette, Info, Database, FolderOpen, Github, Monitor, Keyboard, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import songifyLogo from '../assets/Songify.png';
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../contexts/LanguageContext';

interface SettingsProps {
    onBack: () => void;
    currentTheme: string;
    onThemeChange: (theme: string) => void;
}

const LANGUAGES: { id: Language, name: string, flag: string }[] = [
    { id: 'en', name: 'English', flag: '🇺🇸' },
    { id: 'sq', name: 'Shqip (Albanian)', flag: '🇦🇱' },
    { id: 'es', name: 'Español', flag: '🇪🇸' },
    { id: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { id: 'fr', name: 'Français', flag: '🇫🇷' },
    { id: 'it', name: 'Italiano', flag: '🇮🇹' },
];

import { platform } from '../services/platform';

export function Settings({ onBack, currentTheme, onThemeChange }: SettingsProps) {
    const { language, setLanguage, t } = useLanguage();

    const themes = [
        { id: 'theme-midnight', name: t.themeMidnight, color: '#000000' },
        { id: 'theme-ocean', name: t.themeOcean, color: '#0b1121' },
        { id: 'theme-sunset', name: t.themeSunset, color: '#2a0a18' },
        { id: 'theme-forest', name: t.themeForest, color: '#05190f' },
        { id: 'theme-nebula', name: t.themeNebula, color: '#130f26' },
        { id: 'theme-gold', name: t.themeGold, color: '#1a1500' },
    ];

    const [isClearing, setIsClearing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [appVersion, setAppVersion] = useState<string>('0.0.0');
    const [userDataPath, setUserDataPath] = useState<string>('');
    const [downloadsPath, setDownloadsPath] = useState<string>('');

    useEffect(() => {
        platform.getAppVersion().then(setAppVersion);
        platform.getUserDataPath().then(setUserDataPath);
        platform.getDownloadsPath().then(setDownloadsPath);
    }, []);

    const handleClearCache = async () => {
        setIsClearing(true);
        setMessage(null);
        
        try {
            const success = await platform.clearCache();
            if (success) {
                setMessage('Cache cleared successfully!');
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage('Failed to clear cache.');
            }
        } catch (error) {
            console.error('Error clearing cache:', error);
            setMessage('Error occurred while clearing cache.');
        } finally {
            setIsClearing(false);
        }
    };

    const handleOpenDownloads = async () => {
        if (downloadsPath) {
            await platform.openPath(downloadsPath);
        }
    };

    const handleOpenUserData = async () => {
        if (userDataPath) {
            await platform.openPath(userDataPath);
        }
    };

    return (
        <div className="flex-1 bg-[var(--bg-secondary)] rounded-3xl overflow-y-auto relative animate-in fade-in duration-300 border border-[var(--border)] shadow-2xl custom-scrollbar">
             <div className="sticky top-0 bg-[var(--bg-secondary)]/90 backdrop-blur-md px-8 py-6 flex items-center justify-between z-10 border-b border-[var(--border)]">
                <div className="flex items-center gap-4">
                    <div 
                        className="bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 rounded-full p-2 cursor-pointer transition-all hover:scale-110 active:scale-95"
                        onClick={onBack}
                    >
                        <ArrowLeft size={24} className="text-[var(--text-secondary)]" />
                    </div>
                    <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight">{t.settings}</h1>
                </div>
            </div>

            <div className="p-8 max-w-4xl mx-auto space-y-12 pb-20">
                
                {/* Appearance Section */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Palette className="text-[var(--accent)]" />
                        <h2 className="text-xl font-bold text-[var(--text-main)]">{t.appearance}</h2>
                    </div>
                    
                    <div className="bg-[var(--bg-tertiary)] p-6 rounded-xl border border-[var(--border)] space-y-8">
                        {/* Theme Selection */}
                        <div>
                            <h3 className="text-[var(--text-main)] font-medium mb-4">{t.theme}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {themes.map(theme => (
                                    <button
                                        key={theme.id}
                                        onClick={() => onThemeChange(theme.id)}
                                        className={`
                                            flex items-center gap-3 p-4 rounded-lg border transition-all
                                            ${currentTheme === theme.id 
                                                ? 'bg-[var(--accent)]/10 border-[var(--accent)]' 
                                                : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:border-[var(--text-secondary)]'}
                                        `}
                                    >
                                        <div 
                                            className="w-6 h-6 rounded-full border border-[var(--border)]"
                                            style={{ backgroundColor: theme.color }}
                                        />
                                        <span className={`text-sm font-medium ${currentTheme === theme.id ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                                            {theme.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Language Selection */}
                        <div>
                            <h3 className="text-[var(--text-main)] font-medium mb-4">{t.language}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.id}
                                        onClick={() => setLanguage(lang.id)}
                                        className={`
                                            flex items-center gap-3 p-4 rounded-lg border transition-all
                                            ${language === lang.id 
                                                ? 'bg-[var(--accent)]/10 border-[var(--accent)]' 
                                                : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:border-[var(--text-secondary)]'}
                                        `}
                                    >
                                        <span className="text-xl">{lang.flag}</span>
                                        <span className={`text-sm font-medium ${language === lang.id ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                                            {lang.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Library & Storage Section */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Database className="text-[var(--accent)]" />
                        <h2 className="text-xl font-bold text-[var(--text-main)]">{t.system}</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-[var(--bg-tertiary)] p-6 rounded-xl border border-[var(--border)] flex items-center justify-between">
                            <div>
                                <h3 className="text-[var(--text-main)] font-medium mb-1">{t.downloadsFolder}</h3>
                                <p className="text-[var(--text-secondary)] text-sm">{t.openDownloadsFolderDesc}</p>
                            </div>
                            <button 
                                onClick={handleOpenDownloads}
                                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border)] hover:bg-[var(--bg-main)] transition"
                            >
                                <FolderOpen size={18} />
                                {t.openFolder}
                            </button>
                        </div>

                        <div className="bg-[var(--bg-tertiary)] p-6 rounded-xl border border-[var(--border)] flex items-center justify-between">
                            <div>
                                <h3 className="text-[var(--text-main)] font-medium mb-1">{t.clearCache}</h3>
                                <p className="text-[var(--text-secondary)] text-sm">{t.clearCacheDesc}</p>
                            </div>
                            <button 
                                onClick={handleClearCache}
                                disabled={isClearing}
                                className={`
                                    flex items-center gap-2 px-6 py-3 rounded-full font-bold transition
                                    ${isClearing 
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                                        : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'}
                                `}
                            >
                                <Trash2 size={18} />
                                {isClearing ? '...' : t.clearCache}
                            </button>
                        </div>
                    </div>
                    {message && (
                        <p className={`mt-4 text-sm font-medium ${message.toLowerCase().includes('success') || message.toLowerCase().includes('saved') ? 'text-green-500' : 'text-red-500'}`}>
                            {message}
                        </p>
                    )}
                </div>

                {/* System Section */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Monitor className="text-[var(--accent)]" />
                        <h2 className="text-xl font-bold text-[var(--text-main)]">{t.systemInfo}</h2>
                    </div>

                    <div className="bg-[var(--bg-tertiary)] p-6 rounded-xl border border-[var(--border)] space-y-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[var(--text-main)] font-medium">{t.userDataPath}</span>
                            <div className="flex items-center gap-2">
                                <code className="bg-[var(--bg-secondary)] p-2 rounded-lg text-xs text-[var(--text-secondary)] break-all flex-1 border border-[var(--border)] font-mono">
                                    {userDataPath || 'Loading...'}
                                </code>
                                <button 
                                    onClick={handleOpenUserData}
                                    className="p-2 hover:bg-[var(--bg-secondary)] rounded-md text-[var(--text-secondary)] transition"
                                    title={t.openFolder}
                                >
                                    <FolderOpen size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Keyboard Shortcuts Section */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Keyboard className="text-[var(--accent)]" />
                        <h2 className="text-xl font-bold text-[var(--text-main)]">{t.keyboardShortcuts}</h2>
                    </div>
                    
                    <div className="bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)] overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border)]">
                             {[
                                { label: t.playPause, keys: ['Space'] },
                                { label: t.nextSong, keys: ['Ctrl', 'Right'] },
                                { label: t.previousSong, keys: ['Ctrl', 'Left'] },
                                { label: t.volumeUp, keys: ['Ctrl', 'Up'] },
                                { label: t.volumeDown, keys: ['Ctrl', 'Down'] },
                                { label: t.mute, keys: ['Ctrl', 'M'] },
                                { label: t.search, keys: ['Ctrl', 'F'] },
                                { label: t.closeApp, keys: ['Alt', 'F4'] }
                             ].map((shortcut, i) => (
                                <div key={i} className="bg-[var(--bg-tertiary)] p-4 flex justify-between items-center hover:bg-[var(--bg-secondary)] transition-colors">
                                    <span className="text-[var(--text-main)] font-medium">{shortcut.label}</span>
                                    <div className="flex gap-1">
                                        {shortcut.keys.map((key, k) => (
                                            <kbd key={k} className="bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] font-bold shadow-sm min-w-[1.5rem] text-center">
                                                {key}
                                            </kbd>
                                        ))}
                                    </div>
                                </div>
                             ))}
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Info className="text-[var(--accent)]" />
                        <h2 className="text-xl font-bold text-[var(--text-main)]">{t.aboutSongify}</h2>
                    </div>

                    <div className="bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)] overflow-hidden">
                        <div className="p-8 text-center border-b border-[var(--border)] bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
                            <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-[var(--accent)]/20 text-[var(--bg-main)]" style={{ backgroundColor: '#0D0F13' }}>
                                <img src={songifyLogo} alt="Songify Logo" className="w-12 h-12 object-contain" />
                            </div>
                            <h3 className="text-2xl font-black text-[var(--text-main)] mb-1">Songify</h3>
                            <p className="text-[var(--text-secondary)] font-medium">v{appVersion}</p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                                 <div className="flex justify-between items-center p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group" onClick={() => platform.openExternal('https://github.com/jozefbosi9821/Songify')}>
                                    <div className="flex items-center gap-3">
                                    <Github className="text-[var(--text-secondary)] group-hover:text-[var(--text-main)] transition-colors" />
                                    <span className="text-[var(--text-main)] font-medium">{t.githubRepo}</span>
                                </div>
                                <ExternalLink size={16} className="text-[var(--text-secondary)]" />
                             </div>
                             
                             <div className="flex justify-between items-center p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <Info className="text-[var(--text-secondary)] group-hover:text-[var(--text-main)] transition-colors" />
                                    <span className="text-[var(--text-main)] font-medium">{t.license}</span>
                                </div>
                                <span className="text-[var(--text-secondary)] text-sm">MIT</span>
                             </div>
                             
                             <div className="pt-4 mt-4 border-t border-[var(--border)] text-center">
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {t.madeBy}
                                </p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
