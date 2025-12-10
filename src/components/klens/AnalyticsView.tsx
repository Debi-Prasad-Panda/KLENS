import { useState } from 'react';
import { 
  Activity, 
  FileSearch, 
  Users, 
  Shield,
  ChevronRight
} from 'lucide-react';
import { AnalyticsLayout } from '../Analytics/AnalyticsLayout';

// Dashboard Module
import { MissionControl } from '../Analytics/Dashboard/MissionControl';

// Document Module
import { ProcessingStats } from '../Analytics/Documents/ProcessingStats';
import { KnowledgeGaps } from '../Analytics/Documents/KnowledgeGaps';

// Workforce Module
import { ShiftRadar } from '../Analytics/Users/ShiftRadar';
import { CertStatus } from '../Analytics/Users/CertStatus';
import { AdoptionCurve } from '../Analytics/Users/AdoptionCurve';

// Compliance Module
import { ComplianceScorecard } from '../Analytics/Compliance/ComplianceScorecard';
import { AuditReadiness } from '../Analytics/Compliance/AuditReadiness';
import { IncidentHistory } from '../Analytics/Compliance/IncidentHistory';

type AnalyticsTab = 'mission-control' | 'documents' | 'workforce' | 'compliance';

const tabs: Array<{ id: AnalyticsTab; label: string; icon: typeof Activity; description: string }> = [
  { 
    id: 'mission-control', 
    label: 'Mission Control', 
    icon: Activity,
    description: 'Real-time operational overview'
  },
  { 
    id: 'documents', 
    label: 'Document Intelligence', 
    icon: FileSearch,
    description: 'Processing quality & knowledge gaps'
  },
  { 
    id: 'workforce', 
    label: 'Workforce Analytics', 
    icon: Users,
    description: 'Shift performance & certifications'
  },
  { 
    id: 'compliance', 
    label: 'Compliance Center', 
    icon: Shield,
    description: 'Audit readiness & incident tracking'
  },
];

export function AnalyticsView() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('mission-control');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mission-control':
        return <MissionControl />;
      
      case 'documents':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <FileSearch className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Document Intelligence</h2>
                <p className="text-sm text-muted-foreground">
                  Processing analytics & knowledge gap analysis
                </p>
              </div>
            </div>
            <ProcessingStats />
            <KnowledgeGaps />
          </div>
        );
      
      case 'workforce':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Workforce Analytics</h2>
                <p className="text-sm text-muted-foreground">
                  Shift performance, certifications & AI adoption
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ShiftRadar />
              <CertStatus />
            </div>
            <AdoptionCurve />
          </div>
        );
      
      case 'compliance':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Compliance Center</h2>
                <p className="text-sm text-muted-foreground">
                  Department scores, audit prep & incident tracking
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComplianceScorecard />
              <AuditReadiness />
            </div>
            <IncidentHistory />
          </div>
        );
      
      default:
        return <MissionControl />;
    }
  };

  return (
    <AnalyticsLayout
      title="K-LENS Analytics"
      subtitle="Industrial Intelligence Suite • Real-time Monitoring & Insights"
    >
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-card/50 rounded-xl border border-border mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20 glow-cyan'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <div className="text-left">
                <p className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                  {tab.label}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {tab.description}
                </p>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-primary ml-2" />}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </AnalyticsLayout>
  );
}

export default AnalyticsView;
