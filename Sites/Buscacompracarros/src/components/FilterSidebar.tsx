'use client';

import React from 'react';
import { FilterState } from '../lib/types';
import { SlidersHorizontal, RotateCcw, DollarSign, Calendar, Gauge, Car, Shield, Fuel, Cog, TrendingDown } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

export default function FilterSidebar({ filters, onChange, onReset }: FilterSidebarProps) {
  const brands = ['Todas', 'Toyota', 'Honda', 'Volkswagen', 'Chevrolet', 'Jeep', 'Hyundai', 'Fiat', 'Nissan', 'BMW', 'BYD'];
  const transmissions = ['Todos', 'Automático', 'CVT', 'Manual', 'Automatizado'];
  const fuels = ['Todos', 'Flex', 'Gasolina', 'Diesel', 'Híbrido', 'Elétrico'];
  const bodyTypes = ['Todas', 'Sedan', 'Hatch', 'SUV', 'Pickup', 'Coupe'];
  const sellerTypes = ['Todos', 'Particular', 'Loja'];

  const updateField = (key: keyof FilterState, value: any) => {
    onChange({
      ...filters,
      [key]: value === 'Todas' || value === 'Todos' || value === '' ? undefined : value,
    });
  };

  return (
    <aside className="w-full bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-brand-400" />
          <h3 className="font-extrabold text-base text-white">Filtros de Pesquisa</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 hover:underline transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpar</span>
        </button>
      </div>

      {/* SPECIAL FILTER: ABAIXO DA TABELA FIPE */}
      <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl space-y-2">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-extrabold text-emerald-300">Apenas Abaixo da FIPE</span>
          </div>
          <input
            type="checkbox"
            checked={!!filters.onlyBelowFipe}
            onChange={e => updateField('onlyBelowFipe', e.target.checked || undefined)}
            className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
          />
        </label>
        <p className="text-[11px] text-slate-400">Exibe somente veículos com preço inferior à Tabela FIPE oficial.</p>
      </div>

      {/* Marca */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Car className="w-4 h-4 text-brand-400" />
          Marca do Veículo
        </label>
        <select
          value={filters.brand || 'Todas'}
          onChange={e => updateField('brand', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {brands.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Preço Máximo */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center justify-between uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Preço Máximo
          </span>
          <span className="text-emerald-400 font-extrabold text-xs">
            {filters.maxPrice ? `Até R$ ${(filters.maxPrice / 1000).toFixed(0)} mil` : 'Sem limite'}
          </span>
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
          {[50000, 80000, 110000, 150000, 200000].map(p => (
            <button
              key={p}
              onClick={() => updateField('maxPrice', filters.maxPrice === p ? undefined : p)}
              className={`py-1.5 px-2 rounded-lg border transition-all text-center ${
                filters.maxPrice === p
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              Até R$ {p / 1000}k
            </button>
          ))}
        </div>
      </div>

      {/* Ano Mínimo */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center justify-between uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-400" />
            Ano Mínimo
          </span>
          <span className="text-blue-400 font-extrabold text-xs">
            {filters.minYear ? `${filters.minYear}+` : 'Qualquer ano'}
          </span>
        </label>
        <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
          {[2020, 2022, 2023, 2024].map(y => (
            <button
              key={y}
              onClick={() => updateField('minYear', filters.minYear === y ? undefined : y)}
              className={`py-1.5 rounded-lg border transition-all text-center ${
                filters.minYear === y
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 font-bold'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              {y}+
            </button>
          ))}
        </div>
      </div>

      {/* Quilometragem Máxima */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center justify-between uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-cyan-400" />
            Quilometragem Máxima
          </span>
          <span className="text-cyan-400 font-extrabold text-xs">
            {filters.maxMileage ? `Até ${(filters.maxMileage / 1000).toFixed(0)}k km` : 'Qualquer km'}
          </span>
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
          {[20000, 40000, 60000, 90000].map(km => (
            <button
              key={km}
              onClick={() => updateField('maxMileage', filters.maxMileage === km ? undefined : km)}
              className={`py-1.5 px-2 rounded-lg border transition-all text-center ${
                filters.maxMileage === km
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              Até {km / 1000} mil km
            </button>
          ))}
        </div>
      </div>

      {/* Câmbio */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Cog className="w-4 h-4 text-slate-400" />
          Câmbio
        </label>
        <select
          value={filters.transmission || 'Todos'}
          onChange={e => updateField('transmission', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {transmissions.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Combustível */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Fuel className="w-4 h-4 text-slate-400" />
          Combustível
        </label>
        <select
          value={filters.fuel || 'Todos'}
          onChange={e => updateField('fuel', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {fuels.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Carroceria */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Car className="w-4 h-4 text-slate-400" />
          Tipo de Carroceria
        </label>
        <select
          value={filters.bodyType || 'Todas'}
          onChange={e => updateField('bodyType', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {bodyTypes.map(bt => (
            <option key={bt} value={bt}>{bt}</option>
          ))}
        </select>
      </div>

      {/* Anunciante */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Shield className="w-4 h-4 text-slate-400" />
          Tipo de Anunciante
        </label>
        <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
          {sellerTypes.map(st => (
            <button
              key={st}
              onClick={() => updateField('sellerType', st)}
              className={`py-2 px-2 rounded-xl border transition-all text-center ${
                (filters.sellerType || 'Todos') === st
                  ? 'bg-brand-600/30 text-brand-300 border-brand-500/60 font-bold'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
