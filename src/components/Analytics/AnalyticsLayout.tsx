import { ReactNode, useState } from 'react';
import { Calendar, Download, FileDown, Image } from 'lucide-react';

interface AnalyticsLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
}

export type DateRange = '24h' | '7d' | '30d' | '90d' | 'custom';

export function AnalyticsLayout({
  children,
  title,
  subtitle,
  dateRange,
  onDateRangeChange,
}: AnalyticsLayoutProps) {
  const [internalDateRange, setInternalDateRange] = useState<DateRange>('24h');
  const selectedDateRange = dateRange ?? internalDateRange;

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ];

  const handleExportPNG = () => {
    // Placeholder for PNG export functionality
    console.log('Exporting dashboard as PNG...');
    // Would use html2canvas or similar library
  };

  const handleExportCSV = () => {
    // Placeholder for CSV export functionality
    console.log('Exporting data as CSV...');
    // Would export underlying data
  };

  const handleGenerateAuditPack = () => {
    // Placeholder for "One-Click Audit Pack" functionality
    console.log('Generating Audit Pack PDF...');
    // Would generate comprehensive PDF report
  };

  const updateDateRange = (range: DateRange) => {
    if (onDateRangeChange) {
      onDateRangeChange(range);
      return;
    }
    setInternalDateRange(range);
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {title && <h1 className="text-2xl font-bold text-foreground">{title}</h1>}
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Picker */}
          <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-lg">
            {dateRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateDateRange(option.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedDateRange === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {option.label}
              </button>
            ))}
            <button
              onClick={() => updateDateRange('custom')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedDateRange === 'custom'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Custom
            </button>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPNG}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
              title="Export as PNG"
            >
              <Image className="w-3.5 h-3.5" />
              PNG
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
              title="Export as CSV"
            >
              <FileDown className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              onClick={handleGenerateAuditPack}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors glow-cyan"
              title="Generate Audit Pack"
            >
              <Download className="w-3.5 h-3.5" />
              Audit Pack
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
