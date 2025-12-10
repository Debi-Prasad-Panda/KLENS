import { 
  Shield, 
  Clock, 
  AlertTriangle, 
  Database,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { getMissionControlData, formatNumber, formatCurrency } from '../shared/MockDataGenerator';

interface KpiGridProps {
  data?: {
    safetyScore: number;
    safetyTrend: 'up' | 'down' | 'stable';
    manHoursSaved: number;
    dollarsSaved: number;
    activeAlerts: number;
    criticalAlerts: number;
    documentsIndexed: number;
    documentsProcessed: number;
  };
}

export function KpiGrid({ data }: KpiGridProps) {
  // Use mock data if no real data provided
  const kpiData = data ?? getMissionControlData().kpis;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const kpis = [
    {
      id: 'safety',
      label: 'Safety Heartbeat',
      value: `${kpiData.safetyScore}%`,
      sublabel: 'Compliance Risk Score',
      icon: Shield,
      trend: kpiData.safetyTrend,
      trendValue: kpiData.safetyTrend === 'up' ? '+1.2%' : kpiData.safetyTrend === 'down' ? '-0.8%' : '0%',
      colorClass: kpiData.safetyScore >= 95 ? 'text-success' : kpiData.safetyScore >= 80 ? 'text-warning' : 'text-destructive',
      bgClass: kpiData.safetyScore >= 95 ? 'bg-success/20' : kpiData.safetyScore >= 80 ? 'bg-warning/20' : 'bg-destructive/20',
      glowClass: kpiData.safetyScore >= 95 ? 'glow-emerald' : '',
    },
    {
      id: 'roi',
      label: 'ROI Counter',
      value: `${formatNumber(kpiData.manHoursSaved)} hrs`,
      sublabel: `≈ ${formatCurrency(kpiData.dollarsSaved)} saved`,
      icon: Clock,
      trend: 'up' as const,
      trendValue: '+240 hrs',
      colorClass: 'text-primary',
      bgClass: 'bg-primary/20',
      glowClass: 'glow-cyan',
    },
    {
      id: 'alerts',
      label: 'Active Alerts',
      value: kpiData.activeAlerts.toString(),
      sublabel: `${kpiData.criticalAlerts} critical`,
      icon: AlertTriangle,
      trend: kpiData.criticalAlerts > 0 ? 'up' as const : 'stable' as const,
      trendValue: kpiData.criticalAlerts > 0 ? 'Action needed' : 'All clear',
      colorClass: kpiData.criticalAlerts > 0 ? 'text-destructive' : 'text-warning',
      bgClass: kpiData.criticalAlerts > 0 ? 'bg-destructive/20' : 'bg-warning/20',
      glowClass: kpiData.criticalAlerts > 0 ? 'glow-rose animate-pulse' : '',
    },
    {
      id: 'knowledge',
      label: 'Knowledge Base',
      value: formatNumber(kpiData.documentsIndexed),
      sublabel: `${formatNumber(kpiData.documentsProcessed)} processed`,
      icon: Database,
      trend: 'up' as const,
      trendValue: '+127 docs',
      colorClass: 'text-primary',
      bgClass: 'bg-primary/20',
      glowClass: '',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <div
          key={kpi.id}
          className={`stat-card ${kpi.glowClass}`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bgClass}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.colorClass}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-mono ${
                kpi.trend === 'up' ? 'text-success' : 
                kpi.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {getTrendIcon(kpi.trend)}
                <span>{kpi.trendValue}</span>
              </div>
            </div>

            {/* Value */}
            <p className={`text-3xl font-bold font-mono ${kpi.colorClass}`}>
              {kpi.value}
            </p>
            
            {/* Labels */}
            <p className="text-sm font-medium text-foreground mt-1">{kpi.label}</p>
            <p className="text-xs text-muted-foreground">{kpi.sublabel}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
