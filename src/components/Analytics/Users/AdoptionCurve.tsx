import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { ChartCard } from '../shared/ChartCard';
import { getWorkforceAnalyticsData } from '../shared/MockDataGenerator';
import { Sparkles, FolderOpen, TrendingUp } from 'lucide-react';

interface AdoptionCurveProps {
  data?: ReturnType<typeof getWorkforceAnalyticsData>['adoption'];
}

export function AdoptionCurve({ data }: AdoptionCurveProps) {
  const adoptionData = data ?? getWorkforceAnalyticsData().adoption;

  // Calculate current adoption rate
  const latestData = adoptionData[adoptionData.length - 1];
  const firstData = adoptionData[0];
  const growthRate = latestData.aiSearch - firstData.aiSearch;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const aiSearch = payload.find((p: any) => p.dataKey === 'aiSearch')?.value || 0;
      const folderBrowsing = payload.find((p: any) => p.dataKey === 'folderBrowsing')?.value || 0;
      
      return (
        <div className="glass-card p-3 border border-border shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">AI Search:</span>
              <span className="text-xs font-mono font-bold text-primary">{aiSearch}%</span>
            </div>
            <div className="flex items-center gap-2">
              <FolderOpen className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Folder Browsing:</span>
              <span className="text-xs font-mono font-bold text-muted-foreground">{folderBrowsing}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard
      title="AI Adoption Curve"
      subtitle="AI Search vs Traditional Folder Browsing"
      headerAction={
        <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-success/20 text-success rounded-full">
          <TrendingUp className="w-3 h-3" />
          +{growthRate}% adoption
        </div>
      }
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={adoptionData}>
            <defs>
              <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="folderGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-xs text-muted-foreground">
                  {value === 'aiSearch' ? 'AI Search' : 'Folder Browsing'}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="aiSearch"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#aiGradient)"
              name="aiSearch"
            />
            <Area
              type="monotone"
              dataKey="folderBrowsing"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#folderGradient)"
              name="folderBrowsing"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Footer */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Current AI Adoption</p>
            <p className="text-xl font-mono font-bold text-primary">{latestData.aiSearch}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Legacy Usage</p>
            <p className="text-xl font-mono font-bold text-muted-foreground">{latestData.folderBrowsing}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">6-Month Growth</p>
            <p className="text-xl font-mono font-bold text-success">+{growthRate}%</p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
