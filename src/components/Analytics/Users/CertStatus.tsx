import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartCard } from '../shared/ChartCard';
import { getWorkforceAnalyticsData } from '../shared/MockDataGenerator';
import { Award, AlertTriangle, Clock, User } from 'lucide-react';

interface CertStatusProps {
  data?: ReturnType<typeof getWorkforceAnalyticsData>['certifications'];
}

export function CertStatus({ data }: CertStatusProps) {
  const certData = data ?? getWorkforceAnalyticsData().certifications;

  const pieData = [
    { name: 'Qualified', value: certData.qualified, color: 'hsl(var(--success))' },
    { name: 'Expiring Soon', value: certData.expiringSoon, color: 'hsl(var(--warning))' },
    { name: 'Expired', value: certData.expired, color: 'hsl(var(--destructive))' },
  ];

  const total = certData.qualified + certData.expiringSoon + certData.expired;
  const qualifiedPercent = ((certData.qualified / total) * 100).toFixed(0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="glass-card p-3 border border-border shadow-lg">
          <p className="text-sm font-semibold" style={{ color: data.payload.color }}>
            {data.name}
          </p>
          <p className="text-lg font-mono font-bold text-foreground">
            {data.value} users
          </p>
        </div>
      );
    }
    return null;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'expired':
        return { bgClass: 'bg-destructive/20', textClass: 'text-destructive', icon: AlertTriangle };
      case 'expiring':
        return { bgClass: 'bg-warning/20', textClass: 'text-warning', icon: Clock };
      default:
        return { bgClass: 'bg-success/20', textClass: 'text-success', icon: Award };
    }
  };

  return (
    <ChartCard
      title="Certification Status"
      subtitle={`${qualifiedPercent}% workforce certified`}
      headerAction={
        certData.expired > 0 && (
          <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold bg-destructive/20 text-destructive rounded-full animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            {certData.expired} Expired
          </span>
        )
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-mono font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground">Users</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-mono font-bold" style={{ color: item.color }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expired/Expiring Details */}
      {(certData.expired > 0 || certData.expiringSoon > 0) && (
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Attention Required</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {certData.details
              .filter(d => d.status !== 'valid')
              .map((user, index) => {
                const config = getStatusConfig(user.status);
                const Icon = config.icon;
                
                return (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-2 rounded-lg ${config.bgClass}`}
                  >
                    <div className={`w-8 h-8 rounded-full ${config.bgClass} flex items-center justify-center`}>
                      <User className={`w-4 h-4 ${config.textClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.certification}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Icon className={`w-3.5 h-3.5 ${config.textClass}`} />
                      <span className={`text-xs font-medium ${config.textClass}`}>
                        {user.expiryDate}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
