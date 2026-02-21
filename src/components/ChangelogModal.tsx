import { X, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  changelog: string;
}

export function ChangelogModal({ isOpen, onClose, changelog }: ChangelogModalProps) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-[#0f0f13] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all scale-100 opacity-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              What's New in Songify
            </h2>
            <p className="text-sm text-gray-400 mt-1">Latest updates and improvements</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}: any) => <h1 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white/10" {...props} />,
                h2: ({node, ...props}: any) => <h2 className="text-lg font-semibold text-purple-400 mt-6 mb-3" {...props} />,
                h3: ({node, ...props}: any) => <h3 className="text-base font-medium text-pink-400 mt-4 mb-2" {...props} />,
                ul: ({node, ...props}: any) => <ul className="list-disc list-outside ml-4 space-y-2 text-gray-300" {...props} />,
                li: ({node, ...props}: any) => <li className="pl-1" {...props} />,
                p: ({node, ...props}: any) => <p className="text-gray-300 leading-relaxed mb-4" {...props} />,
                strong: ({node, ...props}: any) => <strong className="font-semibold text-white" {...props} />,
              }}
            >
              {changelog}
            </ReactMarkdown>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Check size={18} />
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
