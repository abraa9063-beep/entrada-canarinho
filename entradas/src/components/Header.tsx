import { useState } from 'react';
import { LogOut, ChevronDown, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  
  // Safe access to user.name with fallback
  const displayName = user?.name || user?.email?.split('@')[0] || 'Usuário';
  const iniciais = displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="header">
      <div className="flex items-center">
        <h1 className="header-title">Sistema CNR</h1>
        <span className="header-subtitle">Controle de Entradas</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
          style={{ color: 'var(--text-muted)' }}
          title={isDark ? 'Modo Claro' : 'Modo Escuro'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ background: 'var(--primary)' }}
            >
              {iniciais}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{displayName}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email || ''}</p>
            </div>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-muted)' }}
            />
          </button>

          {/* Dropdown */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div 
                className="absolute right-0 top-full mt-1 w-56 rounded-lg shadow-lg py-1 z-20"
                style={{ 
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)'
                }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{displayName}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email || ''}</p>
                </div>
                
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
