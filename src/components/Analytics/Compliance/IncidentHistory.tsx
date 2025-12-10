import { ChartCard } from '../shared/ChartCard';
import { getComplianceAnalyticsData } from '../shared/MockDataGenerator';
import { AlertTriangle, AlertCircle, Info, CheckCircle, FileText, ArrowRight } from 'lucide-react';

interface IncidentHistoryProps {
  data?: ReturnType<typeof getComplianceAnalyticsData>['incidents'];
  onViewIncident?: (incident: any) => void;
}

export function IncidentHistory({ data, onViewIncident }: IncidentHistoryProps) {
  const incidentData = data ?? getComplianceAnalyticsData().incidents;

  // Group by month for timeline
  const groupedByDate = incidentData.reduce((acc, incident) => {
    const date = new Date(incident.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(incident);
    return acc;
  }, {} as Record<string, typeof incidentData>);

  const getSeverityConfig = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return { 
          icon: AlertTriangle, 
          bgClass: 'bg-destructive/20', 
          textClass: 'text-destructive',
          borderClass: 'border-l-destructive',
          label: 'HIGH'
        };
      case 'medium':
        return { 
          icon: AlertCircle, 
          bgClass: 'bg-warning/20', 
          textClass: 'text-warning',
          borderClass: 'border-l-warning',
          label: 'MEDIUM'
        };
      default:
        return { 
          icon: Info, 
          bgClass: 'bg-primary/20', 
          textClass: 'text-primary',
          borderClass: 'border-l-primary',
          label: 'LOW'
        };
    }
  };

  // Calculate stats
  const totalIncidents = incidentData.length;
  const resolvedCount = incidentData.filter(i => i.resolved).length;
  const highSeverity = incidentData.filter(i => i.severity === 'high').length;

  return (
    <ChartCard
      title="Incident History"
      subtitle="Safety incidents linked to document versions"
      headerAction={
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            {resolvedCount}/{totalIncidents} resolved
          </span>
          {highSeverity > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-destructive/20 text-destructive rounded-full">
              {highSeverity} high severity
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-1">
        {Object.entries(groupedByDate).map(([date, incidents]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase">{date}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            
            {/* Incidents */}
            <div className="space-y-2 ml-4">
              {incidents.map((incident, index) => {
                const config = getSeverityConfig(incident.severity);
                const Icon = config.icon;
                
                return (
                  <div 
                    key={incident.id}
                    onClick={() => onViewIncident?.(incident)}
                    className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${config.borderClass} bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bgClass}`}>
                      <Icon className={`w-4 h-4 ${config.textClass}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${config.bgClass} ${config.textClass}`}>
                          {config.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">{incident.id}</span>
                        {incident.resolved && (
                          <CheckCircle className="w-3 h-3 text-success" />
                        )}
                      </div>
                      <p className="text-sm text-foreground">{incident.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <FileText className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Linked to: {incident.documentVersion}
                        </span>
                      </div>
                    </div>
                    
                    {/* Date & Action */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{incident.date}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-mono font-bold text-foreground">{totalIncidents}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Resolved</p>
            <p className="text-lg font-mono font-bold text-success">{resolvedCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">High Severity</p>
            <p className="text-lg font-mono font-bold text-destructive">{highSeverity}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Resolution Rate</p>
            <p className="text-lg font-mono font-bold text-primary">
              {totalIncidents > 0 ? ((resolvedCount / totalIncidents) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
