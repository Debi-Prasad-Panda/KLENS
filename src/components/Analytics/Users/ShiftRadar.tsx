import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { ChartCard } from '../shared/ChartCard';
import { getWorkforceAnalyticsData } from '../shared/MockDataGenerator';
import { Sun, Moon } from 'lucide-react';

interface ShiftRadarProps {
  data?: ReturnType<typeof getWorkforceAnalyticsData>['shiftComparison'];
}

export function ShiftRadar({ data }: ShiftRadarProps) {
  const shiftData = data ?? getWorkforceAnalyticsData().shiftComparison;

  // Transform data for radar chart
  const chartData = shiftData.metrics.map((metric, index) => ({
    metric,
    morning: shiftData.morningShift[index],
    night: shiftData.nightShift[index],
  }));

  // Calculate averages
  const morningAvg = shiftData.morningShift.reduce((a, b) => a + b, 0) / shiftData.morningShift.length;
  const nightAvg = shiftData.nightShift.reduce((a, b) => a + b, 0) / shiftData.nightShift.length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const metric = payload[0]?.payload?.metric;
      const morning = payload.find((p: any) => p.dataKey === 'morning')?.value || 0;
      const night = payload.find((p: any) => p.dataKey === 'night')?.value || 0;
      
      return (
        <div className="glass-card p-3 border border-border shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">{metric}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sun className="w-3 h-3 text-warning" />
              <span className="text-xs text-muted-foreground">Morning:</span>
              <span className="text-xs font-mono font-bold text-warning">{morning}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">Night:</span>
              <span className="text-xs font-mono font-bold text-primary">{night}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard
      title="Shift Performance Comparison"
      subtitle="Morning vs Night shift metrics"
      headerAction={
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-warning" />
            <span className="text-xs font-mono text-warning">{morningAvg.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary">{nightAvg.toFixed(0)}%</span>
          </div>
        </div>
      }
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Morning Shift"
              dataKey="morning"
              stroke="hsl(var(--warning))"
              fill="hsl(var(--warning))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Night Shift"
              dataKey="night"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Key Insights</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <p className="text-xs text-warning font-medium">Morning Strength</p>
            <p className="text-[10px] text-muted-foreground">Higher in Compliance & Searches</p>
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <p className="text-xs text-primary font-medium">Night Strength</p>
            <p className="text-[10px] text-muted-foreground">Better Resolution Time</p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
