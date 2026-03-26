import { Minus, Square, X, Search as SearchIcon, User, Settings } from 'lucide-react';
import { platform } from '../services/platform';

interface TitleBarProps {
  searchQuery: string;
  onChangeSearch: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchFocus?: () => void;
  username: string | null;
  onOpenSettings: () => void;
  onOpenUserMenu: () => void;
}

export function TitleBar({
  searchQuery,
  onChangeSearch,
  onSearchSubmit,
  onSearchFocus,
  username,
  onOpenSettings,
  onOpenUserMenu,
}: TitleBarProps) {
  return (
    <div
      className="h-12 w-full flex items-center justify-between select-none z-50 bg-[var(--bg-main)]/95 border-b border-[var(--border)]/60"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* Left spacer (keeps search centered visually) */}
      <div className="w-40" />

      {/* Middle: global search input */}
      <div className="flex-1 flex justify-center px-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <form
          className="w-full max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
        >
          <div className="relative group">
            <SearchIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent)] transition-colors"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onChangeSearch(e.target.value)}
              onFocus={() => onSearchFocus?.()}
              placeholder="What do you want to play?"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full py-2.5 pl-11 pr-4 text-sm text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
            />
          </div>
        </form>
      </div>

      {/* Right: settings + profile + window controls styled like Spotify */}
      <div
        className="flex items-center h-full text-[var(--text-secondary)] gap-2 pr-1"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full hover:bg-white/5 hover:text-[var(--text-main)] transition-colors"
        >
          <Settings size={16} />
        </button>

        <button
          onClick={onOpenUserMenu}
          className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-white/5 hover:text-[var(--text-main)] text-xs font-medium transition-colors"
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${username ? 'bg-[var(--accent)] text-white shadow-md' : 'bg-[var(--bg-tertiary)]'}`}>
            <User size={14} />
          </div>
          <span className="max-w-[90px] truncate">
            {username || 'Sign In'}
          </span>
        </button>

        <button
          onClick={() => platform.minimize()}
          className="h-full w-10 flex items-center justify-center hover:bg-white/5 hover:text-[var(--text-main)] transition-colors"
          tabIndex={-1}
        >
          <Minus size={16} />
        </button>
        <button
          onClick={() => platform.maximize()}
          className="h-full w-10 flex items-center justify-center hover:bg-white/5 hover:text-[var(--text-main)] transition-colors"
          tabIndex={-1}
        >
          <Square size={14} />
        </button>
        <button
          onClick={() => platform.close()}
          className="h-full w-10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
          tabIndex={-1}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
