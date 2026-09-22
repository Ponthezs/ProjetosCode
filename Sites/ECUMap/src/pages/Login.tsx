import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Lock, Mail, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { appUsers } from '../data/mock';

export default function Login() {
  const { setAuthenticated, setCurrentUser } = useApp();
  const [userId, setUserId] = useState(appUsers[3].id);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const u = appUsers.find(u => u.id === userId) ?? appUsers[3];
      setCurrentUser(u);
      setAuthenticated(true);
      navigate('/app');
    }, 750);
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-electric/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-perf-green/10 blur-[100px]" />
      </div>

      <form onSubmit={handleSubmit} className="relative glass rounded-3xl p-8 w-full max-w-sm animate-fade-up">
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-electric to-electric-2 flex items-center justify-center shadow-glow-blue mb-4">
            <Cpu className="text-base-950" size={26} strokeWidth={2.5} />
          </div>
          <h1 className="font-display font-bold text-xl tracking-wide">REMAP<span className="text-electric-2">TECH</span></h1>
          <p className="text-xs text-base-400 font-mono-tech mt-1">ECU CALIBRATION PLATFORM</p>
        </div>

        <label className="block mb-3">
          <span className="text-xs text-base-300 mb-1.5 block">Perfil de acesso</span>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
            <select
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="w-full appearance-none bg-base-800/70 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-electric-2/60 focus:ring-1 focus:ring-electric-2/40"
            >
              {appUsers.map(u => (
                <option key={u.id} value={u.id}>{u.nome} — {u.role}</option>
              ))}
            </select>
          </div>
        </label>

        <label className="block mb-6">
          <span className="text-xs text-base-300 mb-1.5 block">Senha</span>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
            <input
              type="password"
              defaultValue="••••••••"
              className="w-full bg-base-800/70 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-electric-2/60 focus:ring-1 focus:ring-electric-2/40"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-electric to-electric-2 text-base-950 font-semibold text-sm py-2.5 rounded-xl shadow-glow-blue hover:brightness-110 transition-all disabled:opacity-70"
        >
          {loading ? <><Loader2 size={15} className="animate-spin" /> Autenticando...</> : 'ENTRAR NO SISTEMA'}
        </button>

        <p className="text-center text-[11px] text-base-400 mt-5 font-mono-tech">v0.9.0 — Ambiente de demonstração</p>
      </form>
    </div>
  );
}
