import { AlertTriangle, AlertCircle, Info, ArrowRight, Clock } from 'lucide-react';
import { ChartCard } from '../shared/ChartCard';
import { getMissionControlData, formatTimeAgo } from '../shared/MockDataGenerator';

interface Anomaly {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  location: string;
  timestamp: string;
}

interface LiveAnomalyFeedProps {
  data?: Anomaly[];
  onViewAnomaly?: (anomaly: Anomaly) => void;
  maxItems?: number;
}

export function LiveAnomalyFeed({ data, onViewAnomaly, maxItems = 5 }: LiveAnomalyFeedProps) {
  // Use mock data if no real data provided
  const anomalies = (data ?? getMissionControlData().anomalies).slice(0, maxItems);

  const getTypeConfig = (type: Anomaly['type']) => {
    switch (type) {
      case 'critical':
        return {
          icon: AlertTriangle,
          bgClass: 'bg-destructive/20',
          textClass: 'text-destructive',
          borderClass: 'border-l-destructive',
          label: 'CRITICAL',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgClass: 'bg-warning/20',
          textClass: 'text-warning',
          borderClass: 'border-l-warning',
          label: 'WARNING',
        };
      default:
        return {
          icon: Info,
          bgClass: 'bg-primary/20',
          textClass: 'text-primary',
          borderClass: 'border-l-primary',
          label: 'INFO',
        };
    }
  };

  const criticalCount = anomalies.filter(a => a.type === 'critical').length;
  const warningCount = anomalies.filter(a => a.type === 'warning').length;

  return (
    <ChartCard
      title="Live Anomaly Feed"
      subtitle={`${criticalCount} critical, ${warningCount} warnings`}
      headerAction={
        criticalCount > 0 && (
          <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold bg-destructive/20 text-destructive rounded-full animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Action Required
          </span>
        )
      }
    >
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
        {anomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-3">
              <Info className="w-6 h-6 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">All systems operating normally</p>
            <p className="text-xs text-muted-foreground mt-1">No anomalies detected</p>
          </div>
        ) : (
          anomalies.map((anomaly, index) => {
            const config = getTypeConfig(anomaly.type);
            const Icon = config.icon;
            
            return (
              <div
                key={anomaly.id}
                className={`glass-card p-4 border-l-4 ${config.borderClass} hover:bg-secondary/30 transition-colors cursor-pointer group`}
                onClick={() => onViewAnomaly?.(anomaly)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bgClass}`}>
                    <Icon className={`w-5 h-5 ${config.textClass}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${config.bgClass} ${config.textClass}`}>
                        {config.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">{anomaly.id}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {anomaly.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      📍 {anomaly.location}
                    </p>
                  </div>
                  
                  {/* Time & Action */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(anomaly.timestamp)}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* View All Link */}
      {anomalies.length > 0 && (
        <button className="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1 border border-border rounded-lg hover:bg-primary/5">
          View All Anomalies
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </ChartCard>
  );
}
