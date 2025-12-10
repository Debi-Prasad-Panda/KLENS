import { KpiGrid } from './KpiGrid';
import { EfficiencyChart } from './EfficiencyChart';
import { RiskPulse } from './RiskPulse';
import { LiveAnomalyFeed } from './LiveAnomalyFeed';
import { getMissionControlData } from '../shared/MockDataGenerator';
import { Activity, Zap } from 'lucide-react';

interface MissionControlProps {
  data?: ReturnType<typeof getMissionControlData>;
  onNavigateToRisks?: (timeFilter?: string) => void;
}

export function MissionControl({ data, onNavigateToRisks }: MissionControlProps) {
  // Use mock data if no real data provided
  const controlData = data ?? getMissionControlData();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-cyan">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Mission Control</h2>
            <p className="text-sm text-muted-foreground">
              Industrial Intelligence Dashboard • Real-time Monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 glass-card">
            <Zap className="w-4 h-4 text-success" />
            <span className="text-sm font-mono">
              System Status: <span className="text-success font-semibold">Operational</span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary">LIVE</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <KpiGrid data={controlData.kpis} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Efficiency Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <EfficiencyChart data={controlData.efficiency} />
        </div>
        
        {/* Live Anomaly Feed */}
        <LiveAnomalyFeed 
          data={controlData.anomalies}
          onViewAnomaly={(anomaly) => {
            console.log('View anomaly:', anomaly);
            // Could navigate to details or open modal
          }}
        />
      </div>

      {/* Risk Pulse - Full Width */}
      <RiskPulse 
        data={controlData.riskPulse}
        onIncidentClick={(time) => {
          console.log('Navigate to risk at:', time);
          onNavigateToRisks?.(time);
        }}
      />

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat 
          label="Processing Speed" 
          value="4.2 docs/min" 
          trend="+12%" 
          positive 
        />
        <QuickStat 
          label="Uptime Today" 
          value="99.97%" 
          trend="Excellent" 
          positive 
        />
        <QuickStat 
          label="Pending Reviews" 
          value="7 documents" 
          trend="-3 from yesterday" 
          positive 
        />
        <QuickStat 
          label="Next Audit" 
          value="36 days" 
          trend="On track" 
          positive 
        />
      </div>
    </div>
  );
}

// Quick stat component for footer
function QuickStat({ 
  label, 
  value, 
  trend, 
  positive 
}: { 
  label: string; 
  value: string; 
  trend: string; 
  positive: boolean;
}) {
  return (
    <div className="glass-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-mono font-semibold text-foreground mt-1">{value}</p>
      <p className={`text-xs mt-1 ${positive ? 'text-success' : 'text-destructive'}`}>
        {trend}
      </p>
    </div>
  );
}
