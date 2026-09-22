import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity, BookOpen, Briefcase, ChartNoAxesCombined, Circle, Clock, Cloud, Construction, Dices, Eye, Flag, FlaskConical, Flame, GitBranch,
  GitPullRequest, GraduationCap, Hammer, HeartHandshake, HeartPulse, Hospital, Infinity as InfinityIcon, ListChecks, Map as MapIcon, Network, Rocket,
  Search, Server, ShoppingCart, Sparkles, Star, Swords, Target, Users, Wallet, Workflow, X, Zap, type LucideIcon,
} from 'lucide-react';
import { useEffect, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { cx, initials } from '../../utils/format';

/* ------------------------------------------------------------ Icon */
/** Ícones referenciados por nome nos arquivos de configuração (import seletivo mantém o bundle leve) */
const ICONS: Record<string, LucideIcon> = {
  Activity, BookOpen, Briefcase, ChartNoAxesCombined, Circle, Clock, Cloud, Construction, Dices, Eye, Flag, FlaskConical, Flame, GitBranch,
  GitPullRequest, GraduationCap, Hammer, HeartHandshake, HeartPulse, Hospital, Infinity: InfinityIcon, ListChecks, Map: MapIcon, Network, Rocket,
  Search, Server, ShoppingCart, Sparkles, Star, Swords, Target, Users, Wallet, Workflow, Zap,
};

export function Icon({ name, size = 16, className, style, strokeWidth = 1.9 }: { name: string; size?: number; className?: string; style?: CSSProperties; strokeWidth?: number }) {
  const C = ICONS[name] ?? Circle;
  return <C size={size} className={className} style={style} strokeWidth={strokeWidth} />;
}

/* ------------------------------------------------------------ Button */
type Variant = 'primary' | 'ghost' | 'outline' | 'danger' | 'success' | 'soft';
export function Button({ variant = 'outline', size = 'md', className, children, icon, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg'; icon?: ReactNode }) {
  const v: Record<Variant, string> = {
    primary: 'text-white bg-gradient-to-b from-[#8a90ff] to-[#5b5ff0] shadow-[0_8px_24px_-8px_rgba(91,95,240,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-110 border border-white/10',
    ghost: 'text-muted hover:text-fg hover:bg-surface-2 border border-transparent',
    outline: 'text-fg bg-surface hover:bg-surface-2 border border-line hover:border-line-strong',
    soft: 'text-accent bg-accent/10 hover:bg-accent/15 border border-accent/20',
    danger: 'text-white bg-gradient-to-b from-red-500 to-red-600 hover:brightness-110 border border-white/10 shadow-[0_8px_24px_-10px_rgba(239,68,68,0.7)]',
    success: 'text-white bg-gradient-to-b from-emerald-500 to-emerald-600 hover:brightness-110 border border-white/10 shadow-[0_8px_24px_-10px_rgba(16,185,129,0.7)]',
  };
  const s = { sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-lg', md: 'h-9 px-3.5 text-sm gap-2 rounded-xl', lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-2xl' }[size];
  return (
    <button {...rest} className={cx('focus-ring inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none select-none whitespace-nowrap', v[variant], s, className)}>
      {icon}
      {children}
    </button>
  );
}

export function IconButton({ className, children, active, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button {...rest} className={cx('focus-ring inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95', active ? 'border-accent/40 bg-accent/15 text-accent' : 'border-line bg-surface text-muted hover:text-fg hover:bg-surface-2', className)}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------ Panel */
export function Panel({ className, children, title, icon, right, pad = true, style }: { className?: string; children: ReactNode; title?: ReactNode; icon?: ReactNode; right?: ReactNode; pad?: boolean; style?: CSSProperties }) {
  return (
    <section className={cx('glass rounded-2xl', className)} style={style}>
      {title && (
        <header className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {icon}
            {title}
          </div>
          {right}
        </header>
      )}
      <div className={cx(pad && 'px-4 pb-4', !title && pad && 'pt-4')}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------ Badge */
export function Badge({ children, color, className, solid }: { children: ReactNode; color?: string; className?: string; solid?: boolean }) {
  const style: CSSProperties = color
    ? solid
      ? { background: color, color: '#0b0e17', borderColor: color }
      : { color, background: `color-mix(in oklab, ${color} 14%, transparent)`, borderColor: `color-mix(in oklab, ${color} 30%, transparent)` }
    : {};
  return (
    <span style={style} className={cx('inline-flex items-center gap-1 rounded-md border px-1.5 py-[1px] text-[10px] font-semibold uppercase tracking-wider leading-4', !color && 'border-line bg-surface-2 text-muted', className)}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------ Progress */
export function Progress({ value, color = 'var(--accent)', className, height = 6, glow, striped }: { value: number; color?: string; className?: string; height?: number; glow?: boolean; striped?: boolean }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={cx('relative w-full overflow-hidden rounded-full bg-surface-3', className)} style={{ height }}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        initial={false}
        animate={{ width: `${v * 100}%` }}
        transition={{ type: 'spring', stiffness: 90, damping: 20 }}
        style={{ background: `linear-gradient(90deg, color-mix(in oklab, ${color} 70%, transparent), ${color})`, boxShadow: glow ? `0 0 12px ${color}` : undefined }}
      />
      {striped && <div className="shimmer absolute inset-0 opacity-50" />}
    </div>
  );
}

/* ------------------------------------------------------------ Stars */
export function Stars({ value, max = 5, size = 11 }: { value: number; max?: number; size?: number }) {
  return (
    <span className="inline-flex gap-[2px]" aria-label={`${value} de ${max}`}>
      {Array.from({ length: max }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute text-faint/50" strokeWidth={1.5} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="text-amber-400" fill="currentColor" strokeWidth={1.5} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/* ------------------------------------------------------------ Tooltip */
export function Tip({ children, content, side = 'top', className }: { children: ReactNode; content: ReactNode; side?: 'top' | 'bottom' | 'right' | 'left'; className?: string }) {
  const pos = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  }[side];
  return (
    <span className={cx('group/tip relative inline-flex', className)}>
      {children}
      <span role="tooltip" className={cx('pointer-events-none absolute z-[80] w-max max-w-[260px] rounded-xl glass-strong px-3 py-2 text-left text-xs font-normal normal-case tracking-normal text-fg opacity-0 transition-all duration-150 group-hover/tip:opacity-100 group-hover/tip:delay-200', pos)}>
        {content}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------ Modal */
export function Modal({ open, onClose, children, width = 560, className, closable = true, tone }: { open: boolean; onClose?: () => void; children: ReactNode; width?: number; className?: string; closable?: boolean; tone?: 'critical' | 'warning' | 'positive' | 'info' }) {
  useEffect(() => {
    if (!open || !closable) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, closable, onClose]);
  const ring = tone === 'critical' ? 'pulse-red' : '';
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px]" onClick={() => closable && onClose?.()} />
          <motion.div
            role="dialog"
            aria-modal
            className={cx('glass-strong relative max-h-[92vh] w-full overflow-y-auto scroll-thin rounded-t-3xl sm:rounded-3xl', ring, className)}
            style={{ maxWidth: width }}
            initial={{ y: 30, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          >
            {closable && onClose && (
              <button onClick={onClose} className="focus-ring absolute right-4 top-4 z-10 rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Fechar">
                <X size={18} />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------ Segmented */
export function Segmented<T extends string>({ value, options, onChange, size = 'md' }: { value: T; options: { value: T; label: ReactNode; title?: string }[]; onChange: (v: T) => void; size?: 'sm' | 'md' }) {
  return (
    <div className="inline-flex rounded-xl border border-line bg-surface p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={cx('focus-ring relative rounded-[10px] font-medium transition-colors', size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm', value === o.value ? 'text-fg' : 'text-muted hover:text-fg')}
        >
          {value === o.value && <motion.span layoutId={`seg-${options.map((x) => x.value).join('')}`} className="absolute inset-0 rounded-[10px] bg-surface-3 border border-line-strong" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ Switch */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode }) {
  return (
    <button onClick={() => onChange(!checked)} className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm text-muted hover:text-fg" role="switch" aria-checked={checked}>
      <span className={cx('relative h-5 w-9 rounded-full border transition-colors', checked ? 'bg-accent border-accent' : 'bg-surface-3 border-line-strong')}>
        <motion.span className="absolute top-[2px] h-3.5 w-3.5 rounded-full bg-white shadow" animate={{ left: checked ? 18 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
      </span>
      {label}
    </button>
  );
}

/* ------------------------------------------------------------ Avatar */
export function Avatar({ name, hue, size = 28, ring, absent, className, title }: { name: string; hue: number; size?: number; ring?: string; absent?: boolean; className?: string; title?: string }) {
  return (
    <span
      title={title ?? name}
      className={cx('relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none', absent && 'grayscale opacity-50', className)}
      style={{
        width: size, height: size, fontSize: Math.max(9, size * 0.38),
        background: `linear-gradient(140deg, hsl(${hue} 75% 62%), hsl(${(hue + 40) % 360} 70% 42%))`,
        boxShadow: ring ? `0 0 0 2px var(--bg), 0 0 0 3.5px ${ring}` : 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 6px -2px rgba(0,0,0,0.5)',
      }}
    >
      {initials(name)}
    </span>
  );
}

/* ------------------------------------------------------------ Kpi */
export function Kpi({ label, value, icon, tone, sub, className }: { label: string; value: ReactNode; icon?: ReactNode; tone?: 'good' | 'warn' | 'bad'; sub?: ReactNode; className?: string }) {
  const color = tone === 'good' ? 'text-good' : tone === 'warn' ? 'text-warn' : tone === 'bad' ? 'text-bad' : 'text-fg';
  return (
    <div className={cx('flex min-w-0 flex-col', className)}>
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        {icon}
        {label}
      </span>
      <span className={cx('num text-[15px] font-semibold leading-6', color)}>{value}</span>
      {sub && <span className="text-[11px] text-faint">{sub}</span>}
    </div>
  );
}

export function Divider({ vertical, className }: { vertical?: boolean; className?: string }) {
  return <span className={cx(vertical ? 'h-8 w-px' : 'h-px w-full', 'bg-line', className)} />;
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cx('text-[11px] font-semibold uppercase tracking-[0.14em] text-muted', className)}>{children}</h3>;
}
