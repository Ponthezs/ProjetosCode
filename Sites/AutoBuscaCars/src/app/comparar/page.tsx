'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockCarAds } from '../../lib/data/mockCars';
import ComparisonTable from '../../components/ComparisonTable';
import { Scale, Trash2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const { compareList, clearCompare, toggleCompare } = useApp();
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const selectedCars = mockCarAds.filter(c => compareList.includes(c.id));
  const availableToAdd = mockCarAds.filter(c => !compareList.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Comparador de Veículos</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Analise preço, especificações, score e custo-benefício lado a lado ({selectedCars.length}/4 selecionados)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCars.length < 4 && (
            <button
              onClick={() => setIsSelectOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-brand-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Carro</span>
            </button>
          )}

          {selectedCars.length > 0 && (
            <button
              onClick={clearCompare}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Limpar Lista</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Component */}
      <ComparisonTable cars={selectedCars} />

      {/* Add Car Modal */}
      {isSelectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">Adicionar Carro para Comparar</h3>
              <button
                onClick={() => setIsSelectOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-2">
              {availableToAdd.map(car => (
                <div
                  key={car.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold text-brand-400 uppercase">{car.brand}</span>
                    <h4 className="font-bold text-sm text-white">{car.model} {car.version}</h4>
                    <p className="text-xs text-slate-400">{car.year} • R$ {car.price.toLocaleString('pt-BR')}</p>
                  </div>
                  <button
                    onClick={() => {
                      toggleCompare(car.id);
                      setIsSelectOpen(false);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-500"
                  >
                    Adicionar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
