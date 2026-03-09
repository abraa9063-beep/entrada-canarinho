import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Package,
  Building2
} from 'lucide-react';
import clsx from 'clsx';
import logoCanarinho from '../assets/logo-canarinho.png';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/notas', icon: FileText, label: 'Notas Fiscais' },
  { path: '/fornecedores', icon: Building2, label: 'Fornecedores' },
  { path: '/itens', icon: Package, label: 'Catálogo' },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <img src={logoCanarinho} alt="Transportes Canarinho" className="sidebar-logo" />
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx('sidebar-item', isActive && 'active')
            }
          >
            <item.icon />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        Sistema CNR v2.0
      </div>
    </aside>
  );
}
