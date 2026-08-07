import React, { useEffect, useState } from 'react';
import { 
  Radio, 
  Sparkles, 
  Disc3, 
  Compass, 
  History, 
  PartyPopper, 
  Smile, 
  CloudRain, 
  Car, 
  Gamepad2, 
  Coffee, 
  Briefcase, 
  Code2, 
  BookOpen, 
  Play 
} from 'lucide-react';
import { fetchListeningModes, launchListeningMode } from '../services/api';
import { ListeningMode } from '../types';

interface ListeningModesViewProps {
  onLaunchMode: (title: string, tracks: any[]) => void;
}

const ICON_MAP: Record<string, any> = {
  Disc3, Compass, History, PartyPopper, Smile, CloudRain, Car, Gamepad2, Coffee, Briefcase, Code2, BookOpen
};

export const ListeningModesView: React.FC<ListeningModesViewProps> = ({ onLaunchMode }) => {
  const [modes, setModes] = useState<ListeningMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [launchingKey, setLaunchingKey] = useState<string | null>(null);

  useEffect(() => {
    fetchListeningModes()
      .then(res => {
        setModes(res);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handleLaunch = async (key: string, title: string) => {
    setLaunchingKey(key);
    try {
      const res = await launchListeningMode(key);
      onLaunchMode(title, res.tracks);
    } catch (e) {
      console.error(e);
    } finally {
      setLaunchingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-slate-400 gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-emerald-400" />
        <span>Carregando Modos de Ouvir...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" /> Modos Especiais de Ouvir com IA
          </h2>
          <p className="text-xs text-slate-400">
            Selecione uma atmosfera sob medida para o seu momento atual.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modes.map(mode => {
          const IconComponent = ICON_MAP[mode.icon] || Radio;
          const isLaunching = launchingKey === mode.key;

          return (
            <div
              key={mode.key}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-glow-emerald">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Modo IA</span>
                </div>

                <h3 className="text-base font-bold font-display text-white mb-1.5">{mode.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 mb-6">{mode.description}</p>
              </div>

              <button
                onClick={() => handleLaunch(mode.key, mode.title)}
                disabled={isLaunching}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
              >
                {isLaunching ? (
                  <span>Sintonizando...</span>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Iniciar {mode.title}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
