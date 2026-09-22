import clsx from 'clsx';
import type { ProjectStatus, Stage } from '../types';

const statusColors: Record<ProjectStatus, string> = {
  'Novo': 'text-base-300 border-base-500',
  'Arquivo recebido': 'text-electric-2 border-electric-2/60',
  'Em análise': 'text-amber border-amber/60',
  'Mapeamento': 'text-electric border-electric/60',
  'Validação': 'text-amber border-amber/60',
  'Pronto': 'text-perf-green border-perf-green/60',
  'Finalizado': 'text-perf-green border-perf-green/60',
};

const stageColors: Record<Stage, string> = {
  'Original / Stock': 'text-base-300 border-base-500',
  'Stage 1': 'text-electric-2 border-electric-2/60',
  'Stage 2': 'text-amber border-amber/60',
  'Stage 3': 'text-alert-red border-alert-red/60',
  'Eco': 'text-perf-green border-perf-green/60',
  'Performance': 'text-electric border-electric/60',
  'Custom': 'text-alert-red border-alert-red/60',
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={clsx('stage-badge', statusColors[status])}>{status.toUpperCase()}</span>;
}

export function StageBadge({ stage }: { stage: Stage }) {
  return <span className={clsx('stage-badge', stageColors[stage])}>{stage.toUpperCase()}</span>;
}
