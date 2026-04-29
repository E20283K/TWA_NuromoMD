import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Package, Users, BarChart3, ShoppingBag } from 'lucide-react';
import { UserRole } from '../../types';
import { clsx } from 'clsx';

interface BottomNavProps {
  role: UserRole;
}

export const BottomNav: React.FC<BottomNavProps> = ({ role }) => {
  const agentLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/catalog', icon: ShoppingBag, label: 'Catalog' },
    { to: '/history', icon: ClipboardList, label: 'Orders' },
  ];

  const manufacturerLinks = [
    { to: '/', icon: BarChart3, label: 'Stats' },
    { to: '/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/agents', icon: Users, label: 'Agents' },
  ];

  const links = role === 'agent' ? agentLinks : manufacturerLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-tg-bg border-t border-tg-hint/10 pb-safe-area flex items-center justify-around h-16 z-40">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center gap-1 w-full h-full transition-colors',
              isActive ? 'text-tg-button' : 'text-tg-hint'
            )
          }
        >
          <link.icon size={20} />
          <span className="text-[10px] font-medium">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
