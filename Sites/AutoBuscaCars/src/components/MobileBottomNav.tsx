'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { Search, Flame, Scale, Heart, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { favorites, compareList } = useApp();

  const navItems = [
    { label: 'Buscar', href: '/busca', icon: Search },
    { label: 'Oportunidades', href: '/oportunidades', icon: Flame, highlight: true },
    { label: 'Comparar', href: '/comparar', icon: Scale, badge: compareList.length },
    { label: 'Favoritos', href: '/favoritos', icon: Heart, badge: favorites.length },
    { label: 'Painel', href: '/dashboard', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg lg:hidden py-2 px-2 transition-colors duration-200">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href === '/busca' && pathname === '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? item.highlight
                    ? 'text-amber-400 font-bold'
                    : 'text-brand-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-slate-900">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-none tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
