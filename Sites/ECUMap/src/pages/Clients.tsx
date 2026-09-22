import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Mail, Phone, MapPin, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Client } from '../types';

export default function Clients() {
  const { clients, addClient, vehicles } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Clientes</h1>
          <p className="text-base-400 text-sm mt-1">{clients.length} clientes cadastrados</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-electric to-electric-2 text-base-950 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-glow-blue">
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {clients.map(c => {
          const linked = vehicles.filter(v => v.clienteId === c.id);
          return (
            <div key={c.id} className="glass glass-hover rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-electric/15 text-electric-2 flex items-center justify-center font-bold text-sm">
                  {c.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="font-medium text-sm">{c.nome}</div>
                  <div className="text-[11px] text-base-400 font-mono-tech">{c.documento}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-base-300">
                <div className="flex items-center gap-2"><Phone size={12} className="text-base-400" /> {c.telefone}</div>
                <div className="flex items-center gap-2"><Mail size={12} className="text-base-400" /> {c.email}</div>
                <div className="flex items-center gap-2"><MapPin size={12} className="text-base-400" /> {c.cidade}</div>
              </div>
              {linked.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="text-[10px] uppercase text-base-400 mb-1.5">Veículos vinculados</div>
                  <div className="flex flex-wrap gap-1.5">
                    {linked.map(v => (
                      <button key={v.id} onClick={() => navigate(`/app/garage/${v.id}`)} className="text-[11px] px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                        {v.marca} {v.modelo}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {open && <NewClientModal onClose={() => setOpen(false)} onSave={(c) => { addClient(c); setOpen(false); }} />}
    </div>
  );
}

function NewClientModal({ onClose, onSave }: { onClose: () => void; onSave: (c: Client) => void }) {
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', documento: '', cidade: '' });
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={e => { e.preventDefault(); onSave({ id: 'c' + Date.now(), ...form }); }}
        className="glass rounded-2xl p-6 w-full max-w-md animate-fade-up"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm uppercase tracking-wider">Novo Cliente</h3>
          <button type="button" onClick={onClose}><X size={18} className="text-base-400" /></button>
        </div>
        <div className="space-y-3">
          {(['nome', 'telefone', 'email', 'documento', 'cidade'] as const).map(k => (
            <input key={k} required placeholder={k[0].toUpperCase() + k.slice(1)} value={form[k]}
              onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
              className="w-full bg-base-800/70 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-electric-2/60" />
          ))}
        </div>
        <button type="submit" className="w-full mt-5 bg-gradient-to-r from-electric to-electric-2 text-base-950 font-semibold text-sm py-2.5 rounded-xl shadow-glow-blue">Salvar</button>
      </form>
    </div>
  );
}
