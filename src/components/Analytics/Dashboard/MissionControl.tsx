import { useMemo, useState } from 'react';
import { KpiGrid } from './KpiGrid';
import { EfficiencyChart } from './EfficiencyChart';
import { RiskPulse } from './RiskPulse';
import { LiveAnomalyFeed } from './LiveAnomalyFeed';
import { getMissionControlData } from '../shared/MockDataGenerator';
import { Activity, Zap, Flame, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { DateRange } from '../AnalyticsLayout';

interface MissionControlProps {
  data?: ReturnType<typeof getMissionControlData>;
  onNavigateToRisks?: (timeFilter?: string) => void;
  dateRange?: DateRange;
}

export function MissionControl({ data, onNavigateToRisks, dateRange = '24h' }: MissionControlProps) {
  const controlData = useMemo(() => {
    const base = data ?? getMissionControlData();
    return buildDataForRange(base, dateRange);
  }, [data, dateRange]);
  const rawTelemetry = useMemo(() => buildRawTelemetry(dateRange), [dateRange]);
  const { token } = useAuth();
  const [isSimulating, setIsSimulating] = useState(false);

  const rangeLabel = DATE_RANGE_LABELS[dateRange] ?? 'Custom';

  // 🔥 DEMO: Simulate a critical meltdown alert
  const simulateMeltdown = async () => {
    if (!token) {
      toast.error('Please login to simulate meltdown');
      return;
    }

    setIsSimulating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/notifications/simulate-meltdown`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            severity: 'CRITICAL',
            message: 'Boiler B7 pressure exceeds 500 PSI. Immediate action required!'
          }),
        }
      );

      if (response.ok) {
        // Toast will be triggered by the real-time notification
        console.log('🔥 Meltdown simulation triggered!');
      } else {
        const error = await response.json();
        toast.error('Simulation failed', { description: error.detail || 'Try again' });
      }
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Network error', { description: 'Could not reach server' });
    } finally {
      setIsSimulating(false);
    }
  };

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
          {/* 🔥 DEMO: Simulate Meltdown Button */}
          <button
            onClick={simulateMeltdown}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-destructive/20 to-warning/20 text-destructive border border-destructive/30 rounded-xl hover:from-destructive/30 hover:to-warning/30 transition-all font-medium text-sm disabled:opacity-50"
            title="Demo: Simulate a critical alert"
          >
            {isSimulating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Flame className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Simulate Meltdown</span>
          </button>
          
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
          <EfficiencyChart data={controlData.efficiency} rangeLabel={rangeLabel} />
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
        rangeLabel={rangeLabel}
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

      {/* Unfiltered Raw Data */}
      <div className="glass-card p-4 border border-warning/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Raw Telemetry (Unfiltered)</h3>
          <span className="text-xs text-warning">Noisy feed • {rangeLabel}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs font-mono">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border/60">
                <th className="py-2 pr-4">timestamp</th>
                <th className="py-2 pr-4">asset</th>
                <th className="py-2 pr-4">sensor</th>
                <th className="py-2 pr-4">reading</th>
                <th className="py-2 pr-4">unit</th>
                <th className="py-2 pr-4">quality</th>
                <th className="py-2 pr-4">flag</th>
              </tr>
            </thead>
            <tbody>
              {rawTelemetry.map((row, idx) => (
                <tr key={`${row.asset}-${idx}`} className="border-b border-border/30 hover:bg-secondary/20">
                  <td className="py-2 pr-4 whitespace-nowrap">{row.timestamp}</td>
                  <td className="py-2 pr-4">{row.asset}</td>
                  <td className="py-2 pr-4">{row.sensor}</td>
                  <td className="py-2 pr-4">{row.reading}</td>
                  <td className="py-2 pr-4">{row.unit}</td>
                  <td className={`py-2 pr-4 ${row.quality < 70 ? 'text-destructive' : row.quality < 85 ? 'text-warning' : 'text-success'}`}>
                    {row.quality}%
                  </td>
                  <td className={`py-2 pr-4 ${row.flag === 'ALERT' ? 'text-destructive' : row.flag === 'SPIKE' ? 'text-warning' : 'text-muted-foreground'}`}>
                    {row.flag}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days',
  custom: 'Custom',
};

function buildDataForRange(base: ReturnType<typeof getMissionControlData>, range: DateRange) {
  const hours = getRangeHours(range);
  const scale = Math.max(1, hours / 24);

  const kpis = {
    ...base.kpis,
    manHoursSaved: Math.round(base.kpis.manHoursSaved * scale),
    dollarsSaved: Math.round(base.kpis.dollarsSaved * scale),
    activeAlerts: Math.max(1, Math.round(base.kpis.activeAlerts + Math.log(scale + 1))),
    criticalAlerts: Math.max(1, Math.round(base.kpis.criticalAlerts + (scale > 7 ? 1 : 0))),
    documentsIndexed: Math.round(base.kpis.documentsIndexed + scale * 120),
    documentsProcessed: Math.round(base.kpis.documentsProcessed + scale * 100),
  };

  const efficiency = buildEfficiencySeries(base.efficiency, range);
  const riskPulse = buildRiskSeries(base.riskPulse, range);
  const anomalies = buildAnomalies(base.anomalies, hours);

  return {
    ...base,
    kpis,
    efficiency,
    riskPulse,
    anomalies,
  };
}

function getRangeHours(range: DateRange): number {
  switch (range) {
    case '24h':
      return 24;
    case '7d':
      return 24 * 7;
    case '30d':
      return 24 * 30;
    case '90d':
      return 24 * 90;
    default:
      return 24 * 14;
  }
}

function buildEfficiencySeries(base: Array<{ day: string; manual: number; ai: number }>, range: DateRange) {
  const manualBase = base.reduce((sum, d) => sum + d.manual, 0) / base.length;
  const aiBase = base.reduce((sum, d) => sum + d.ai, 0) / base.length;

  if (range === '7d') return base;

  if (range === '24h') {
    return Array.from({ length: 24 }, (_, i) => {
      const manual = manualBase * (0.9 + 0.2 * Math.sin(i / 3));
      const ai = aiBase * (0.9 + 0.2 * Math.cos(i / 4));
      return {
        day: `${i.toString().padStart(2, '0')}:00`,
        manual: Number(manual.toFixed(2)),
        ai: Number(ai.toFixed(2)),
      };
    });
  }

  if (range === '30d') {
    return Array.from({ length: 30 }, (_, i) => {
      const manual = manualBase * (0.95 + 0.18 * Math.sin(i / 3.5));
      const ai = aiBase * (0.9 + 0.2 * Math.cos(i / 5));
      return {
        day: `D${i + 1}`,
        manual: Number(manual.toFixed(2)),
        ai: Number(ai.toFixed(2)),
      };
    });
  }

  return Array.from({ length: 13 }, (_, i) => {
    const manual = manualBase * 7 * (0.9 + 0.15 * Math.sin(i / 2));
    const ai = aiBase * 7 * (0.9 + 0.15 * Math.cos(i / 2.4));
    return {
      day: `W${i + 1}`,
      manual: Number(manual.toFixed(2)),
      ai: Number(ai.toFixed(2)),
    };
  });
}

function buildRiskSeries(base: Array<{ time: string; score: number; incident?: string }>, range: DateRange) {
  if (range === '24h') return base;

  const length = range === '7d' ? 7 : range === '30d' ? 30 : 13;
  return Array.from({ length }, (_, i) => {
    const score = 93 + 4 * Math.sin(i / 3) + 1.5 * Math.cos(i / 4);
    const point: { time: string; score: number; incident?: string } = {
      time: range === '90d' ? `W${i + 1}` : `D${i + 1}`,
      score: Number(Math.max(80, Math.min(99.8, score)).toFixed(1)),
    };

    if (i > 0 && i % Math.max(3, Math.floor(length / 4)) === 0) {
      point.incident = 'Operational anomaly';
    }

    return point;
  });
}

function buildAnomalies(base: Array<{ id: string; type: 'critical' | 'warning' | 'info'; message: string; location: string; timestamp: string }>, rangeHours: number) {
  const now = Date.now();
  const synthetic = [
    {
      id: 'ANM-210',
      type: 'warning' as const,
      message: 'Cooling line variance trend detected',
      location: 'Plant North - Cooling Grid',
      timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ANM-211',
      type: 'critical' as const,
      message: 'Unexpected pressure oscillation cluster',
      location: 'Boiler B2 - Pressure Network',
      timestamp: new Date(now - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ANM-212',
      type: 'info' as const,
      message: 'Recurring maintenance deferral pattern',
      location: 'Line 3 - Maintenance Queue',
      timestamp: new Date(now - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const cutoff = now - rangeHours * 60 * 60 * 1000;
  return [...base, ...synthetic]
    .filter((item) => new Date(item.timestamp).getTime() >= cutoff)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function buildRawTelemetry(range: DateRange) {
  const rowsByRange: Record<DateRange, number> = {
    '24h': 10,
    '7d': 14,
    '30d': 18,
    '90d': 24,
    custom: 16,
  };

  const assets = ['Boiler-B7', 'Turbine-A2', 'Line-3-Pump', 'Compressor-C2', 'Valve-V19'];
  const sensors = ['pressure', 'temp', 'vibration', 'flow', 'voltage'];
  const units: Record<string, string> = {
    pressure: 'psi',
    temp: 'degC',
    vibration: 'mm/s',
    flow: 'm3/h',
    voltage: 'V',
  };

  return Array.from({ length: rowsByRange[range] }, (_, i) => {
    const sensor = sensors[i % sensors.length];
    const base = sensor === 'pressure' ? 420 : sensor === 'temp' ? 87 : sensor === 'vibration' ? 4.8 : sensor === 'flow' ? 120 : 415;
    const wobble = Math.sin(i * 1.7) * (sensor === 'pressure' ? 30 : sensor === 'temp' ? 8 : 2.5);
    const drift = (i % 4 === 0 ? 1 : -1) * (i * 0.6);
    const reading = Number((base + wobble + drift).toFixed(2));
    const quality = Math.max(51, Math.min(99, Math.round(96 - (i % 6) * 7 + (i % 3) * 2)));
    const flag = quality < 70 ? 'ALERT' : (reading > base * 1.08 || reading < base * 0.92) ? 'SPIKE' : '--';
    const timestamp = new Date(Date.now() - i * 17 * 60000).toISOString().replace('T', ' ').slice(0, 19);

    return {
      timestamp,
      asset: assets[(i + 2) % assets.length],
      sensor,
      reading,
      unit: units[sensor],
      quality,
      flag,
    };
  });
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
