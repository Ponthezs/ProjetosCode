export type Stage =
  | 'Original / Stock'
  | 'Stage 1'
  | 'Stage 2'
  | 'Stage 3'
  | 'Eco'
  | 'Performance'
  | 'Custom';

export type ProjectStatus =
  | 'Novo'
  | 'Arquivo recebido'
  | 'Em análise'
  | 'Mapeamento'
  | 'Validação'
  | 'Pronto'
  | 'Finalizado';

export type ReadMethod = 'OBD' | 'Bench' | 'Boot' | 'Virtual Read';

export type UserRole = 'Administrador' | 'Calibrador' | 'Técnico' | 'Atendimento';

export interface EcuInfo {
  fabricante: string;
  modelo: string;
  hardware: string;
  software: string;
  versao: string;
  numeroPeca: string;
  protocolo: string;
  metodoLeitura: ReadMethod;
}

export interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  versao: string;
  ano: number;
  motor: string;
  codigoMotor: string;
  potenciaOriginal: number; // cv
  torqueOriginal: number; // Nm
  combustivel: 'Gasolina' | 'Etanol' | 'Flex' | 'Diesel' | 'GNV';
  transmissao: string;
  tracao: string;
  placa: string;
  chassi: string;
  km: number;
  foto?: string;
  ecu: EcuInfo;
  stageAtual: Stage;
  clienteId?: string;
  createdAt: string;
}

export interface RemapProject {
  id: string;
  vehicleId: string;
  nome: string;
  stage: Stage;
  potenciaEstimada: number;
  torqueEstimado: number;
  status: ProjectStatus;
  responsavel: string;
  dataInicio: string;
  observacoes?: string;
}

export interface EcuFileVersion {
  id: string;
  vehicleId: string;
  projectId: string;
  nome: string;
  versao: number;
  tipo: 'original' | 'modificado';
  tamanhoKb: number;
  data: string;
  checksum: string;
  status: 'VALID' | 'INVALID' | 'CORRECTED';
}

export interface DetectedMap {
  id: string;
  nome: string;
  categoria: string;
  endereco: string;
  dimensao: string;
  tamanho: string;
  confianca: 'Alta confiança' | 'Média confiança' | 'Baixa confiança';
}

export interface MapAxis {
  label: string;
  unit: string;
  values: number[];
}

export interface CalibrationMap {
  id: string;
  nome: string;
  categoria: string;
  x: MapAxis;
  y: MapAxis;
  zUnit: string;
  original: number[][];
  modified: number[][];
}

export interface Client {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  documento: string;
  cidade: string;
}

export interface ServiceOrder {
  id: string;
  numero: string;
  clienteId: string;
  vehicleId: string;
  servico: string;
  status: 'Aberta' | 'Em andamento' | 'Aguardando peça' | 'Concluída' | 'Cancelada';
  valor: number;
  data: string;
}

export interface DynoRun {
  label: string;
  color: string;
  data: { rpm: number; power: number; torque: number }[];
}

export interface LogSample {
  t: number;
  rpm: number;
  throttle: number;
  afr: number;
  lambda: number;
  boost: number;
  ignition: number;
  torque: number;
  coolant: number;
  fuelPressure: number;
}

export interface HistoryEntry {
  id: string;
  vehicleId: string;
  usuario: string;
  data: string;
  hora: string;
  arquivo: string;
  mapa: string;
  valorAnterior: string;
  valorNovo: string;
}

export interface AppUser {
  id: string;
  nome: string;
  role: UserRole;
  email: string;
  avatarColor: string;
}
