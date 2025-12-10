import { ChartCard } from '../shared/ChartCard';
import { getDocumentAnalyticsData } from '../shared/MockDataGenerator';
import { FileWarning, CheckCircle, Gauge, Clock, Layers } from 'lucide-react';

interface ProcessingStatsProps {
  data?: ReturnType<typeof getDocumentAnalyticsData>;
}

export function ProcessingStats({ data }: ProcessingStatsProps) {
  const docData = data ?? getDocumentAnalyticsData();

  // Calculate OCR stats
  const needsReview = docData.ocrConfidence.filter(d => d.needsReview).length;
  const totalDocs = docData.ocrConfidence.length;
  const avgConfidence = docData.ocrConfidence.reduce((sum, d) => sum + d.confidence, 0) / totalDocs;

  return (
    <div className="space-y-6">
      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Gauge className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-primary">
                {docData.queueStats.docsPerMinute}
              </p>
              <p className="text-sm text-muted-foreground">Docs/Minute</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
              <Layers className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-warning">
                {docData.queueStats.queueLength}
              </p>
              <p className="text-sm text-muted-foreground">In Queue</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-success">
                {docData.queueStats.avgProcessingTime}s
              </p>
              <p className="text-sm text-muted-foreground">Avg Process Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* OCR Confidence Heatmap */}
      <ChartCard
        title="OCR Confidence Heatmap"
        subtitle={`${needsReview} of ${totalDocs} documents need review • Avg: ${avgConfidence.toFixed(1)}%`}
      >
        <div className="space-y-3">
          {docData.ocrConfidence.map((doc, index) => (
            <div 
              key={doc.documentId}
              className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Status Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                doc.needsReview ? 'bg-warning/20' : 'bg-success/20'
              }`}>
                {doc.needsReview ? (
                  <FileWarning className="w-5 h-5 text-warning" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-success" />
                )}
              </div>
              
              {/* Document Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {doc.documentName}
                </p>
                <p className="text-xs text-muted-foreground">{doc.documentId}</p>
              </div>
              
              {/* Confidence Bar */}
              <div className="w-32 flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Confidence</span>
                  <span className={`text-xs font-mono font-bold ${
                    doc.confidence >= 90 ? 'text-success' :
                    doc.confidence >= 70 ? 'text-warning' : 'text-destructive'
                  }`}>
                    {doc.confidence}%
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      doc.confidence >= 90 ? 'bg-success' :
                      doc.confidence >= 70 ? 'bg-warning' : 'bg-destructive'
                    }`}
                    style={{ width: `${doc.confidence}%` }}
                  />
                </div>
              </div>
              
              {/* Review Badge */}
              {doc.needsReview && (
                <span className="px-2 py-1 text-xs font-medium bg-warning/20 text-warning rounded-full flex-shrink-0">
                  Review
                </span>
              )}
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
