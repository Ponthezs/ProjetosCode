import clsx from 'clsx';
import type { ReactNode } from 'react';

export function GlassCard({
  children, className, title, icon, action,
}: { children: ReactNode; className?: string; title?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className={clsx('glass rounded-2xl p-5', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            {title && <h3 className="font-display text-sm tracking-wider text-base-200 uppercase">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
