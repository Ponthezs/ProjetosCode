import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Cpu, Save, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ReadMethod, Vehicle } from '../types';

const inputCls = 'w-full bg-base-800/70 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-electric-2/60 focus:ring-1 focus:ring-electric-2/40 transition-colors';
const labelCls = 'text-xs text-base-300 mb-1.5 block';

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input className={inputCls} {...props} />
    </label>
  );
}

export default function VehicleForm() {
  const { addVehicle } = useApp();
  const navigate = useNavigate();
  const [foto, setFoto] = useState<string>('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop');
  const [form, setForm] = useState({
    marca: '', modelo: '', versao: '', ano: '', motor: '', codigoMotor: '',
    potenciaOriginal: '', torqueOriginal: '', combustivel: 'Flex', transmissao: '',
    tracao: '', placa: '', chassi: '', km: '',
    ecuFabricante: '', ecuModelo: '', ecuHardware: '', ecuSoftware: '', ecuVersao: '',
    ecuNumeroPeca: '', ecuProtocolo: '', metodoLeitura: 'OBD' as ReadMethod,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v: Vehicle = {
      id: 'v' + Date.now(),
      marca: form.marca || 'Sem marca', modelo: form.modelo || 'Sem modelo', versao: form.versao,
      ano: Number(form.ano) || new Date().getFullYear(), motor: form.motor, codigoMotor: form.codigoMotor,
      potenciaOriginal: Number(form.potenciaOriginal) || 0, torqueOriginal: Number(form.torqueOriginal) || 0,
      combustivel: form.combustivel as Vehicle['combustivel'], transmissao: form.transmissao, tracao: form.tracao,
      placa: form.placa, chassi: form.chassi, km: Number(form.km) || 0, foto,
      ecu: {
        fabricante: form.ecuFabricante, modelo: form.ecuModelo, hardware: form.ecuHardware,
        software: form.ecuSoftware, versao: form.ecuVersao, numeroPeca: form.ecuNumeroPeca,
        protocolo: form.ecuProtocolo, metodoLeitura: form.metodoLeitura,
      },
      stageAtual: 'Original / Stock',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    addVehicle(v);
    navigate(`/app/garage/${v.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Car className="text-electric-2" /> Cadastro de Veículo</h1>
        <p className="text-base-400 text-sm mt-1">Preencha os dados do veículo e da ECU para iniciar um novo projeto.</p>
      </div>

      <div className="glass rounded-2xl p-5 flex items-center gap-5">
        <div className="h-24 w-36 rounded-xl overflow-hidden bg-base-800 shrink-0">
          <img src={foto} className="w-full h-full object-cover" />
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs text-electric-2 cursor-pointer hover:underline">
            <Upload size={14} /> Trocar foto do veículo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setFoto(URL.createObjectURL(file));
            }} />
          </label>
          <p className="text-[11px] text-base-400 mt-1">JPG ou PNG, recomendado 800x600px.</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-display text-sm tracking-wider text-base-200 uppercase mb-4">Dados do veículo</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Marca" value={form.marca} onChange={e => set('marca', e.target.value)} placeholder="Volkswagen" />
          <Field label="Modelo" value={form.modelo} onChange={e => set('modelo', e.target.value)} placeholder="Polo" />
          <Field label="Versão" value={form.versao} onChange={e => set('versao', e.target.value)} placeholder="GTS 1.4 TSI" />
          <Field label="Ano" type="number" value={form.ano} onChange={e => set('ano', e.target.value)} placeholder="2021" />
          <Field label="Motor" value={form.motor} onChange={e => set('motor', e.target.value)} placeholder="1.4 TSI" />
          <Field label="Código do motor" value={form.codigoMotor} onChange={e => set('codigoMotor', e.target.value)} placeholder="EA211" />
          <Field label="Potência original (cv)" type="number" value={form.potenciaOriginal} onChange={e => set('potenciaOriginal', e.target.value)} />
          <Field label="Torque original (Nm)" type="number" value={form.torqueOriginal} onChange={e => set('torqueOriginal', e.target.value)} />
          <label className="block">
            <span className={labelCls}>Combustível</span>
            <select className={inputCls} value={form.combustivel} onChange={e => set('combustivel', e.target.value)}>
              {['Gasolina', 'Etanol', 'Flex', 'Diesel', 'GNV'].map(o => <option key={o}>{o}</option>)}
            </select>
          </label>
          <Field label="Transmissão" value={form.transmissao} onChange={e => set('transmissao', e.target.value)} placeholder="Automática 6M" />
          <Field label="Tração" value={form.tracao} onChange={e => set('tracao', e.target.value)} placeholder="Dianteira" />
          <Field label="Placa" value={form.placa} onChange={e => set('placa', e.target.value)} placeholder="BRA2E19" />
          <Field label="Chassi" value={form.chassi} onChange={e => set('chassi', e.target.value)} placeholder="9BWZZZ..." />
          <Field label="Quilometragem" type="number" value={form.km} onChange={e => set('km', e.target.value)} />
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-display text-sm tracking-wider text-base-200 uppercase mb-4 flex items-center gap-2"><Cpu size={15} className="text-electric-2" /> Informações da ECU</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Fabricante ECU" value={form.ecuFabricante} onChange={e => set('ecuFabricante', e.target.value)} placeholder="Bosch" />
          <Field label="Modelo ECU" value={form.ecuModelo} onChange={e => set('ecuModelo', e.target.value)} placeholder="MED17.5.25" />
          <Field label="Hardware" value={form.ecuHardware} onChange={e => set('ecuHardware', e.target.value)} placeholder="HW 06" />
          <Field label="Software" value={form.ecuSoftware} onChange={e => set('ecuSoftware', e.target.value)} placeholder="SW 1037" />
          <Field label="Versão" value={form.ecuVersao} onChange={e => set('ecuVersao', e.target.value)} placeholder="4.31" />
          <Field label="Número de peça" value={form.ecuNumeroPeca} onChange={e => set('ecuNumeroPeca', e.target.value)} placeholder="03C906032LQ" />
          <Field label="Protocolo utilizado" value={form.ecuProtocolo} onChange={e => set('ecuProtocolo', e.target.value)} placeholder="UDS / CAN" />
          <label className="block">
            <span className={labelCls}>Método de leitura</span>
            <select className={inputCls} value={form.metodoLeitura} onChange={e => set('metodoLeitura', e.target.value as ReadMethod)}>
              {['OBD', 'Bench', 'Boot', 'Virtual Read'].map(o => <option key={o}>{o}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => navigate(-1)} className="px-4 py-2.5 rounded-xl border border-white/10 text-sm text-base-300 hover:bg-white/5 transition-colors">Cancelar</button>
        <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-electric to-electric-2 text-base-950 font-semibold text-sm px-5 py-2.5 rounded-xl shadow-glow-blue hover:brightness-110 transition-all">
          <Save size={16} /> Salvar veículo
        </button>
      </div>
    </form>
  );
}
