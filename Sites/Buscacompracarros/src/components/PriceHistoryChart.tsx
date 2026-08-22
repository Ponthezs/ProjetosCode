'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface PriceHistoryChartProps {
  modelName: string;
}

export default function PriceHistoryChart({ modelName }: PriceHistoryChartProps) {
  // Generated mock price history data for the model
  const data = [
    { date: 'Set/25', avgPrice: 132000, minPrice: 125000 },
    { date: 'Nov/25', avgPrice: 129500, minPrice: 122000 },
    { date: 'Jan/26', avgPrice: 127000, minPrice: 119000 },
    { date: 'Mar/26', avgPrice: 126000, minPrice: 117500 },
    { date: 'Mai/26', avgPrice: 125200, minPrice: 116000 },
    { date: 'Jul/26', avgPrice: 124500, minPrice: 112900 },
    { date: 'Ago/26', avgPrice: 124000, minPrice: 112500 },
  ];

  const formatBRL = (val: number) => `R$ ${(val / 1000).toFixed(0)}k`;

  return (
    <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-white">Histórico de Preços de Mercado</h3>
          <p className="text-xs text-slate-400">Evolução do preço médio dos anúncios de {modelName}</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-brand-500 inline-block" />
            <span className="text-slate-300">Preço Média</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            <span className="text-slate-300">Oportunidades Mínimas</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0c8de9" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0c8de9" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={formatBRL} tickLine={false} domain={['dataMin - 5000', 'dataMax + 5000']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
            />
            <Area type="monotone" dataKey="avgPrice" name="Preço Médio" stroke="#0c8de9" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
            <Area type="monotone" dataKey="minPrice" name="Menor Oportunidade" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMin)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
