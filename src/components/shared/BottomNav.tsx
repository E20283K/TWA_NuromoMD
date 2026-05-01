import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Package, Users, BarChart3, ShoppingBag } from 'lucide-react';
import type { UserRole } from '../../types';
import { clsx } from 'clsx';

interface BottomNavProps {
  role: UserRole;
}

export const BottomNav: React.FC<BottomNavProps> = ({ role }) => {
  const agentLinks = [
    { to: '/', icon: Home, label: 'Asosiy' },
    { to: '/catalog', icon: ShoppingBag, label: 'Katalog' },
    { to: '/history', icon: ClipboardList, label: 'Buyurtmalar' },
    { to: '/clients', icon: Users, label: 'Mijozlar' },
  ];

  const manufacturerLinks = [
    { to: '/', icon: BarChart3, label: 'Statistika' },
    { to: '/orders', icon: ClipboardList, label: 'Buyurtmalar' },
    { to: '/products', icon: Package, label: 'Mahsulotlar' },
    { to: '/agents', icon: Users, label: 'Agentlar' },
  ];

  const links = role === 'agent' ? agentLinks : manufacturerLinks;

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-40 pointer-events-none flex justify-center">
      <nav className="w-full max-w-sm pointer-events-auto bg-tg-bg/85 backdrop-blur-xl border border-tg-hint/10 rounded-2xl flex items-center justify-around h-16 shadow-[0_8px_32px_rgba(0,0,0,0.15)] overflow-hidden">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 relative',
                isActive ? 'text-tg-button scale-110' : 'text-tg-hint hover:text-tg-text'
              )
            }
          >
            {({ isActive }) => (
              <>
                <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={clsx(
                  'text-[9px] font-bold uppercase tracking-tight transition-opacity',
                  isActive ? 'opacity-100' : 'opacity-60'
                )}>
                  {link.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-tg-button rounded-full animate-in fade-in zoom-in duration-300" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
