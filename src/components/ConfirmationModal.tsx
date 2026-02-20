import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText,
  cancelText
}: ConfirmationModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 opacity-100 overflow-hidden">
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[var(--text-main)]">{title}</h3>
            <button 
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-[var(--text-main)] p-1 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            {message}
          </p>
          
          <div className="flex items-center justify-end gap-3 mt-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              {cancelText || t.cancel}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95"
            >
              {confirmText || t.delete}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
