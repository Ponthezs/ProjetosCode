import React, { useEffect, useState } from 'react';
import { 
  ListMusic, 
  Music, 
  Users, 
  Disc, 
  Clock, 
  CopyX, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  Radio, 
  Compass 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';
import { fetchDashboardSummary } from '../services/api';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="h-[75vh] flex items-center justify-center text-slate-400 gap-3">
        <Sparkles className="w-6 h-6 animate-spin text-emerald-400" />
        <span>Carregando estatísticas da sua biblioteca...</span>
      </div>
    );
  }

  const { metrics, tops, recent_tracks, charts } = data;
  const PIE_COLORS = ['#1DB954', '#8B5CF6', '#06B6D4', '#EC4899', '#F59E0B', '#10B981'];

  return (
    <div className="space-y-6 pb-10 select-none">
      {/* Top Banner Alert if Disorganized */}
      {metrics.disorganized_playlists_count > 0 && (
        <div className="glass-panel rounded-2xl p-4 border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">
                Encontramos {metrics.disorganized_playlists_count} playlists desorganizadas e {metrics.duplicates_count} duplicadas
              </h3>
              <p className="text-xs text-slate-400">
                Sua biblioteca pode ser otimizada instantaneamente usando nosso Curador IA.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('ai-organizer')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>Resolver Agora</span>
          </button>
        </div>
      )}

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="glass-panel glass-panel-hover rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Playlists</span>
            <ListMusic className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">{metrics.total_playlists}</div>
          <p className="text-[11px] text-emerald-400 mt-1">100% Sincronizadas</p>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Músicas</span>
            <Music className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">{metrics.total_tracks}</div>
          <p className="text-[11px] text-slate-400 mt-1">Analisadas por IA</p>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Artistas</span>
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">{metrics.total_artists}</div>
          <p className="text-[11px] text-violet-400 mt-1">Catalogados</p>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Álbuns</span>
            <Disc className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">{metrics.total_albums}</div>
          <p className="text-[11px] text-slate-400 mt-1">Coleção</p>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tempo Total</span>
            <Clock className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">{metrics.total_time}</div>
          <p className="text-[11px] text-pink-400 mt-1">Áudio Acumulado</p>
        </div>
      </div>

      {/* Tops Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Top Artistas */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-emerald-400" /> Top Artistas
          </h4>
          <div className="space-y-2">
            {tops.artists.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium truncate">{idx + 1}. {item.artist}</span>
                <span className="text-slate-500 font-semibold">{item.count} faixas</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Gêneros */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-violet-400" /> Top Gêneros
          </h4>
          <div className="space-y-2">
            {tops.genres.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium truncate">{idx + 1}. {item.genre}</span>
                <span className="text-slate-500 font-semibold">{item.count} faixas</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Décadas */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Top Décadas
          </h4>
          <div className="space-y-2">
            {tops.decades.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium truncate">{item.decade}</span>
                <span className="text-slate-500 font-semibold">{item.count} faixas</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Idiomas */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-pink-400" /> Top Idiomas
          </h4>
          <div className="space-y-2">
            {tops.languages.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium truncate">{item.language}</span>
                <span className="text-slate-500 font-semibold">{item.count} faixas</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Charts Row 1: Genre Breakdown & Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico por Gênero */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" /> Distribuição por Gênero
            </h3>
            <span className="text-xs text-slate-500">Músicas Categorizadas</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.by_genre}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {charts.by_genre.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D111A', borderColor: '#1F293D', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Evolução */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" /> Evolução da Organização
            </h3>
            <span className="text-xs text-slate-500">Histórico de Curadoria</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.evolution}>
                <defs>
                  <linearGradient id="colorOrg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0D111A', borderColor: '#1F293D', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="organizadas" stroke="#10B981" fillOpacity={1} fill="url(#colorOrg)" name="Playlists Organizadas" />
                <Area type="monotone" dataKey="desorganizadas" stroke="#F59E0B" fillOpacity={1} fill="url(#colorDes)" name="Aguardando Curadoria" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Top Artistas & Décadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico por Artista */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" /> Concentração por Artista
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.by_artist}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0D111A', borderColor: '#1F293D', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="tracks" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Músicas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico por Década */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-pink-400" /> Músicas por Década
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.by_decade}>
                <XAxis dataKey="decade" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0D111A', borderColor: '#1F293D', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="count" fill="#EC4899" radius={[6, 6, 0, 0]} name="Faixas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
