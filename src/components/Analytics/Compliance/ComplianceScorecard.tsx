import { ChartCard } from '../shared/ChartCard';
import { getComplianceAnalyticsData } from '../shared/MockDataGenerator';
import { TrendingUp, TrendingDown, Minus, Shield, CheckCircle } from 'lucide-react';

interface ComplianceScorecardProps {
  data?: ReturnType<typeof getComplianceAnalyticsData>['departmentScores'];
}

export function ComplianceScorecard({ data }: ComplianceScorecardProps) {
  const scoreData = data ?? getComplianceAnalyticsData().departmentScores;

  // Calculate overall score
  const overallScore = scoreData.reduce((sum, d) => sum + d.score, 0) / scoreData.length;
  const fullyCompliant = scoreData.filter(d => d.score === 100).length;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return { text: 'text-success', bg: 'bg-success', bar: 'bg-success' };
    if (score >= 85) return { text: 'text-warning', bg: 'bg-warning', bar: 'bg-warning' };
    return { text: 'text-destructive', bg: 'bg-destructive', bar: 'bg-destructive' };
  };

  return (
    <ChartCard
      title="Compliance Scorecard"
      subtitle={`${fullyCompliant} of ${scoreData.length} departments at 100%`}
      headerAction={
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono font-bold text-primary">
            {overallScore.toFixed(1)}%
          </span>
        </div>
      }
    >
      <div className="space-y-4">
        {scoreData.map((dept, index) => {
          const colors = getScoreColor(dept.score);
          
          return (
            <div 
              key={dept.department}
              className="group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${colors.bg}/20 flex items-center justify-center`}>
                    {dept.score === 100 ? (
                      <CheckCircle className={`w-4 h-4 ${colors.text}`} />
                    ) : (
                      <Shield className={`w-4 h-4 ${colors.text}`} />
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">{dept.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(dept.trend)}
                  <span className={`text-lg font-mono font-bold ${colors.text}`}>
                    {dept.score}%
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                  style={{ width: `${dept.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Excellent (95%+)</p>
            <p className="text-xl font-mono font-bold text-success">
              {scoreData.filter(d => d.score >= 95).length}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Good (85-94%)</p>
            <p className="text-xl font-mono font-bold text-warning">
              {scoreData.filter(d => d.score >= 85 && d.score < 95).length}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Needs Work (&lt;85%)</p>
            <p className="text-xl font-mono font-bold text-destructive">
              {scoreData.filter(d => d.score < 85).length}
            </p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
