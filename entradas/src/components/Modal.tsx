import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const { isDark } = useTheme();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{ background: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className={`modal ${sizes[size]}`}
        onClick={(e) => e.stopPropagation()}
        style={{ 
          background: isDark ? '#1e293b' : '#ffffff',
          border: isDark ? '1px solid #374151' : '1px solid #e5e7eb'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: isDark ? '1px solid #374151' : '1px solid #e5e7eb' }}
        >
          <h2 
            className="text-base font-semibold"
            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            style={{ color: isDark ? '#94a3b8' : '#64748b' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
