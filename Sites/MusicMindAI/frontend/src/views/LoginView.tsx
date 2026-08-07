import React, { useState } from 'react';
import { Music2, ShieldCheck, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { connectGoogle } from '../services/api';

interface LoginViewProps {
  onSuccess: (email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('musico.ai@gmail.com');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await connectGoogle(email);
      onSuccess(email);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden text-center">
        {/* Neon Glow Aura Background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-glow-emerald mb-6">
          <Music2 className="w-8 h-8 text-black" />
        </div>

        <h2 className="text-2xl font-display font-bold text-white mb-2">
          Bem-vindo ao MusicMind AI
        </h2>
        <p className="text-sm text-slate-400 mb-8">
          Organize sua biblioteca inteira do YouTube Music automaticamente com Inteligência Artificial.
        </p>

        {/* Input Email */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Conta Google
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-obsidian-800 text-sm text-slate-200 px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="seu.email@gmail.com"
          />
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold text-sm shadow-glow-emerald hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 mb-6"
        >
          {loading ? (
            <span>Conectando com OAuth Google...</span>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#000" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#000" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#000" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#000" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Conectar com Google</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>

        {/* Guarantees */}
        <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-4">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tokens armazenados de forma segura localmente.</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Nunca solicitar login novamente após conectar.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
