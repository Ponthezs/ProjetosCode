'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { Search, Car, Heart, Scale, Bell, Moon, Sun, Flame, HelpCircle } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { favorites, compareList, isDark, toggleDarkMode } = useApp();
  const [quickSearch, setQuickSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/busca?search=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Auto<span className="text-brand-400">Busca</span>
            </span>
            <span className="text-[10px] text-slate-400 -mt-1 font-medium tracking-wide">
              INTELIGÊNCIA AUTOMOTIVA
            </span>
          </div>
        </Link>

        {/* Quick Header Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              value={quickSearch}
              onChange={e => setQuickSearch(e.target.value)}
              placeholder="Digite marca, modelo, versão..."
              className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>
        </form>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 font-medium text-sm text-slate-300">
          <Link
            href="/busca"
            className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Buscar</span>
          </Link>
          <Link
            href="/oportunidades"
            className="px-3 py-2 rounded-lg hover:text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-1.5 text-amber-400 font-semibold"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Oportunidades</span>
          </Link>
          <Link
            href="/comparar"
            className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5 relative"
          >
            <Scale className="w-4 h-4 text-slate-400" />
            <span>Comparar</span>
            {compareList.length > 0 && (
              <span className="bg-brand-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {compareList.length}
              </span>
            )}
          </Link>
          <Link
            href="/favoritos"
            className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5 relative"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Favoritos</span>
            {favorites.length > 0 && (
              <span className="bg-rose-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {favorites.length}
              </span>
            )}
          </Link>
          <Link
            href="/alertas"
            className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <Bell className="w-4 h-4 text-slate-400" />
            <span>Alertas</span>
          </Link>
          <Link
            href="/como-funciona"
            className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Como Funciona</span>
          </Link>
        </nav>

        {/* Action icons & Theme Toggle */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-brand-600/20 text-brand-400 border border-brand-500/30 hover:bg-brand-600/30 transition-all"
          >
            Meu Painel
          </Link>

          <button
            onClick={toggleDarkMode}
            aria-label="Alternar tema"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
