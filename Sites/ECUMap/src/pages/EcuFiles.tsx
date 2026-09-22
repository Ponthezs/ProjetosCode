import { useState } from 'react';
import { Upload, Download, Copy, FileArchive, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ecuFiles } from '../data/mock';
import { SimulationBanner } from '../components/SimulationBanner';

const statusIcon = {
  VALID: <ShieldCheck size={14} className="text-perf-green" />,
  INVALID: <ShieldAlert size={14} className="text-alert-red" />,
  CORRECTED: <ShieldQuestion size={14} className="text-amber" />,
};

export default function EcuFiles() {
  const { vehicles } = useApp();
  const [filterVehicle, setFilterVehicle] = useState('all');

  const files = ecuFiles.filter(f => filterVehicle === 'all' || f.vehicleId === filterVehicle);

  return (
    <div className="animate-fade-up space-y-6">
      <SimulationBanner />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><FileArchive className="text-electric-2" /> ECU Files</h1>
          <p className="text-base-400 text-sm mt-1">Upload, versionamento e histórico de arquivos originais e modificados.</p>
        </div>
        <div className="flex gap-2">
          <select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)} className="bg-base-800/70 border border-white/10 rounded-xl px-3 py-2 text-sm">
            <option value="all">Todos os veículos</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modelo}</option>)}
          </select>
          <button className="flex items-center gap-2 bg-gradient-to-r from-electric to-electric-2 text-base-950 font-semibold text-sm px-4 py-2 rounded-xl shadow-glow-blue">
            <Upload size={15} /> Upload original
          </button>
          <button className="flex items-center gap-2 border border-white/15 text-sm px-4 py-2 rounded-xl hover:bg-white/5">
            <Upload size={15} /> Upload modificado
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-base-400 border-b border-white/8 bg-white/[0.02]">
              <th className="py-3 px-4 font-medium">Arquivo</th>
              <th className="font-medium">Veículo</th>
              <th className="font-medium">Tipo</th>
              <th className="font-medium">Versão</th>
              <th className="font-medium">Tamanho</th>
              <th className="font-medium">Data</th>
              <th className="font-medium">Checksum</th>
              <th className="font-medium">Status</th>
              <th className="font-medium text-right pr-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {files.map(f => {
              const v = vehicles.find(v => v.id === f.vehicleId);
              return (
                <tr key={f.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono-tech">{f.nome}</td>
                  <td className="text-base-300">{v ? `${v.marca} ${v.modelo}` : '—'}</td>
                  <td>
                    <span className={f.tipo === 'original' ? 'text-electric-2' : 'text-base-200'}>{f.tipo}</span>
                  </td>
                  <td className="font-mono-tech">v{f.versao}</td>
                  <td>{f.tamanhoKb} KB</td>
                  <td>{f.data}</td>
                  <td className="font-mono-tech text-base-400">{f.checksum}</td>
                  <td>
                    <span className="flex items-center gap-1.5">{statusIcon[f.status]} {f.status}</span>
                  </td>
                  <td className="text-right pr-4">
                    <div className="flex justify-end gap-2 text-base-400">
                      <button title="Download" className="hover:text-electric-2 transition-colors"><Download size={15} /></button>
                      <button title="Duplicar" className="hover:text-electric-2 transition-colors"><Copy size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
