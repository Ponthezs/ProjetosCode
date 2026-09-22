import { useState } from 'react';
import { Database, Search } from 'lucide-react';
import { ecuDatabase } from '../data/mock';

export default function EcuDatabase() {
  const [q, setQ] = useState('');
  const filtered = ecuDatabase.filter(e =>
    `${e.marca} ${e.modelo} ${e.motor} ${e.ano} ${e.ecu}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Database className="text-electric-2" /> ECU Database</h1>
        <p className="text-base-400 text-sm mt-1">Pesquise ECUs por marca, modelo, motor e ano.</p>
      </div>

      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar por marca, motor, ECU..."
          className="w-full bg-base-800/70 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-electric-2/60"
        />
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-base-400 border-b border-white/8 bg-white/[0.02]">
              <th className="py-3 px-4 font-medium">Marca</th><th className="font-medium">Modelo</th><th className="font-medium">Motor</th>
              <th className="font-medium">Ano</th><th className="font-medium">ECU</th><th className="font-medium">Hardware</th>
              <th className="font-medium">Software</th><th className="font-medium">Protocolo</th><th className="font-medium">Leitura</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                <td className="py-3 px-4 font-medium">{e.marca}</td><td>{e.modelo}</td><td className="font-mono-tech">{e.motor}</td>
                <td>{e.ano}</td><td className="text-electric-2">{e.ecu}</td><td className="font-mono-tech text-base-400">{e.hardware}</td>
                <td className="font-mono-tech text-base-400">{e.software}</td><td>{e.protocolo}</td><td>{e.leitura}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-base-400">Nenhum resultado encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
