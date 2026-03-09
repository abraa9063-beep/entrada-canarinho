import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Package } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  user: {
    nome: string;
    email: string;
    filial: string;
  };
  onLogout: () => void;
}

export function Layout({ user, onLogout }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Sidebar />
      
      <div className="main-content">
        <Header user={user} onLogout={onLogout} />
        <Outlet />
      </div>

      {/* Mobile Nav */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30"
        style={{ 
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <MobileNav />
      </div>
    </div>
  );
}

function MobileNav() {
  const items = [
    { path: '/', icon: LayoutDashboard, label: 'Início' },
    { path: '/notas', icon: FileText, label: 'N-F' },
    { path: '/itens', icon: Package, label: 'Itens' },
  ];

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '56px' }}>
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive ? 'text-primary font-medium' : 'text-muted'
            }`
          }
        >
          <item.icon className="w-5 h-5" />
          <span className="text-xs">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
