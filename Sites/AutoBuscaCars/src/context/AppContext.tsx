'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AlertItem } from '../lib/types';

interface AppContextType {
  favorites: string[]; // Car IDs
  toggleFavorite: (carId: string) => void;
  isFavorite: (carId: string) => boolean;

  compareList: string[]; // Car IDs
  toggleCompare: (carId: string) => void;
  isComparing: (carId: string) => boolean;
  clearCompare: () => void;

  alerts: AlertItem[];
  addAlert: (alert: Omit<AlertItem, 'id' | 'createdAt' | 'active' | 'matchedCount'>) => void;
  removeAlert: (id: string) => void;

  isDark: boolean;
  toggleDarkMode: () => void;

  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Load initial state from LocalStorage
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('autobusca_favs');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedCompare = localStorage.getItem('autobusca_compare');
      if (savedCompare) setCompareList(JSON.parse(savedCompare));

      const savedAlerts = localStorage.getItem('autobusca_alerts');
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      } else {
        // Initial default alert example
        setAlerts([
          {
            id: 'alert-01',
            title: 'Corolla XEi 2022 até R$ 115.000',
            query: 'Corolla XEi 2022',
            brand: 'Toyota',
            model: 'Corolla',
            maxPrice: 115000,
            minYear: 2022,
            createdAt: '2026-08-15',
            active: true,
            matchedCount: 2,
          },
        ]);
      }

      const savedDark = localStorage.getItem('autobusca_dark');
      if (savedDark) {
        const darkVal = JSON.parse(savedDark);
        setIsDark(darkVal);
        if (darkVal) document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.error('Error loading stored AppContext state', e);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const toggleFavorite = (carId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(carId);
      const updated = exists ? prev.filter(id => id !== carId) : [...prev, carId];
      localStorage.setItem('autobusca_favs', JSON.stringify(updated));
      showToast(
        exists ? 'Anúncio removido dos favoritos' : 'Anúncio salvo em Meus Favoritos! ❤️',
        exists ? 'info' : 'success'
      );
      return updated;
    });
  };

  const isFavorite = (carId: string) => favorites.includes(carId);

  const toggleCompare = (carId: string) => {
    setCompareList(prev => {
      const exists = prev.includes(carId);
      if (!exists && prev.length >= 4) {
        showToast('Você pode comparar no máximo 4 veículos por vez.', 'error');
        return prev;
      }
      const updated = exists ? prev.filter(id => id !== carId) : [...prev, carId];
      localStorage.setItem('autobusca_compare', JSON.stringify(updated));
      showToast(
        exists ? 'Removido da comparação' : `Adicionado ao Comparador! (${updated.length}/4) ⚖️`,
        exists ? 'info' : 'success'
      );
      return updated;
    });
  };

  const isComparing = (carId: string) => compareList.includes(carId);

  const clearCompare = () => {
    setCompareList([]);
    localStorage.removeItem('autobusca_compare');
    showToast('Lista de comparação limpa.', 'info');
  };

  const addAlert = (newAlert: Omit<AlertItem, 'id' | 'createdAt' | 'active' | 'matchedCount'>) => {
    const alertObj: AlertItem = {
      ...newAlert,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      active: true,
      matchedCount: Math.floor(Math.random() * 3) + 1,
    };
    setAlerts(prev => {
      const updated = [alertObj, ...prev];
      localStorage.setItem('autobusca_alerts', JSON.stringify(updated));
      return updated;
    });
    showToast('Alerta de preço criado com sucesso! 🔔', 'success');
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => {
      const updated = prev.filter(a => a.id !== id);
      localStorage.setItem('autobusca_alerts', JSON.stringify(updated));
      return updated;
    });
    showToast('Alerta removido.', 'info');
  };

  const toggleDarkMode = () => {
    setIsDark(prev => {
      const nextVal = !prev;
      localStorage.setItem('autobusca_dark', JSON.stringify(nextVal));
      if (nextVal) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return nextVal;
    });
  };

  return (
    <AppContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        compareList,
        toggleCompare,
        isComparing,
        clearCompare,
        alerts,
        addAlert,
        removeAlert,
        isDark,
        toggleDarkMode,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
