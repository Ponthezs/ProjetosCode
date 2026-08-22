'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import AlertModal from '../../components/AlertModal';
import { Bell, Plus, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AlertsPage() {
  const { alerts, removeAlert } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatBRL = (val?: number) =>
    val ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val) : 'Sem limite';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Alertas de Preço</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Gerencie seus alertas ativos e seja notificado quando surgir uma nova oportunidade
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Alerta</span>
        </button>
      </div>

      {/* Alerts Grid */}
      {alerts.length === 0 ? (
        <div className="bg-slate-900/80 p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-amber-400">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Nenhum alerta de preço configurado</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Crie alertas personalizados para receber avisos quando encontrarmos carros no valor e ano exatos que você procura.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm"
          >
            Criar Primeiro Alerta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ativo ({alert.matchedCount} veículos encontrados)
                  </span>

                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Excluir alerta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-extrabold text-base text-white">{alert.title}</h3>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Preço Máximo</span>
                    <span className="font-bold text-emerald-400">{formatBRL(alert.maxPrice)}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Ano Mínimo</span>
                    <span className="font-bold text-slate-200">{alert.minYear ? `${alert.minYear}+` : 'Qualquer'}</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-2">
                <span>Criado em {alert.createdAt}</span>
                <span className="font-medium text-slate-300">{alert.location}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert Modal Dialog */}
      <AlertModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
