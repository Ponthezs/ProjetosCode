import { useMemo, useState } from 'react';
import { GitCompareArrows, ArrowRight } from 'lucide-react';
import { ecuFiles, calibrationMaps } from '../data/mock';
import { GlassCard } from '../components/GlassCard';
import { useApp } from '../context/AppContext';

function seedBytes(len: number, seed: number) {
  let s = seed;
  const out: number[] = [];
  for (let i = 0; i < len; i++) {
    s = (s * 9301 + 49297) % 233280;
    out.push(Math.floor((s / 233280) * 256));
  }
  return out;
}

export default function FileCompare() {
  const { vehicles } = useApp();
  const originals = ecuFiles.filter(f => f.tipo === 'original');
  const modifieds = ecuFiles.filter(f => f.tipo === 'modificado');

  const [leftId, setLeftId] = useState(originals[0]?.id ?? '');
  const [rightId, setRightId] = useState(modifieds[0]?.id ?? '');

  const left = ecuFiles.find(f => f.id === leftId);
  const right = ecuFiles.find(f => f.id === rightId);

  const { rows, diffCount, addresses } = useMemo(() => {
    const len = 256;
    const a = seedBytes(len, (left?.checksum.length ?? 3) * 17 + 1);
    const b = a.map((v, i) => (i % 23 === 0 || i % 37 === 0 ? (v + 40) % 256 : v));
    const rowsOut: { offset: number; a: number[]; b: number[] }[] = [];
    let diffs = 0;
    const addrs: string[] = [];
    for (let i = 0; i < len; i += 16) {
      const ra = a.slice(i, i + 16);
      const rb = b.slice(i, i + 16);
      ra.forEach((v, j) => { if (v !== rb[j]) { diffs++; addrs.push('0x' + (i + j).toString(16).toUpperCase().padStart(6, '0')); } });
      rowsOut.push({ offset: i, a: ra, b: rb });
    }
    return { rows: rowsOut, diffCount: diffs, addresses: addrs.slice(0, 6) };
  }, [left, right]);

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><GitCompareArrows className="text-electric-2" /> File Compare</h1>
        <p className="text-base-400 text-sm mt-1">Compare arquivos originais e modificados byte a byte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileSelector label="Original" files={originals} value={leftId} onChange={setLeftId} vehicles={vehicles} accent="base" />
        <FileSelector label="Modificado" files={modifieds} value={rightId} onChange={setRightId} vehicles={vehicles} accent="green" />
      </div>

      <div className="flex items-center justify-center gap-4 text-sm">
        <span className="glass px-4 py-2 rounded-xl font-mono-tech text-base-300">{left?.nome ?? '—'}</span>
        <ArrowRight className="text-electric-2" size={18} />
        <span className="glass px-4 py-2 rounded-xl font-mono-tech text-perf-green">{right?.nome ?? '—'}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard><div className="text-xs text-base-400 mb-1">Diferenças encontradas</div><div className="font-display text-2xl font-bold text-alert-red">{diffCount}</div></GlassCard>
        <GlassCard><div className="text-xs text-base-400 mb-1">Regiões alteradas</div><div className="font-display text-2xl font-bold text-amber">{rows.filter(r => r.a.some((v, i) => v !== r.b[i])).length}</div></GlassCard>
        <GlassCard>
          <div className="text-xs text-base-400 mb-1">Endereços modificados (amostra)</div>
          <div className="font-mono-tech text-xs text-electric-2 flex flex-wrap gap-1.5">{addresses.map(a => <span key={a}>{a}</span>)}</div>
        </GlassCard>
      </div>

      <GlassCard title="Visualização hexadecimal">
        <div className="overflow-auto font-mono-tech text-[11px]">
          <div className="grid grid-cols-[90px_1fr_1fr] gap-2 text-base-400 pb-2 border-b border-white/8 mb-2 sticky top-0 bg-base-900/80">
            <span>OFFSET</span><span>ORIGINAL</span><span>MODIFICADO</span>
          </div>
          {rows.map(row => {
            const hasDiff = row.a.some((v, i) => v !== row.b[i]);
            return (
              <div key={row.offset} className={`grid grid-cols-[90px_1fr_1fr] gap-2 py-1 rounded-lg ${hasDiff ? 'bg-alert-red/5' : ''}`}>
                <span className="text-base-500">0x{row.offset.toString(16).toUpperCase().padStart(6, '0')}</span>
                <span className="flex gap-1.5 flex-wrap">
                  {row.a.map((v, i) => <span key={i} className={v !== row.b[i] ? 'text-alert-red/70' : 'text-base-300'}>{v.toString(16).toUpperCase().padStart(2, '0')}</span>)}
                </span>
                <span className="flex gap-1.5 flex-wrap">
                  {row.b.map((v, i) => <span key={i} className={v !== row.a[i] ? 'text-perf-green font-bold bg-perf-green/10 px-0.5 rounded' : 'text-base-300'}>{v.toString(16).toUpperCase().padStart(2, '0')}</span>)}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard title="Comparação de mapas relacionados">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calibrationMaps.slice(0, 4).map(m => {
            const origAvg = avg(m.original);
            const modAvg = avg(m.modified);
            const diff = modAvg - origAvg;
            const pct = (diff / origAvg) * 100;
            return (
              <div key={m.id} className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{m.nome}</div>
                  <div className="text-xs text-base-400">Original: {origAvg.toFixed(1)} {m.zUnit} → Modificado: {modAvg.toFixed(1)} {m.zUnit}</div>
                </div>
                <div className={`text-sm font-mono-tech ${diff >= 0 ? 'text-perf-green' : 'text-alert-red'}`}>
                  {diff >= 0 ? '+' : ''}{diff.toFixed(1)} ({pct >= 0 ? '+' : ''}{pct.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

function avg(grid: number[][]) {
  const flat = grid.flat();
  return flat.reduce((a, b) => a + b, 0) / flat.length;
}

function FileSelector({ label, files, value, onChange, vehicles, accent }: any) {
  return (
    <GlassCard>
      <div className={`text-xs mb-2 uppercase tracking-wider ${accent === 'green' ? 'text-perf-green' : 'text-base-300'}`}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-base-800/70 border border-white/10 rounded-xl px-3 py-2.5 text-sm">
        {files.map((f: any) => {
          const v = vehicles.find((v: any) => v.id === f.vehicleId);
          return <option key={f.id} value={f.id}>{f.nome} — {v ? `${v.marca} ${v.modelo}` : ''}</option>;
        })}
      </select>
    </GlassCard>
  );
}
