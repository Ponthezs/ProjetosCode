'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, X, Check } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialBrand?: string;
  initialModel?: string;
}

export default function AlertModal({
  isOpen,
  onClose,
  initialQuery = '',
  initialBrand = '',
  initialModel = '',
}: AlertModalProps) {
  const { addAlert } = useApp();

  const [title, setTitle] = useState(initialQuery || `${initialBrand} ${initialModel}`.trim() || 'Alerta de Preço');
  const [maxPrice, setMaxPrice] = useState<number | ''>(115000);
  const [minYear, setMinYear] = useState<number | ''>(2022);
  const [maxMileage, setMaxMileage] = useState<number | ''>(50000);
  const [location, setLocation] = useState('São Paulo / SP');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAlert({
      title: title || 'Alerta Personalizado',
      query: title,
      brand: initialBrand,
      model: initialModel,
      maxPrice: typeof maxPrice === 'number' ? maxPrice : undefined,
      minYear: typeof minYear === 'number' ? minYear : undefined,
      maxMileage: typeof maxMileage === 'number' ? maxMileage : undefined,
      location,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Criar Alerta de Preço</h3>
              <p className="text-xs text-slate-400">Receba notificações de novas oportunidades</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm text-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Título / Modelo do Alerta
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Corolla XEi 2022 por menos de R$ 115.000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Preço Máximo (R$)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="115000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Ano Mínimo
              </label>
              <input
                type="number"
                value={minYear}
                onChange={e => setMinYear(e.target.value ? Number(e.target.value) : '')}
                placeholder="2022"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                KM Máxima
              </label>
              <input
                type="number"
                value={maxMileage}
                onChange={e => setMaxMileage(e.target.value ? Number(e.target.value) : '')}
                placeholder="50000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Região
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="São Paulo / SP"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Alerta de Preço</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
