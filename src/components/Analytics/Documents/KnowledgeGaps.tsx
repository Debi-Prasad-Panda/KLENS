import { ChartCard } from '../shared/ChartCard';
import { getDocumentAnalyticsData } from '../shared/MockDataGenerator';
import { BookX, SearchX, AlertCircle, ArrowRight } from 'lucide-react';

interface KnowledgeGapsProps {
  data?: ReturnType<typeof getDocumentAnalyticsData>['knowledgeGaps'];
}

export function KnowledgeGaps({ data }: KnowledgeGapsProps) {
  const gapsData = data ?? getDocumentAnalyticsData().knowledgeGaps;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Missing Manuals */}
      <ChartCard
        title="Missing Manuals"
        subtitle="Machines mentioned in logs without documentation"
        headerAction={
          <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-destructive/20 text-destructive rounded-full">
            <AlertCircle className="w-3 h-3" />
            {gapsData.missingManuals.length} missing
          </span>
        }
      >
        <div className="space-y-3">
          {gapsData.missingManuals.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
                <BookX className="w-6 h-6 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">All equipment is documented!</p>
            </div>
          ) : (
            gapsData.missingManuals.map((manual, index) => (
              <div 
                key={manual.machineName}
                className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 transition-colors cursor-pointer group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                  <BookX className="w-5 h-5 text-destructive" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{manual.machineName}</p>
                  <p className="text-xs text-muted-foreground">
                    Last mentioned: {manual.lastMentioned} • {manual.mentionCount} references
                  </p>
                </div>
                
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            ))
          )}
        </div>
        
        {gapsData.missingManuals.length > 0 && (
          <button className="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1 border border-border rounded-lg hover:bg-primary/5">
            Upload Missing Manuals
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </ChartCard>

      {/* Search Failures */}
      <ChartCard
        title="Search Failure Rate"
        subtitle="Queries with zero results - knowledge gaps"
        headerAction={
          <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-warning/20 text-warning rounded-full">
            <SearchX className="w-3 h-3" />
            {gapsData.searchFailures.reduce((sum, f) => sum + f.count, 0)} failures
          </span>
        }
      >
        <div className="space-y-3">
          {gapsData.searchFailures.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
                <SearchX className="w-6 h-6 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">All searches found results!</p>
            </div>
          ) : (
            gapsData.searchFailures.map((failure, index) => (
              <div 
                key={failure.query}
                className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20 hover:bg-warning/10 transition-colors cursor-pointer group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                  <SearchX className="w-5 h-5 text-warning" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    "{failure.query}"
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {failure.count} failed searches • Last: {failure.lastSearched}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-1 text-xs font-mono font-bold bg-warning/20 text-warning rounded">
                    {failure.count}×
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))
          )}
        </div>
        
        {gapsData.searchFailures.length > 0 && (
          <button className="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1 border border-border rounded-lg hover:bg-primary/5">
            Address Knowledge Gaps
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </ChartCard>
    </div>
  );
}
