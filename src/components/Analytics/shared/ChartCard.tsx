import { ReactNode } from 'react';
import { Download } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  onExport?: () => void;
  exportLabel?: string;
  headerAction?: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className = '',
  onExport,
  exportLabel = 'Export',
  headerAction,
}: ChartCardProps) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {headerAction}
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {exportLabel}
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      {children}
    </div>
  );
}
