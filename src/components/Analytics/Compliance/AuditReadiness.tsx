import { ChartCard } from '../shared/ChartCard';
import { getComplianceAnalyticsData } from '../shared/MockDataGenerator';
import { Calendar, CheckCircle, AlertCircle, Clock, FileCheck } from 'lucide-react';

interface AuditReadinessProps {
  data?: ReturnType<typeof getComplianceAnalyticsData>['auditReadiness'];
}

export function AuditReadiness({ data }: AuditReadinessProps) {
  const auditData = data ?? getComplianceAnalyticsData().auditReadiness;

  // Calculate days until audit
  const auditDate = new Date(auditData.nextAuditDate);
  const today = new Date();
  const daysUntilAudit = Math.ceil((auditDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const getProgressColor = (present: number, required: number) => {
    const percent = (present / required) * 100;
    if (percent === 100) return { text: 'text-success', bg: 'bg-success' };
    if (percent >= 80) return { text: 'text-warning', bg: 'bg-warning' };
    return { text: 'text-destructive', bg: 'bg-destructive' };
  };

  return (
    <ChartCard
      title="Audit Readiness"
      subtitle="Document preparation for next safety audit"
      headerAction={
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-mono text-muted-foreground">
            {daysUntilAudit} days left
          </span>
        </div>
      }
    >
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Overall Readiness</span>
          <span className={`text-xl font-mono font-bold ${
            auditData.overallProgress >= 90 ? 'text-success' :
            auditData.overallProgress >= 75 ? 'text-warning' : 'text-destructive'
          }`}>
            {auditData.overallProgress}%
          </span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              auditData.overallProgress >= 90 ? 'bg-success' :
              auditData.overallProgress >= 75 ? 'bg-warning' : 'bg-destructive'
            }`}
            style={{ width: `${auditData.overallProgress}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        {auditData.categories.map((category, index) => {
          const colors = getProgressColor(category.documentsPresent, category.documentsRequired);
          const percent = (category.documentsPresent / category.documentsRequired) * 100;
          const isComplete = category.documentsPresent === category.documentsRequired;
          
          return (
            <div 
              key={category.name}
              className="group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <FileCheck className={`w-4 h-4 ${colors.text}`} />
                  )}
                  <span className="text-sm text-foreground">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {category.documentsPresent}/{category.documentsRequired}
                  </span>
                  <span className={`text-sm font-mono font-bold ${colors.text}`}>
                    {percent.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${colors.bg}`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Info Footer */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              daysUntilAudit > 30 ? 'bg-success/20' :
              daysUntilAudit > 14 ? 'bg-warning/20' : 'bg-destructive/20'
            }`}>
              <Clock className={`w-5 h-5 ${
                daysUntilAudit > 30 ? 'text-success' :
                daysUntilAudit > 14 ? 'text-warning' : 'text-destructive'
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Next Audit</p>
              <p className="text-xs text-muted-foreground">{auditData.nextAuditDate}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className={`text-lg font-mono font-bold ${
              auditData.overallProgress >= 90 ? 'text-success' :
              auditData.overallProgress >= 75 ? 'text-warning' : 'text-destructive'
            }`}>
              {auditData.overallProgress >= 90 ? 'On Track' :
               auditData.overallProgress >= 75 ? 'Needs Attention' : 'At Risk'}
            </p>
            <p className="text-xs text-muted-foreground">
              {auditData.categories.reduce((sum, c) => sum + c.documentsRequired - c.documentsPresent, 0)} docs remaining
            </p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
