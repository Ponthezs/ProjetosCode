import { lazy, Suspense, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ChevronRight, Grid3x3, Boxes, Table2, Binary, Search } from 'lucide-react';
import clsx from 'clsx';
import { calibrationMaps, mapTree, detectedMaps } from '../data/mock';
import { GlassCard } from '../components/GlassCard';
import { SimulationBanner } from '../components/SimulationBanner';

const Plot = lazy(() => import('react-plotly.js'));

type ViewMode = '2d' | '3d' | 'table' | 'hex';

export default function MapEditor() {
  const [selectedMapId, setSelectedMapId] = useState(calibrationMaps[0].id);
  const [view, setView] = useState<ViewMode>('table');
  const [openGroups, setOpenGroups] = useState<string[]>(['Engine', 'Fuel']);
  const [showDetection, setShowDetection] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [edited, setEdited] = useState<Record<string, number[][]>>({});

  const map = calibrationMaps.find(m => m.id === selectedMapId)!;
  const grid = edited[map.id] ?? map.modified;

  function updateCell(r: number, c: number, value: number) {
    setEdited(prev => {
      const base = prev[map.id] ?? map.modified.map(row => [...row]);
      const next = base.map(row => [...row]);
      next[r][c] = value;
      return { ...prev, [map.id]: next };
    });
  }

  const chartData = useMemo(() => map.x.values.map((rpm, i) => {
    const row: Record<string, number> = { rpm };
    map.y.values.forEach((load, li) => { row[`${load}%`] = grid[li]?.[i] ?? 0; });
    return row;
  }), [map, grid]);

  const plotData = useMemo(() => [{
    type: 'surface' as const,
    x: map.x.values,
    y: map.y.values,
    z: grid,
    colorscale: [[0, '#0d1420'], [0.5, '#2f8fff'], [1, '#00ffa3']] as any,
    showscale: false,
  }], [map, grid]);

  return (
    <div className="animate-fade-up space-y-4 h-full flex flex-col">
      <SimulationBanner />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Map Editor</h1>
          <p className="text-base-400 text-sm mt-1">Análise e calibração de mapas ECU — ambiente profissional de tuning.</p>
        </div>
        <button
          onClick={() => setShowDetection(v => !v)}
          className={clsx('flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition-colors', showDetection ? 'border-electric-2/60 text-electric-2 bg-electric-2/10' : 'border-white/15 hover:bg-white/5')}
        >
          <Search size={15} /> Detecção de mapas
        </button>
      </div>

      {showDetection && (
        <GlassCard title="Mapas detectados no arquivo">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-base-400 border-b border-white/8">
                <th className="pb-2 font-medium">Nome</th><th className="font-medium">Categoria</th><th className="font-medium">Endereço</th>
                <th className="font-medium">Dimensão</th><th className="font-medium">Tamanho</th><th className="font-medium">Confiança</th>
              </tr>
            </thead>
            <tbody>
              {detectedMaps.map(m => (
                <tr key={m.id} className="border-b border-white/5 last:border-0">
                  <td className="py-2 font-medium">{m.nome}</td><td className="text-base-300">{m.categoria}</td>
                  <td className="font-mono-tech text-electric-2">{m.endereco}</td><td className="font-mono-tech">{m.dimensao}</td>
                  <td>{m.tamanho}</td>
                  <td className={clsx(m.confianca === 'Alta confiança' && 'text-perf-green', m.confianca === 'Média confiança' && 'text-amber', m.confianca === 'Baixa confiança' && 'text-alert-red')}>{m.confianca}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      <div className="grid grid-cols-12 gap-4 flex-1 min-h-[620px]">
        {/* left sidebar: map tree */}
        <div className="col-span-12 lg:col-span-2 glass rounded-2xl p-3 overflow-y-auto">
          <div className="text-[11px] uppercase text-base-400 tracking-wider px-1 mb-2">Mapas do arquivo</div>
          {mapTree.map(g => (
            <div key={g.group} className="mb-1">
              <button
                onClick={() => setOpenGroups(o => o.includes(g.group) ? o.filter(x => x !== g.group) : [...o, g.group])}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-base-200 hover:bg-white/5 rounded-lg"
              >
                <ChevronRight size={12} className={clsx('transition-transform', openGroups.includes(g.group) && 'rotate-90')} />
                {g.group}
              </button>
              {openGroups.includes(g.group) && (
                <div className="ml-4 flex flex-col">
                  {g.maps.map(name => {
                    const cm = calibrationMaps.find(m => m.nome === name);
                    return (
                      <button
                        key={name}
                        disabled={!cm}
                        onClick={() => cm && setSelectedMapId(cm.id)}
                        className={clsx(
                          'text-left px-2 py-1.5 rounded-lg text-xs transition-colors',
                          cm && cm.id === selectedMapId ? 'text-electric-2 bg-electric-2/10' : cm ? 'text-base-300 hover:bg-white/5' : 'text-base-600 cursor-default',
                        )}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* center editor */}
        <div className="col-span-12 lg:col-span-8 glass rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display text-sm uppercase tracking-wider text-base-100">{map.nome}</h3>
              <p className="text-[11px] text-base-400">{map.categoria} · {map.x.values.length}x{map.y.values.length} · unidade: {map.zUnit}</p>
            </div>
            <div className="flex bg-base-800/60 rounded-xl p-1 gap-0.5">
              {([
                { key: 'table', icon: Table2 }, { key: '2d', icon: Grid3x3 }, { key: '3d', icon: Boxes }, { key: 'hex', icon: Binary },
              ] as const).map(v => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={clsx('flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs uppercase transition-colors', view === v.key ? 'bg-electric-2/15 text-electric-2' : 'text-base-400 hover:text-base-100')}
                >
                  <v.icon size={13} /> {v.key}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-[420px]">
            {view === 'table' && (
              <div className="overflow-auto h-full">
                <table className="text-xs font-mono-tech border-collapse w-full">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-base-900 p-2 text-base-400">Carga \ RPM</th>
                      {map.x.values.map(rpm => <th key={rpm} className="p-2 text-base-400 font-normal">{rpm}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {map.y.values.map((load, r) => (
                      <tr key={load}>
                        <td className="sticky left-0 bg-base-900 p-2 text-base-300 font-semibold">{load}%</td>
                        {map.x.values.map((_, c) => {
                          const orig = map.original[r][c];
                          const val = grid[r][c];
                          const changed = Math.abs(val - orig) > 0.01;
                          const isSel = selectedCell?.r === r && selectedCell?.c === c;
                          return (
                            <td key={c} className="p-0.5">
                              <input
                                value={val}
                                onFocus={() => setSelectedCell({ r, c })}
                                onChange={e => updateCell(r, c, Number(e.target.value) || 0)}
                                className={clsx(
                                  'w-16 text-center rounded-md py-1.5 outline-none border transition-colors',
                                  changed ? 'text-perf-green border-perf-green/30 bg-perf-green/5' : 'text-base-200 border-white/5 bg-white/[0.02]',
                                  isSel && 'ring-2 ring-electric-2/60 border-electric-2',
                                )}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {view === '2d' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="rpm" stroke="#5a6577" fontSize={11} />
                  <YAxis stroke="#5a6577" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'rgba(10,13,18,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {map.y.values.map((load, i) => (
                    <Line key={load} type="monotone" dataKey={`${load}%`} stroke={`hsl(${200 + i * 35}, 90%, 60%)`} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}

            {view === '3d' && (
              <Suspense fallback={<div className="flex items-center justify-center h-full text-base-400 text-sm animate-pulse">Carregando visualização 3D…</div>}>
                <Plot
                  data={plotData}
                  layout={{
                    autosize: true,
                    margin: { l: 0, r: 0, t: 10, b: 0 },
                    paper_bgcolor: 'transparent',
                    scene: {
                      xaxis: { title: { text: 'RPM' }, color: '#8892a0', gridcolor: '#232a36' },
                      yaxis: { title: { text: 'Carga (%)' }, color: '#8892a0', gridcolor: '#232a36' },
                      zaxis: { title: { text: map.zUnit }, color: '#8892a0', gridcolor: '#232a36' },
                      bgcolor: 'transparent',
                    },
                  }}
                  style={{ width: '100%', height: '100%' }}
                  config={{ displayModeBar: false, responsive: true }}
                />
              </Suspense>
            )}

            {view === 'hex' && (
              <HexPreview grid={grid} />
            )}
          </div>
        </div>

        {/* right properties panel */}
        <div className="col-span-12 lg:col-span-2 glass rounded-2xl p-4">
          <div className="text-[11px] uppercase text-base-400 tracking-wider mb-3">Propriedades</div>
          <div className="space-y-3 text-xs">
            <PropRow label="Mapa" value={map.nome} />
            <PropRow label="Categoria" value={map.categoria} />
            <PropRow label="Eixo X" value={`${map.x.label} (${map.x.values.length})`} />
            <PropRow label="Eixo Y" value={`${map.y.label} (${map.y.values.length})`} />
            <PropRow label="Unidade" value={map.zUnit} />
          </div>
          {selectedCell && (
            <div className="mt-4 pt-4 border-t border-white/8">
              <div className="text-[11px] uppercase text-base-400 tracking-wider mb-2">Célula selecionada</div>
              <PropRow label="RPM" value={String(map.x.values[selectedCell.c])} />
              <PropRow label="Carga" value={`${map.y.values[selectedCell.r]}%`} />
              <PropRow label="Original" value={`${map.original[selectedCell.r][selectedCell.c]} ${map.zUnit}`} />
              <PropRow label="Atual" value={`${grid[selectedCell.r][selectedCell.c]} ${map.zUnit}`} />
              <PropRow
                label="Alteração"
                value={`${(((grid[selectedCell.r][selectedCell.c] - map.original[selectedCell.r][selectedCell.c]) / map.original[selectedCell.r][selectedCell.c]) * 100).toFixed(1)}%`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PropRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-base-400">{label}</div>
      <div className="text-base-100 font-medium">{value}</div>
    </div>
  );
}

function HexPreview({ grid }: { grid: number[][] }) {
  const bytes: number[] = [];
  grid.forEach(row => row.forEach(v => {
    const scaled = Math.max(0, Math.min(255, Math.round(v)));
    bytes.push(scaled);
  }));
  const rows = [];
  for (let i = 0; i < bytes.length; i += 16) rows.push(bytes.slice(i, i + 16));

  return (
    <div className="overflow-auto h-full font-mono-tech text-[11px] leading-6">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-4">
          <span className="text-base-500">0x{(ri * 16).toString(16).toUpperCase().padStart(6, '0')}</span>
          <span className="text-electric-2 flex gap-2">
            {row.map((b, i) => <span key={i}>{b.toString(16).toUpperCase().padStart(2, '0')}</span>)}
          </span>
        </div>
      ))}
    </div>
  );
}
