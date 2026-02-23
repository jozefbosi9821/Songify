import { RefreshCw, X, Download, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  version: string;
  releaseNotes?: string;
}

export function UpdateModal({ isOpen, onClose, onInstall, version, releaseNotes }: UpdateModalProps) {
  if (!isOpen) return null;

  const [expanded, setExpanded] = useState(false);

  // Clean up release notes if they contain HTML or excessive newlines
  const cleanNotes = releaseNotes 
    ? releaseNotes.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '') // Basic HTML strip if any
    : 'New features and improvements are available.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900/90 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <div className="p-6 pb-0 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <Download className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Update Ready</h2>
                <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
                  <ShieldCheck size={14} />
                  <span>Version {version}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 relative z-10 space-y-4">
          <p className="text-gray-300 leading-relaxed">
            A new version of Songify has been downloaded and is ready to install. Update now to get the latest features and fixes.
          </p>

          {/* Release Notes Preview */}
          {releaseNotes && (
            <div className="bg-black/30 rounded-xl border border-white/5 overflow-hidden">
              <button 
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-yellow-400" />
                  <span>What's New</span>
                </div>
                <ArrowRight size={16} className={`transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} />
              </button>
              
              <div className={`transition-all duration-300 ease-in-out ${expanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 pt-0 text-sm text-gray-400 prose prose-invert prose-sm max-w-none overflow-y-auto custom-scrollbar max-h-60">
                  <ReactMarkdown>{cleanNotes}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-colors border border-transparent hover:border-white/10"
            >
              Later
            </button>
            <button
              onClick={onInstall}
              className="flex-[2] py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Restart & Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
