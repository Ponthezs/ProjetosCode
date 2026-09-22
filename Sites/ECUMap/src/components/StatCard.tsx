import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'blue' | 'green' | 'red' | 'amber';
  hint?: string;
}

const accentMap = {
  blue: { text: 'text-electric-2', bg: 'bg-electric-2/10', ring: 'ring-electric-2/20' },
  green: { text: 'text-perf-green', bg: 'bg-perf-green/10', ring: 'ring-perf-green/20' },
  red: { text: 'text-alert-red', bg: 'bg-alert-red/10', ring: 'ring-alert-red/20' },
  amber: { text: 'text-amber', bg: 'bg-amber/10', ring: 'ring-amber/20' },
};

export function StatCard({ label, value, icon: Icon, accent = 'blue', hint }: StatCardProps) {
  const a = accentMap[accent];
  return (
    <div className="glass glass-hover animate-fade-up rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-base-300 font-mono-tech">{label}</span>
        <div className={clsx('h-9 w-9 rounded-xl flex items-center justify-center ring-1', a.bg, a.ring)}>
          <Icon className={clsx('h-4.5 w-4.5', a.text)} size={18} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="font-display text-3xl font-bold text-base-100">{value}</span>
        {hint && <span className="text-[11px] text-base-400">{hint}</span>}
      </div>
    </div>
  );
}
