import type { ProfessionalTemplate, RoleDef, RoleId, Seniority, SkillKey } from '../types';

export const ROLES: Record<RoleId, RoleDef> = {
  analyst: { id: 'analyst', name: 'Analista de Requisitos', short: 'Analista', primaryStage: 'analysis', specialtyStages: ['analysis', 'uat'], color: '#a78bfa' },
  frontend: { id: 'frontend', name: 'Desenvolvedor Front-end', short: 'Front-end', primaryStage: 'dev', specialtyStages: ['dev', 'review'], color: '#38bdf8' },
  backend: { id: 'backend', name: 'Desenvolvedor Back-end', short: 'Back-end', primaryStage: 'dev', specialtyStages: ['dev', 'review'], color: '#60a5fa' },
  fullstack: { id: 'fullstack', name: 'Desenvolvedor Full Stack', short: 'Full Stack', primaryStage: 'dev', specialtyStages: ['dev', 'review'], color: '#818cf8' },
  qa: { id: 'qa', name: 'Analista de Qualidade', short: 'QA', primaryStage: 'test', specialtyStages: ['test', 'uat'], color: '#34d399' },
  devops: { id: 'devops', name: 'Engenheiro DevOps', short: 'DevOps', primaryStage: 'deploy', specialtyStages: ['deploy'], color: '#fb923c' },
  ux: { id: 'ux', name: 'UX Designer', short: 'UX', primaryStage: 'analysis', specialtyStages: ['analysis', 'uat'], color: '#f472b6' },
  architect: { id: 'architect', name: 'Arquiteto de Software', short: 'Arquiteto', primaryStage: 'review', specialtyStages: ['review', 'analysis'], color: '#22d3ee' },
  dba: { id: 'dba', name: 'Administrador de Banco de Dados', short: 'DBA', primaryStage: 'dev', specialtyStages: ['dev', 'deploy'], color: '#facc15' },
  po: { id: 'po', name: 'Product Owner', short: 'PO', primaryStage: 'uat', specialtyStages: ['analysis', 'uat'], color: '#f59e0b' },
};

export const SENIORITY_META: Record<Seniority, { label: string; mult: number; next?: Seniority }> = {
  junior: { label: 'Júnior', mult: 0.8, next: 'pleno' },
  pleno: { label: 'Pleno', mult: 1, next: 'senior' },
  senior: { label: 'Sênior', mult: 1.15, next: 'especialista' },
  especialista: { label: 'Especialista', mult: 1.25 },
};

export const SKILL_LABEL: Record<SkillKey, string> = {
  analysis: 'Análise',
  frontend: 'Frontend',
  backend: 'Backend',
  testing: 'Testes',
  devops: 'DevOps',
  ux: 'UX',
  architecture: 'Arquitetura',
  data: 'Dados',
};

export const PERSONALITY_TRAITS: Record<string, { label: string; description: string }> = {
  mentor: { label: 'Mentor', description: '+3 moral diária para colegas no mesmo estágio' },
  resiliente: { label: 'Resiliente', description: 'Acumula 40% menos estresse' },
  perfeccionista: { label: 'Perfeccionista', description: '-25% defeitos, -8% velocidade' },
  apressado: { label: 'Apressado', description: '+10% velocidade, +25% defeitos' },
  generalista: { label: 'Generalista', description: 'Penalidade reduzida fora da especialidade' },
  bombeiro: { label: 'Bombeiro', description: '+35% em bugs e incidentes' },
  comunicativo: { label: 'Comunicativo', description: 'Resolve bloqueios 1 dia mais rápido no estágio' },
  noturno: { label: 'Coruja', description: 'Hora extra custa menos energia' },
};

/** 30 profissionais de demonstração — valores base (sofrem variação procedural por partida) */
export const PROFESSIONALS: ProfessionalTemplate[] = [
  { id: 'p01', name: 'Lucas Mendes', role: 'backend', seniority: 'senior', skills: { backend: 5, frontend: 2, architecture: 3, testing: 2, data: 3 }, speed: 82, quality: 91, experience: 75, salary: 9500, traits: ['mentor'] },
  { id: 'p02', name: 'Ana Ribeiro', role: 'frontend', seniority: 'pleno', skills: { frontend: 5, ux: 3, backend: 2, testing: 2 }, speed: 78, quality: 84, experience: 60, salary: 8200 },
  { id: 'p03', name: 'Mariana Costa', role: 'qa', seniority: 'senior', skills: { testing: 5, analysis: 3, backend: 1, devops: 2 }, speed: 78, quality: 95, experience: 80, salary: 12000, traits: ['perfeccionista'] },
  { id: 'p04', name: 'Rafael Souza', role: 'fullstack', seniority: 'pleno', skills: { frontend: 4, backend: 4, testing: 2, devops: 2 }, speed: 80, quality: 76, experience: 55, salary: 9000, traits: ['generalista'] },
  { id: 'p05', name: 'Juliana Alves', role: 'analyst', seniority: 'senior', skills: { analysis: 5, ux: 2, testing: 3 }, speed: 74, quality: 88, experience: 78, salary: 9800, traits: ['comunicativo'] },
  { id: 'p06', name: 'Bruno Carvalho', role: 'devops', seniority: 'senior', skills: { devops: 5, backend: 3, architecture: 3, data: 2 }, speed: 85, quality: 86, experience: 82, salary: 13500, traits: ['bombeiro'] },
  { id: 'p07', name: 'Camila Rocha', role: 'ux', seniority: 'pleno', skills: { ux: 5, frontend: 3, analysis: 3 }, speed: 76, quality: 87, experience: 58, salary: 8600 },
  { id: 'p08', name: 'Diego Martins', role: 'architect', seniority: 'especialista', skills: { architecture: 5, backend: 5, devops: 3, data: 3, frontend: 2 }, speed: 72, quality: 96, experience: 94, salary: 18500, traits: ['mentor', 'perfeccionista'] },
  { id: 'p09', name: 'Fernanda Lima', role: 'dba', seniority: 'senior', skills: { data: 5, backend: 3, devops: 2, architecture: 2 }, speed: 70, quality: 92, experience: 81, salary: 12800 },
  { id: 'p10', name: 'Gustavo Pereira', role: 'po', seniority: 'senior', skills: { analysis: 4, ux: 2, testing: 2 }, speed: 70, quality: 82, experience: 77, salary: 14000, traits: ['comunicativo'] },
  { id: 'p11', name: 'Beatriz Nunes', role: 'backend', seniority: 'junior', skills: { backend: 3, frontend: 1, testing: 2, data: 1 }, speed: 66, quality: 64, experience: 22, salary: 4800 },
  { id: 'p12', name: 'Thiago Barbosa', role: 'frontend', seniority: 'junior', skills: { frontend: 3, ux: 2, backend: 1 }, speed: 70, quality: 60, experience: 20, salary: 4500, traits: ['apressado'] },
  { id: 'p13', name: 'Larissa Gomes', role: 'qa', seniority: 'pleno', skills: { testing: 4, analysis: 2, frontend: 1 }, speed: 75, quality: 84, experience: 50, salary: 7600 },
  { id: 'p14', name: 'Pedro Henrique Dias', role: 'fullstack', seniority: 'senior', skills: { frontend: 4, backend: 5, architecture: 3, devops: 3, testing: 3 }, speed: 86, quality: 83, experience: 79, salary: 13000, traits: ['bombeiro'] },
  { id: 'p15', name: 'Isabela Freitas', role: 'analyst', seniority: 'pleno', skills: { analysis: 4, ux: 3, testing: 2 }, speed: 77, quality: 80, experience: 48, salary: 7400 },
  { id: 'p16', name: 'Rodrigo Teixeira', role: 'backend', seniority: 'pleno', skills: { backend: 4, data: 3, devops: 2, testing: 2 }, speed: 79, quality: 78, experience: 57, salary: 8400, traits: ['noturno'] },
  { id: 'p17', name: 'Patrícia Moreira', role: 'qa', seniority: 'especialista', skills: { testing: 5, devops: 3, backend: 3, analysis: 3 }, speed: 83, quality: 97, experience: 90, salary: 15500, traits: ['mentor'] },
  { id: 'p18', name: 'Vinícius Araújo', role: 'devops', seniority: 'pleno', skills: { devops: 4, backend: 2, data: 2 }, speed: 78, quality: 79, experience: 52, salary: 9400 },
  { id: 'p19', name: 'Letícia Cardoso', role: 'frontend', seniority: 'senior', skills: { frontend: 5, ux: 4, testing: 3, backend: 2 }, speed: 84, quality: 90, experience: 76, salary: 11800, traits: ['perfeccionista'] },
  { id: 'p20', name: 'André Castro', role: 'architect', seniority: 'senior', skills: { architecture: 5, backend: 4, frontend: 3, devops: 3 }, speed: 75, quality: 90, experience: 85, salary: 16000 },
  { id: 'p21', name: 'Gabriela Pinto', role: 'ux', seniority: 'senior', skills: { ux: 5, analysis: 4, frontend: 3 }, speed: 79, quality: 92, experience: 74, salary: 11200, traits: ['comunicativo'] },
  { id: 'p22', name: 'Felipe Correia', role: 'fullstack', seniority: 'junior', skills: { frontend: 3, backend: 3, testing: 1 }, speed: 72, quality: 62, experience: 25, salary: 5200, traits: ['apressado', 'generalista'] },
  { id: 'p23', name: 'Renata Azevedo', role: 'analyst', seniority: 'junior', skills: { analysis: 3, testing: 2, ux: 1 }, speed: 68, quality: 70, experience: 18, salary: 4600 },
  { id: 'p24', name: 'Eduardo Ramos', role: 'backend', seniority: 'especialista', skills: { backend: 5, data: 4, architecture: 4, devops: 3, testing: 3 }, speed: 88, quality: 93, experience: 92, salary: 17500, traits: ['resiliente'] },
  { id: 'p25', name: 'Aline Monteiro', role: 'dba', seniority: 'pleno', skills: { data: 4, backend: 2, devops: 1 }, speed: 72, quality: 85, experience: 55, salary: 9200 },
  { id: 'p26', name: 'Marcelo Vieira', role: 'devops', seniority: 'junior', skills: { devops: 3, backend: 1, testing: 1 }, speed: 71, quality: 66, experience: 24, salary: 5600, traits: ['noturno'] },
  { id: 'p27', name: 'Carolina Batista', role: 'po', seniority: 'pleno', skills: { analysis: 4, ux: 3, testing: 1 }, speed: 74, quality: 78, experience: 54, salary: 10500 },
  { id: 'p28', name: 'Henrique Lopes', role: 'qa', seniority: 'junior', skills: { testing: 3, analysis: 1, frontend: 1 }, speed: 69, quality: 71, experience: 21, salary: 4400, traits: ['resiliente'] },
  { id: 'p29', name: 'Natália Fernandes', role: 'fullstack', seniority: 'especialista', skills: { frontend: 5, backend: 5, devops: 4, architecture: 4, testing: 3, ux: 2 }, speed: 90, quality: 89, experience: 91, salary: 17000, traits: ['bombeiro', 'resiliente'] },
  { id: 'p30', name: 'Otávio Nascimento', role: 'frontend', seniority: 'pleno', skills: { frontend: 4, ux: 2, testing: 2, backend: 1 }, speed: 81, quality: 75, experience: 50, salary: 7900, traits: ['noturno'] },
];

/** Nomes extras para candidatos procedurais do mercado de talentos */
export const FIRST_NAMES = ['Sofia', 'Miguel', 'Helena', 'Arthur', 'Alice', 'Heitor', 'Laura', 'Davi', 'Manuela', 'Bernardo', 'Valentina', 'Samuel', 'Lívia', 'Enzo', 'Clara', 'Joaquim', 'Cecília', 'Matheus', 'Yasmin', 'Caio', 'Débora', 'Igor', 'Priscila', 'Leonardo', 'Tatiane', 'Wagner', 'Bianca', 'Sérgio', 'Elaine', 'Kaique'];
export const LAST_NAMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Almeida', 'Machado', 'Cavalcanti', 'Tavares', 'Moura', 'Duarte', 'Campos', 'Rezende', 'Macedo', 'Farias', 'Brandão', 'Guimarães', 'Siqueira', 'Pacheco'];

export const ROLE_SKILL_PROFILE: Record<RoleId, Partial<Record<SkillKey, number>>> = {
  analyst: { analysis: 4, ux: 2, testing: 2 },
  frontend: { frontend: 4, ux: 2, backend: 1, testing: 2 },
  backend: { backend: 4, data: 2, frontend: 1, testing: 2 },
  fullstack: { frontend: 4, backend: 4, testing: 2, devops: 1 },
  qa: { testing: 4, analysis: 2, devops: 1 },
  devops: { devops: 4, backend: 2, data: 1 },
  ux: { ux: 4, frontend: 2, analysis: 3 },
  architect: { architecture: 5, backend: 4, devops: 2, frontend: 2 },
  dba: { data: 4, backend: 2, devops: 1 },
  po: { analysis: 4, ux: 2, testing: 1 },
};

export const BASE_SALARY: Record<RoleId, number> = {
  analyst: 7500, frontend: 8000, backend: 8500, fullstack: 9500, qa: 7500, devops: 10000, ux: 8200, architect: 15000, dba: 10000, po: 11000,
};
