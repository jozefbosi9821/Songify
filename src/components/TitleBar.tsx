import { Minus, Square, X } from 'lucide-react';
import { platform } from '../services/platform';
import icon from '../assets/Songify.png';

export function TitleBar() {
  return (
    <div className="h-8 bg-black flex items-center justify-between select-none z-50 w-full" style={{ WebkitAppRegion: 'drag' } as any}>
      {/* Left: Icon and Title */}
      <div className="flex items-center gap-2 px-3 h-full">
        <img src={icon} alt="Songify" className="w-4 h-4" />
        <span className="text-xs font-medium text-gray-400">Songify</span>
      </div>

      {/* Middle: Spacer (Drag Area) */}
      <div className="flex-1 h-full" />

      {/* Right: Window Controls */}
      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          onClick={() => platform.minimize()}
          className="h-full w-12 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          tabIndex={-1}
        >
          <Minus size={16} />
        </button>
        <button
          onClick={() => platform.maximize()}
          className="h-full w-12 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          tabIndex={-1}
        >
          <Square size={14} />
        </button>
        <button
          onClick={() => platform.close()}
          className="h-full w-12 flex items-center justify-center hover:bg-red-500 text-gray-400 hover:text-white transition-colors"
          tabIndex={-1}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
