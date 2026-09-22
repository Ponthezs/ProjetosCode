import type {
  Vehicle, RemapProject, EcuFileVersion, DetectedMap, CalibrationMap,
  Client, ServiceOrder, DynoRun, LogSample, HistoryEntry, AppUser,
} from '../types';

const rng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

function buildMap(rpmCount: number, loadCount: number, base: number, spread: number, seed: number): number[][] {
  const r = rng(seed);
  const rows: number[][] = [];
  for (let i = 0; i < loadCount; i++) {
    const row: number[] = [];
    for (let j = 0; j < rpmCount; j++) {
      const curve = Math.sin((j / rpmCount) * Math.PI) * 0.6 + (i / loadCount) * 0.7;
      row.push(Math.round((base + curve * spread + (r() - 0.5) * spread * 0.08) * 10) / 10);
    }
    rows.push(row);
  }
  return rows;
}

export const RPM_AXIS = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000];
export const LOAD_AXIS = [20, 40, 60, 80, 100];

export const clients: Client[] = [
  { id: 'c1', nome: 'Ricardo Almeida', telefone: '(11) 98221-4432', email: 'ricardo.almeida@gmail.com', documento: '312.442.110-90', cidade: 'São Paulo, SP' },
  { id: 'c2', nome: 'Fernanda Souza', telefone: '(21) 97711-2290', email: 'fe.souza@outlook.com', documento: '221.884.550-11', cidade: 'Niterói, RJ' },
  { id: 'c3', nome: 'Preparação Torque Motorsport', telefone: '(41) 3022-8871', email: 'contato@torquemotorsport.com.br', documento: '29.884.221/0001-05', cidade: 'Curitiba, PR' },
  { id: 'c4', nome: 'Bruno Cardoso', telefone: '(31) 99887-1120', email: 'bruno.cardoso@hotmail.com', documento: '110.223.884-77', cidade: 'Belo Horizonte, MG' },
  { id: 'c5', nome: 'Juliana Prado', telefone: '(51) 98122-3301', email: 'ju.prado@gmail.com', documento: '445.221.330-22', cidade: 'Porto Alegre, RS' },
];

export const vehicles: Vehicle[] = [
  {
    id: 'v1', marca: 'Volkswagen', modelo: 'Polo', versao: 'GTS 1.4 TSI', ano: 2021,
    motor: '1.4 TSI', codigoMotor: 'EA211', potenciaOriginal: 150, torqueOriginal: 250,
    combustivel: 'Flex', transmissao: 'Automática 6M', tracao: 'Dianteira',
    placa: 'BRA2E19', chassi: '9BWZZZ377VT004251', km: 32100,
    foto: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80&auto=format&fit=crop',
    ecu: { fabricante: 'Bosch', modelo: 'MED17.5.25', hardware: 'HW 06', software: 'SW 1037', versao: '4.31', numeroPeca: '03C906032LQ', protocolo: 'UDS / CAN', metodoLeitura: 'OBD' },
    stageAtual: 'Stage 1', clienteId: 'c1', createdAt: '2026-06-02',
  },
  {
    id: 'v2', marca: 'Volkswagen', modelo: 'Polo', versao: '1.6 MSI', ano: 2013,
    motor: '1.6 8V', codigoMotor: 'EA111', potenciaOriginal: 104, torqueOriginal: 155,
    combustivel: 'Flex', transmissao: 'Manual 5M', tracao: 'Dianteira',
    placa: 'ABC1D23', chassi: '9BWAB05U7DP123456', km: 88420,
    foto: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80&auto=format&fit=crop',
    ecu: { fabricante: 'Bosch', modelo: 'ME7.5.10', hardware: 'HW 04', software: 'SW 0261', versao: '2.14', numeroPeca: '030906032PA', protocolo: 'KWP2000', metodoLeitura: 'Bench' },
    stageAtual: 'Stage 1', clienteId: 'c4', createdAt: '2026-05-14',
  },
  {
    id: 'v3', marca: 'Fiat', modelo: 'Toro', versao: 'Ranch 2.0 Diesel', ano: 2022,
    motor: '2.0 16V Turbodiesel', codigoMotor: 'E torQ 2.0 MultiJet', potenciaOriginal: 170, torqueOriginal: 400,
    combustivel: 'Diesel', transmissao: 'Automática 9M', tracao: '4x4',
    placa: 'FLC4R88', chassi: '9BD35837CN0112233', km: 21000,
    foto: 'https://images.unsplash.com/photo-1595239434083-33baf879e2ce?w=800&q=80&auto=format&fit=crop',
    ecu: { fabricante: 'Bosch', modelo: 'EDC17C69', hardware: 'HW 02', software: 'SW 1102', versao: '5.02', numeroPeca: '55305511', protocolo: 'UDS / CAN', metodoLeitura: 'OBD' },
    stageAtual: 'Stage 2', clienteId: 'c3', createdAt: '2026-04-22',
  },
  {
    id: 'v4', marca: 'Chevrolet', modelo: 'Onix', versao: 'Plus Premier Turbo', ano: 2020,
    motor: '1.0 Turbo', codigoMotor: 'Firefly 999', potenciaOriginal: 116, torqueOriginal: 160,
    combustivel: 'Flex', transmissao: 'Automática CVT', tracao: 'Dianteira',
    placa: 'ONX9X21', chassi: '9BGKS48X0LB556677', km: 41230,
    foto: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&q=80&auto=format&fit=crop',
    ecu: { fabricante: 'Bosch', modelo: 'MD1CS006', hardware: 'HW 01', software: 'SW 0044', versao: '3.10', numeroPeca: '12681840', protocolo: 'UDS / CAN', metodoLeitura: 'OBD' },
    stageAtual: 'Original / Stock', clienteId: 'c5', createdAt: '2026-07-01',
  },
  {
    id: 'v5', marca: 'BMW', modelo: '320i', versao: 'M Sport', ano: 2019,
    motor: '2.0 Turbo', codigoMotor: 'B48', potenciaOriginal: 184, torqueOriginal: 300,
    combustivel: 'Gasolina', transmissao: 'Automática 8M', tracao: 'Traseira',
    placa: 'BMW2019', chassi: 'WBA8E9106KNU12345', km: 55600,
    foto: 'https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?w=800&q=80&auto=format&fit=crop',
    ecu: { fabricante: 'Bosch', modelo: 'MEVD17.2.8', hardware: 'HW 03', software: 'SW 3070', versao: '6.01', numeroPeca: '8749213', protocolo: 'UDS / CAN', metodoLeitura: 'Virtual Read' },
    stageAtual: 'Stage 2', clienteId: 'c2', createdAt: '2026-03-11',
  },
  {
    id: 'v6', marca: 'Volkswagen', modelo: 'Golf', versao: 'GTI', ano: 2018,
    motor: '2.0 TSI', codigoMotor: 'EA888 Gen3', potenciaOriginal: 230, torqueOriginal: 350,
    combustivel: 'Gasolina', transmissao: 'Automática DSG', tracao: 'Dianteira',
    placa: 'GTI2018', chassi: 'WVWZZZAUZJW112233', km: 62800,
    foto: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80&auto=format&fit=crop',
    ecu: { fabricante: 'Bosch', modelo: 'MG1CS003', hardware: 'HW 05', software: 'SW 5518', versao: '7.20', numeroPeca: '04E906027AT', protocolo: 'UDS / CAN', metodoLeitura: 'Boot' },
    stageAtual: 'Stage 3', clienteId: 'c3', createdAt: '2026-02-18',
  },
];

export const projects: RemapProject[] = [
  { id: 'p1', vehicleId: 'v1', nome: 'Polo GTS EA211 Stage 1', stage: 'Stage 1', potenciaEstimada: 185, torqueEstimado: 300, status: 'Finalizado', responsavel: 'Rafael Tuner', dataInicio: '2026-06-03' },
  { id: 'p2', vehicleId: 'v2', nome: 'Polo EA111 Stage 1', stage: 'Stage 1', potenciaEstimada: 122, torqueEstimado: 178, status: 'Validação', responsavel: 'Rafael Tuner', dataInicio: '2026-05-15' },
  { id: 'p3', vehicleId: 'v3', nome: 'Toro MultiJet Stage 2', stage: 'Stage 2', potenciaEstimada: 210, torqueEstimado: 470, status: 'Mapeamento', responsavel: 'Diego Calibra', dataInicio: '2026-04-23' },
  { id: 'p4', vehicleId: 'v4', nome: 'Onix Turbo Diagnóstico', stage: 'Original / Stock', potenciaEstimada: 116, torqueEstimado: 160, status: 'Em análise', responsavel: 'Diego Calibra', dataInicio: '2026-07-02' },
  { id: 'p5', vehicleId: 'v5', nome: '320i B48 Stage 2', stage: 'Stage 2', potenciaEstimada: 245, torqueEstimado: 420, status: 'Pronto', responsavel: 'Rafael Tuner', dataInicio: '2026-03-12' },
  { id: 'p6', vehicleId: 'v6', nome: 'Golf GTI EA888 Stage 3', stage: 'Stage 3', potenciaEstimada: 320, torqueEstimado: 460, status: 'Finalizado', responsavel: 'Diego Calibra', dataInicio: '2026-02-19' },
];

export const ecuFiles: EcuFileVersion[] = [
  { id: 'f1', vehicleId: 'v1', projectId: 'p1', nome: 'original.bin', versao: 1, tipo: 'original', tamanhoKb: 4096, data: '2026-06-03', checksum: 'A3F2C9D1', status: 'VALID' },
  { id: 'f2', vehicleId: 'v1', projectId: 'p1', nome: 'stage1_v1.bin', versao: 2, tipo: 'modificado', tamanhoKb: 4096, data: '2026-06-04', checksum: 'B7E1D420', status: 'VALID' },
  { id: 'f3', vehicleId: 'v1', projectId: 'p1', nome: 'stage1_v2.bin', versao: 3, tipo: 'modificado', tamanhoKb: 4096, data: '2026-06-05', checksum: 'C9A0E113', status: 'VALID' },
  { id: 'f4', vehicleId: 'v1', projectId: 'p1', nome: 'stage1_final.bin', versao: 4, tipo: 'modificado', tamanhoKb: 4096, data: '2026-06-06', checksum: 'D410FA55', status: 'CORRECTED' },
  { id: 'f5', vehicleId: 'v2', projectId: 'p2', nome: 'original.bin', versao: 1, tipo: 'original', tamanhoKb: 2048, data: '2026-05-15', checksum: '11AC02F0', status: 'VALID' },
  { id: 'f6', vehicleId: 'v2', projectId: 'p2', nome: 'stage1_v1.bin', versao: 2, tipo: 'modificado', tamanhoKb: 2048, data: '2026-05-17', checksum: '22BD13E1', status: 'VALID' },
  { id: 'f7', vehicleId: 'v3', projectId: 'p3', nome: 'original.bin', versao: 1, tipo: 'original', tamanhoKb: 8192, data: '2026-04-23', checksum: '9F0A11B2', status: 'VALID' },
  { id: 'f8', vehicleId: 'v3', projectId: 'p3', nome: 'stage2_v1.bin', versao: 2, tipo: 'modificado', tamanhoKb: 8192, data: '2026-04-25', checksum: 'AE331C90', status: 'INVALID' },
  { id: 'f9', vehicleId: 'v6', projectId: 'p6', nome: 'original.bin', versao: 1, tipo: 'original', tamanhoKb: 6144, data: '2026-02-19', checksum: '5501AB44', status: 'VALID' },
  { id: 'f10', vehicleId: 'v6', projectId: 'p6', nome: 'stage3_final.bin', versao: 5, tipo: 'modificado', tamanhoKb: 6144, data: '2026-02-27', checksum: '77CCEE10', status: 'VALID' },
];

export const detectedMaps: DetectedMap[] = [
  { id: 'dm1', nome: 'Torque Limiter', categoria: 'Torque', endereco: '0x1F4A20', dimensao: '16x16', tamanho: '512 bytes', confianca: 'Alta confiança' },
  { id: 'dm2', nome: 'Injection Quantity', categoria: 'Fuel', endereco: '0x2A1180', dimensao: '11x5', tamanho: '220 bytes', confianca: 'Alta confiança' },
  { id: 'dm3', nome: 'Ignition Timing Main', categoria: 'Ignition', endereco: '0x2C0040', dimensao: '11x5', tamanho: '220 bytes', confianca: 'Alta confiança' },
  { id: 'dm4', nome: 'Boost Target', categoria: 'Boost', endereco: '0x330AF0', dimensao: '9x9', tamanho: '324 bytes', confianca: 'Média confiança' },
  { id: 'dm5', nome: 'Lambda Target', categoria: 'Fuel', endereco: '0x2F1200', dimensao: '11x5', tamanho: '220 bytes', confianca: 'Alta confiança' },
  { id: 'dm6', nome: 'Knock Correction', categoria: 'Ignition', endereco: '0x2D0090', dimensao: '8x8', tamanho: '256 bytes', confianca: 'Média confiança' },
  { id: 'dm7', nome: 'RPM Limiter', categoria: 'RPM', endereco: '0x1A0010', dimensao: '1x1', tamanho: '2 bytes', confianca: 'Alta confiança' },
  { id: 'dm8', nome: 'Wastegate Duty Cycle', categoria: 'Boost', endereco: '0x331C40', dimensao: '9x9', tamanho: '324 bytes', confianca: 'Baixa confiança' },
  { id: 'dm9', nome: 'EGT Protection', categoria: 'Engine Protection', endereco: '0x350020', dimensao: '6x6', tamanho: '144 bytes', confianca: 'Média confiança' },
];

export const mapTree = [
  { group: 'Engine', maps: ['Torque', 'Torque Request', 'Torque Limiter', 'Driver Wish'] },
  { group: 'Fuel', maps: ['Injection Quantity', 'Injection Duration', 'Lambda Target', 'AFR'] },
  { group: 'Ignition', maps: ['Ignition Timing', 'Knock Correction'] },
  { group: 'Air', maps: ['Throttle', 'Air Load', 'MAF', 'MAP'] },
  { group: 'Boost', maps: ['Boost Target', 'Boost Limiter', 'Wastegate'] },
  { group: 'RPM', maps: ['RPM Limiter'] },
  { group: 'Temperature', maps: ['EGT', 'Coolant Protection'] },
];

function makeCalMap(id: string, nome: string, categoria: string, base: number, spread: number, gain: number, zUnit: string): CalibrationMap {
  const original = buildMap(RPM_AXIS.length, LOAD_AXIS.length, base, spread, id.length * 7 + 3);
  const modified = original.map(row => row.map(v => Math.round((v * gain) * 10) / 10));
  return {
    id, nome, categoria,
    x: { label: 'RPM', unit: 'rpm', values: RPM_AXIS },
    y: { label: 'Carga do motor', unit: '%', values: LOAD_AXIS },
    zUnit, original, modified,
  };
}

export const calibrationMaps: CalibrationMap[] = [
  makeCalMap('cm1', 'Torque Limiter', 'Torque', 180, 90, 1.22, 'Nm'),
  makeCalMap('cm2', 'Injection Quantity', 'Fuel', 22, 14, 1.14, 'mg/stroke'),
  makeCalMap('cm3', 'Ignition Timing', 'Ignition', 14, 10, 1.08, '° BTDC'),
  makeCalMap('cm4', 'Boost Target', 'Boost', 1.1, 0.7, 1.28, 'bar'),
];

export const dynoRuns: DynoRun[] = [
  { label: 'Stock', color: '#5a6577', data: RPM_AXIS.map((rpm, i) => ({ rpm, power: Math.round(60 + i * 9), torque: Math.round(150 + i * 6) })) },
  { label: 'Stage 1', color: '#2f8fff', data: RPM_AXIS.map((rpm, i) => ({ rpm, power: Math.round(72 + i * 11.4), torque: Math.round(178 + i * 7.4) })) },
  { label: 'Stage 2', color: '#00ffa3', data: RPM_AXIS.map((rpm, i) => ({ rpm, power: Math.round(84 + i * 13.8), torque: Math.round(205 + i * 8.9) })) },
  { label: 'Custom', color: '#ff3b5c', data: RPM_AXIS.map((rpm, i) => ({ rpm, power: Math.round(92 + i * 15.6), torque: Math.round(222 + i * 9.9) })) },
];

export const logSamples: LogSample[] = Array.from({ length: 40 }).map((_, i) => {
  const r = rng(i + 1);
  const phase = i / 40;
  return {
    t: i,
    rpm: Math.round(1200 + phase * 4800 + r() * 200),
    throttle: Math.round(Math.min(100, phase * 120 + r() * 10)),
    afr: Math.round((14.7 - phase * 3.2 + r() * 0.4) * 10) / 10,
    lambda: Math.round((1.0 - phase * 0.22 + r() * 0.02) * 100) / 100,
    boost: Math.round((phase * 1.4 + r() * 0.1) * 100) / 100,
    ignition: Math.round(8 + phase * 14 + r() * 2),
    torque: Math.round(160 + phase * 220 + r() * 15),
    coolant: Math.round(78 + phase * 14),
    fuelPressure: Math.round(3.2 + phase * 1.4 * 10) / 10,
  };
});

export const historyEntries: HistoryEntry[] = [
  { id: 'h1', vehicleId: 'v1', usuario: 'Rafael Tuner', data: '2026-06-04', hora: '14:32', arquivo: 'stage1_v1.bin', mapa: 'Torque Limiter', valorAnterior: '180 Nm', valorNovo: '215 Nm' },
  { id: 'h2', vehicleId: 'v1', usuario: 'Rafael Tuner', data: '2026-06-04', hora: '14:41', arquivo: 'stage1_v1.bin', mapa: 'Ignition Timing', valorAnterior: '12° BTDC', valorNovo: '15° BTDC' },
  { id: 'h3', vehicleId: 'v1', usuario: 'Rafael Tuner', data: '2026-06-05', hora: '09:12', arquivo: 'stage1_v2.bin', mapa: 'Injection Quantity', valorAnterior: '22 mg', valorNovo: '25 mg' },
  { id: 'h4', vehicleId: 'v1', usuario: 'Diego Calibra', data: '2026-06-06', hora: '17:05', arquivo: 'stage1_final.bin', mapa: 'Boost Target', valorAnterior: '1.10 bar', valorNovo: '1.35 bar' },
  { id: 'h5', vehicleId: 'v3', usuario: 'Diego Calibra', data: '2026-04-25', hora: '11:20', arquivo: 'stage2_v1.bin', mapa: 'Torque Limiter', valorAnterior: '400 Nm', valorNovo: '470 Nm' },
  { id: 'h6', vehicleId: 'v6', usuario: 'Rafael Tuner', data: '2026-02-26', hora: '16:48', arquivo: 'stage3_final.bin', mapa: 'Wastegate', valorAnterior: '48%', valorNovo: '62%' },
];

export const serviceOrders: ServiceOrder[] = [
  { id: 'os1', numero: 'OS #000124', clienteId: 'c1', vehicleId: 'v1', servico: 'Remap Stage 1', status: 'Concluída', valor: 1450, data: '2026-06-06' },
  { id: 'os2', numero: 'OS #000125', clienteId: 'c4', vehicleId: 'v2', servico: 'Remap Stage 1', status: 'Em andamento', valor: 1200, data: '2026-05-15' },
  { id: 'os3', numero: 'OS #000126', clienteId: 'c3', vehicleId: 'v3', servico: 'Remap Stage 2 + Decat', status: 'Aguardando peça', valor: 2200, data: '2026-04-23' },
  { id: 'os4', numero: 'OS #000127', clienteId: 'c5', vehicleId: 'v4', servico: 'Diagnóstico completo', status: 'Aberta', valor: 350, data: '2026-07-02' },
  { id: 'os5', numero: 'OS #000128', clienteId: 'c2', vehicleId: 'v5', servico: 'Remap Stage 2', status: 'Concluída', valor: 1980, data: '2026-03-14' },
  { id: 'os6', numero: 'OS #000129', clienteId: 'c3', vehicleId: 'v6', servico: 'Remap Stage 3 + Dyno', status: 'Concluída', valor: 3100, data: '2026-02-27' },
];

export const appUsers: AppUser[] = [
  { id: 'u1', nome: 'Rafael Tuner', role: 'Calibrador', email: 'rafael@remaptech.com.br', avatarColor: '#2f8fff' },
  { id: 'u2', nome: 'Diego Calibra', role: 'Calibrador', email: 'diego@remaptech.com.br', avatarColor: '#00ffa3' },
  { id: 'u3', nome: 'Marina Costa', role: 'Atendimento', email: 'marina@remaptech.com.br', avatarColor: '#ffb020' },
  { id: 'u4', nome: 'Felipe Pontes', role: 'Administrador', email: 'pontesfelipe835@gmail.com', avatarColor: '#ff3b5c' },
  { id: 'u5', nome: 'André Silva', role: 'Técnico', email: 'andre@remaptech.com.br', avatarColor: '#8892a0' },
];

export const ecuDatabase = [
  { marca: 'Volkswagen', modelo: 'Polo/Golf', motor: '1.4-2.0 TSI', ano: '2015-2023', ecu: 'Bosch MED17 / MG1', hardware: 'HW 05-06', software: 'SW 3xxx-5xxx', protocolo: 'UDS / CAN', leitura: 'OBD / Bench / Boot' },
  { marca: 'Fiat', modelo: 'Toro/Strada', motor: '2.0 MultiJet', ano: '2016-2024', ecu: 'Bosch EDC17C69', hardware: 'HW 02', software: 'SW 1xxx', protocolo: 'UDS / CAN', leitura: 'OBD' },
  { marca: 'Chevrolet', modelo: 'Onix/Tracker', motor: '1.0-1.2 Turbo', ano: '2019-2024', ecu: 'Bosch MD1CS006', hardware: 'HW 01', software: 'SW 00xx', protocolo: 'UDS / CAN', leitura: 'OBD' },
  { marca: 'BMW', modelo: 'Série 1/2/3', motor: 'B38/B48', ano: '2015-2022', ecu: 'Bosch MEVD17.2', hardware: 'HW 03', software: 'SW 30xx', protocolo: 'UDS / CAN', leitura: 'Virtual Read' },
  { marca: 'Hyundai/Kia', modelo: 'HB20/Creta', motor: '1.0 Turbo Kappa', ano: '2020-2024', ecu: 'Continental SIM2K', hardware: 'HW 25x', software: 'SW 4xxx', protocolo: 'UDS / CAN', leitura: 'OBD / Bench' },
  { marca: 'Renault', modelo: 'Duster/Kwid', motor: '1.3 Turbo', ano: '2019-2024', ecu: 'Continental EMS3155', hardware: 'HW 15x', software: 'SW 2xxx', protocolo: 'UDS / CAN', leitura: 'OBD' },
];

export const mapLibrary = [
  { marca: 'Volkswagen', motor: 'EA111', ecu: 'Bosch ME7', categorias: ['Torque Limiter', 'Ignition', 'Fuel', 'Lambda', 'Throttle'] },
  { marca: 'Volkswagen', motor: 'EA211/EA888', ecu: 'Bosch MED17 / MG1', categorias: ['Boost Target', 'Torque Limiter', 'Ignition', 'Wastegate'] },
  { marca: 'Fiat', motor: 'MultiJet 2.0', ecu: 'Bosch EDC17', categorias: ['Injection Quantity', 'Boost Target', 'Smoke Limiter'] },
  { marca: 'BMW', motor: 'B48', ecu: 'Bosch MEVD17', categorias: ['Torque Request', 'Knock Correction', 'Boost Target'] },
];
