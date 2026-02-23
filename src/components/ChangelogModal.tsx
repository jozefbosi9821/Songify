import { X, Check, ChevronDown, ChevronRight, Calendar, Tag, PlusCircle, Wrench, RefreshCw, Trash2, Shield, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  changelog: string;
}

interface ChangelogSection {
  type: string;
  items: string[];
}

interface ChangelogVersion {
  version: string;
  date: string;
  sections: ChangelogSection[];
}

export function ChangelogModal({ isOpen, onClose, changelog }: ChangelogModalProps) {
  const [showOlder, setShowOlder] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<string[]>([]);

  const versions = useMemo(() => {
    const parsedVersions: ChangelogVersion[] = [];
    
    // Split by version headers
    // The regex matches `## [version] - date`
    // We split by `## [` to isolate blocks
    const parts = changelog.split(/^## \[/m);
    
    parts.forEach(part => {
      if (!part.trim()) return;
      
      // Check for version line format: "1.2.3] - 2024-01-01"
      const firstLineEnd = part.indexOf('\n');
      const headerLine = part.substring(0, firstLineEnd !== -1 ? firstLineEnd : part.length).trim();
      
      const match = headerLine.match(/^(.*?)\](?: - (.*))?$/);
      if (!match) return;
      
      const version = match[1];
      const date = match[2] || 'Unknown Date';
      const content = part.substring(firstLineEnd !== -1 ? firstLineEnd : part.length).trim();
      
      const sections: ChangelogSection[] = [];
      
      // Split content by section headers `### `
      const sectionParts = content.split(/^### /m);
      
      sectionParts.forEach(sectionPart => {
        if (!sectionPart.trim()) return;
        
        const sectionLineEnd = sectionPart.indexOf('\n');
        const type = sectionPart.substring(0, sectionLineEnd !== -1 ? sectionLineEnd : sectionPart.length).trim();
        const itemsContent = sectionPart.substring(sectionLineEnd !== -1 ? sectionLineEnd : sectionPart.length).trim();
        
        // Extract list items (lines starting with -)
        // We keep the markdown formatting inside the item for ReactMarkdown to handle bolding etc.
        const items: string[] = [];
        const lines = itemsContent.split('\n');
        let currentItem = '';
        
        lines.forEach(line => {
             const trimmed = line.trim();
             if (trimmed.startsWith('- ')) {
                 if (currentItem) items.push(currentItem);
                 currentItem = trimmed.substring(2);
             } else if (trimmed && currentItem) {
                 // Continuation of previous item
                 currentItem += '\n' + trimmed;
             }
        });
        if (currentItem) items.push(currentItem);
        
        if (items.length > 0) {
          sections.push({ type, items });
        }
      });
      
      if (sections.length > 0) {
        parsedVersions.push({ version, date, sections });
      }
    });
    
    return parsedVersions;
  }, [changelog]);

  const latestVersion = versions[0];
  const olderVersions = versions.slice(1);

  const toggleVersion = (version: string) => {
    setExpandedVersions(prev => 
      prev.includes(version) 
        ? prev.filter(v => v !== version)
        : [...prev, version]
    );
  };

  const getSectionIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('added')) return <PlusCircle size={16} className="text-green-400" />;
    if (lower.includes('fixed')) return <Wrench size={16} className="text-blue-400" />;
    if (lower.includes('changed') || lower.includes('updated')) return <RefreshCw size={16} className="text-orange-400" />;
    if (lower.includes('removed')) return <Trash2 size={16} className="text-red-400" />;
    if (lower.includes('security')) return <Shield size={16} className="text-purple-400" />;
    return <Tag size={16} className="text-gray-400" />;
  };

  const getSectionColor = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('added')) return 'bg-green-500/10 border-green-500/20 text-green-400';
    if (lower.includes('fixed')) return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    if (lower.includes('changed')) return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
    if (lower.includes('removed')) return 'bg-red-500/10 border-red-500/20 text-red-400';
    return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-[#0f0f13] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all scale-100 opacity-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              What's New in Songify
            </h2>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
              <Tag size={12} />
              Version {latestVersion?.version || 'Unknown'}
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <Calendar size={12} />
              {latestVersion?.date || 'Just now'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          
          {/* Latest Version */}
          {latestVersion ? (
            <div className="space-y-6">
              {latestVersion.sections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit text-xs font-bold uppercase tracking-wider ${getSectionColor(section.type)}`}>
                    {getSectionIcon(section.type)}
                    {section.type}
                  </div>
                  <ul className="space-y-3 pl-1">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed group">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-purple-400 transition-colors flex-shrink-0" />
                        <span>
                          <ReactMarkdown 
                            components={{
                              strong: ({node, ...props}: any) => <strong className="font-semibold text-white" {...props} />,
                              code: ({node, ...props}: any) => <code className="bg-white/10 px-1 py-0.5 rounded text-xs font-mono text-purple-300" {...props} />
                            }}
                          >
                            {item}
                          </ReactMarkdown>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center text-gray-500 py-10">
                No changelog data available.
             </div>
          )}

          {/* Older Versions */}
          {olderVersions.length > 0 && (
            <div className="pt-6 border-t border-white/5">
              <button 
                onClick={() => setShowOlder(!showOlder)}
                className="flex items-center justify-between w-full py-3 px-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors group"
              >
                <span className="text-sm font-semibold text-gray-300 group-hover:text-white flex items-center gap-2">
                  <Clock size={16} className="text-gray-500 group-hover:text-purple-400 transition-colors" />
                  Previous Versions
                </span>
                {showOlder ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
              </button>
              
              {showOlder && (
                <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  {olderVersions.map((ver, idx) => (
                    <div key={idx} className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.01]">
                      <button 
                        onClick={() => toggleVersion(ver.version)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-200">v{ver.version}</span>
                          <span className="text-xs text-gray-500">{ver.date}</span>
                        </div>
                        {expandedVersions.includes(ver.version) ? 
                          <ChevronDown size={16} className="text-gray-500" /> : 
                          <ChevronRight size={16} className="text-gray-500" />
                        }
                      </button>
                      
                      {expandedVersions.includes(ver.version) && (
                        <div className="px-4 pb-4 pt-0 border-t border-white/5">
                           {ver.sections.map((section, sIdx) => (
                             <div key={sIdx} className="mt-4">
                               <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${
                                 section.type.toLowerCase().includes('added') ? 'text-green-400' :
                                 section.type.toLowerCase().includes('fixed') ? 'text-blue-400' :
                                 section.type.toLowerCase().includes('changed') ? 'text-orange-400' :
                                 'text-gray-400'
                               }`}>
                                 {section.type}
                               </h4>
                               <ul className="space-y-2 pl-2 border-l border-white/5 ml-1">
                                 {section.items.map((item, i) => (
                                   <li key={i} className="text-xs text-gray-400 pl-3 leading-relaxed">
                                     <ReactMarkdown 
                                       components={{
                                         strong: ({node, ...props}: any) => <strong className="font-semibold text-gray-300" {...props} />,
                                         code: ({node, ...props}: any) => <code className="bg-white/10 px-1 py-0.5 rounded text-[10px] font-mono text-purple-300" {...props} />
                                       }}
                                     >
                                       {item}
                                     </ReactMarkdown>
                                   </li>
                                 ))}
                               </ul>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex justify-end bg-white/[0.02]">
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
