import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/budgets', icon: Wallet, label: 'Budgets' },
    { to: '/export', icon: Download, label: 'Export' },
  ];

  return (
    <nav className="absolute bottom-0 w-full h-16 bg-surface border-t border-border flex justify-around items-center px-2 z-10">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 text-primary-muted transition-colors",
              isActive && "text-accent"
            )
          }
        >
          <link.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
