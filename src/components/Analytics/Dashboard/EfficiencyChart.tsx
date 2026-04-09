import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ChartCard } from '../shared/ChartCard';
import { getMissionControlData } from '../shared/MockDataGenerator';

interface EfficiencyChartProps {
  data?: Array<{
    day: string;
    manual: number;
    ai: number;
  }>;
  rangeLabel?: string;
}

export function EfficiencyChart({ data, rangeLabel = 'Last 7 Days' }: EfficiencyChartProps) {
  // Use mock data if no real data provided
  const chartData = data ?? getMissionControlData().efficiency;

  // Calculate total savings
  const totalManual = chartData.reduce((sum, d) => sum + d.manual, 0);
  const totalAI = chartData.reduce((sum, d) => sum + d.ai, 0);
  const savingsPercent = ((totalManual - totalAI) / totalManual * 100).toFixed(0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const manual = payload.find((p: any) => p.dataKey === 'manual')?.value || 0;
      const ai = payload.find((p: any) => p.dataKey === 'ai')?.value || 0;
      const savings = ((manual - ai) / manual * 100).toFixed(0);
      
      return (
        <div className="glass-card p-3 border border-border shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <span className="text-xs text-muted-foreground">Manual:</span>
              <span className="text-xs font-mono text-foreground">{manual.toFixed(1)} hrs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">K-LENS AI:</span>
              <span className="text-xs font-mono text-foreground">{ai.toFixed(2)} hrs</span>
            </div>
            <div className="border-t border-border pt-1 mt-1">
              <span className="text-xs font-semibold text-success">{savings}% faster with AI</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard
      title="Efficiency Impact"
      subtitle={`${savingsPercent}% time savings vs manual processing`}
      className="lg:col-span-2"
      headerAction={
        <span className="px-2 py-1 text-xs font-mono text-success bg-success/20 rounded-full">
          {rangeLabel}
        </span>
      }
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.1)' }} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-xs text-muted-foreground">
                  {value === 'manual' ? 'Manual Processing' : 'K-LENS AI'}
                </span>
              )}
            />
            <Bar 
              dataKey="manual" 
              fill="hsl(var(--destructive))" 
              opacity={0.6}
              radius={[4, 4, 0, 0]}
              name="manual"
            />
            <Bar 
              dataKey="ai" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              name="ai"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Avg Manual Time</p>
            <p className="text-lg font-mono font-semibold text-destructive">
              {(totalManual / chartData.length).toFixed(1)}h
            </p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Avg AI Time</p>
            <p className="text-lg font-mono font-semibold text-primary">
              {(totalAI / chartData.length).toFixed(2)}h
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Weekly Savings</p>
          <p className="text-lg font-mono font-semibold text-success">
            {(totalManual - totalAI).toFixed(1)} hours
          </p>
        </div>
      </div>
    </ChartCard>
  );
}
