import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { ChartCard } from '../shared/ChartCard';
import { getMissionControlData } from '../shared/MockDataGenerator';
import { AlertTriangle } from 'lucide-react';

interface RiskPulseProps {
  data?: Array<{
    time: string;
    score: number;
    incident?: string;
  }>;
  onIncidentClick?: (time: string) => void;
}

export function RiskPulse({ data, onIncidentClick }: RiskPulseProps) {
  // Use mock data if no real data provided
  const chartData = data ?? getMissionControlData().riskPulse;

  // Find current score and incidents
  const currentScore = chartData[chartData.length - 1]?.score ?? 0;
  const incidents = chartData.filter(d => d.incident);
  
  // Determine status color
  const getStatusColor = (score: number) => {
    if (score >= 95) return 'text-success';
    if (score >= 85) return 'text-warning';
    return 'text-destructive';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0]?.payload;
      const score = point?.score || 0;
      const incident = point?.incident;
      
      return (
        <div className="glass-card p-3 border border-border shadow-lg min-w-[180px]">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">Risk Score:</span>
            <span className={`text-sm font-mono font-bold ${getStatusColor(score)}`}>
              {score}%
            </span>
          </div>
          {incident && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs text-warning">{incident}</span>
            </div>
          )}
          {onIncidentClick && incident && (
            <button 
              className="w-full mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
              onClick={() => onIncidentClick(label)}
            >
              View Details →
            </button>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard
      title="Risk Pulse Monitor"
      subtitle="Real-time safety compliance over 24 hours"
      headerAction={
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            currentScore >= 95 ? 'bg-success' : currentScore >= 85 ? 'bg-warning' : 'bg-destructive'
          } animate-pulse`} />
          <span className={`text-sm font-mono font-bold ${getStatusColor(currentScore)}`}>
            {currentScore}%
          </span>
        </div>
      }
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="riskGradientWarning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              interval={3}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              domain={[70, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Danger zone reference line */}
            <ReferenceLine 
              y={85} 
              stroke="hsl(var(--warning))" 
              strokeDasharray="5 5" 
              opacity={0.5}
            />
            <ReferenceLine 
              y={95} 
              stroke="hsl(var(--success))" 
              strokeDasharray="5 5" 
              opacity={0.5}
            />
            
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#riskGradient)"
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.incident) {
                  return (
                    <g>
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={6} 
                        fill="hsl(var(--warning))" 
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                        className="cursor-pointer"
                      />
                    </g>
                  );
                }
                return <circle cx={cx} cy={cy} r={0} />;
              }}
              activeDot={{
                r: 6,
                fill: 'hsl(var(--primary))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Incidents Footer */}
      {incidents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Recent Incidents</p>
          <div className="flex flex-wrap gap-2">
            {incidents.map((incident, idx) => (
              <button
                key={idx}
                onClick={() => onIncidentClick?.(incident.time)}
                className="flex items-center gap-1.5 px-2 py-1 text-xs bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-colors"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>{incident.time}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-success rounded" />
          <span className="text-xs text-muted-foreground">&gt;95% Safe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-warning rounded" />
          <span className="text-xs text-muted-foreground">85-95% Caution</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-destructive rounded" />
          <span className="text-xs text-muted-foreground">&lt;85% Critical</span>
        </div>
      </div>
    </ChartCard>
  );
}
