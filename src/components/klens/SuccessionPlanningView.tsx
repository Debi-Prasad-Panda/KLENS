/**
 * SuccessionPlanningView - Silent Handover Feature
 * 
 * Dramatic UI for generating "Legacy Pack" reports when employees leave.
 * Shows a "Knowledge Loss Simulation" with animated visualization.
 */

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertTriangle,
  Users,
  Shield,
  FileText,
  Brain,
  Loader2,
  ChevronRight,
  Download,
  RefreshCw,
  Zap,
  AlertCircle,
} from 'lucide-react';

// Types
interface AtRiskUser {
  email: string;
  name: string | null;
  orphan_count: number;
}

interface SimulationResult {
  orphaned_assets: Array<{ name: string; type: string }>;
  total_managed: number;
  documents_affected: number;
  impact_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';  // Text-based
}

interface HandoverReport {
  report_markdown: string;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  raw_data: {
    orphaned_assets: Array<{ name: string; type: string }>;
    managed_assets: Array<{ name: string; type: string }>;
    resolutions_count: number;
    activity_count: number;
  };
  user_email: string;
  user_name: string;
}

type Step = 'idle' | 'scanning' | 'retrieving' | 'synthesizing' | 'complete';

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
  { key: 'scanning', label: 'Scanning Graph Dependencies...', icon: <Users className="w-4 h-4" /> },
  { key: 'retrieving', label: 'Retrieving Problem History...', icon: <Brain className="w-4 h-4" /> },
  { key: 'synthesizing', label: 'Synthesizing Tribal Knowledge...', icon: <FileText className="w-4 h-4" /> },
];

export default function SuccessionPlanningView() {
  const { t } = useLanguage();
  const [atRiskUsers, setAtRiskUsers] = useState<AtRiskUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AtRiskUser | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [report, setReport] = useState<HandoverReport | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('idle');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load at-risk users on mount
  useEffect(() => {
    loadAtRiskUsers();
  }, []);

  const loadAtRiskUsers = async () => {
    try {
      const users = await api.getAtRiskUsers();
      setAtRiskUsers(users);
    } catch (err) {
      console.error('Failed to load at-risk users:', err);
      // Set demo data if API fails
      setAtRiskUsers([
        { email: 'rajesh.sharma@klens.com', name: 'Rajesh Sharma', orphan_count: 3 },
        { email: 'priya.patel@klens.com', name: 'Priya Patel', orphan_count: 1 },
      ]);
    }
  };

  const handleSimulateDeparture = async (user: AtRiskUser) => {
    setSelectedUser(user);
    setError(null);
    setReport(null);
    
    try {
      const result = await api.simulateDeparture(user.email);
      setSimulation(result);
    } catch (err) {
      // Demo simulation
      setSimulation({
        orphaned_assets: [
          { name: 'Boiler-B7', type: 'Machine' },
          { name: 'Turbine-C2', type: 'Machine' },
          { name: 'Compressor-A1', type: 'Machine' },
        ],
        total_managed: 5,
        documents_affected: 12,
        impact_level: 'CRITICAL',
      });
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError(null);
    setProgress(0);
    
    // Animated steps
    const steps: Step[] = ['scanning', 'retrieving', 'synthesizing'];
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      setProgress((i + 1) * 25);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    try {
      const result = await api.generateHandoverReport(selectedUser.email, selectedUser.name || undefined);
      setReport(result);
      setCurrentStep('complete');
      setProgress(100);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
      setCurrentStep('idle');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-green-500 bg-green-500/10';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            🎯 Succession Planning
          </h1>
          <p className="text-muted-foreground mt-1">
            Silent Handover - Capture Tribal Knowledge Before It's Lost
          </p>
        </div>
        <Button variant="outline" onClick={loadAtRiskUsers}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* At-Risk Users Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            At-Risk Team Members
          </CardTitle>
          <CardDescription>
            These employees manage critical assets with no backup. Click to simulate their departure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {atRiskUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No at-risk users detected. All critical assets have backup managers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {atRiskUsers.map((user) => (
                <Card 
                  key={user.email}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:border-orange-500 ${
                    selectedUser?.email === user.email ? 'border-orange-500 bg-orange-500/5' : ''
                  }`}
                  onClick={() => handleSimulateDeparture(user)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {user.name || user.email.split('@')[0]}
                          <Badge variant="destructive" className="text-xs">
                            ⚠️ {user.orphan_count} Orphaned
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulation Results */}
      {selectedUser && simulation && (
        <Card className="border-orange-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <Zap className="w-5 h-5" />
              Knowledge Loss Simulation: {selectedUser.name || selectedUser.email}
            </CardTitle>
            <CardDescription>
              Impact assessment if this employee leaves the organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Impact Level */}
            <div className={`flex items-center justify-between p-4 rounded-lg ${getImpactColor(simulation.impact_level)}`}>
              <span className="font-medium">Impact Level</span>
              <span className="text-2xl font-bold">
                {simulation.impact_level === 'CRITICAL' && '🔴 '}
                {simulation.impact_level === 'HIGH' && '🟠 '}
                {simulation.impact_level === 'MEDIUM' && '🟡 '}
                {simulation.impact_level === 'LOW' && '🟢 '}
                {simulation.impact_level}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-red-500/10">
                <div className="text-2xl font-bold text-red-500">{simulation.orphaned_assets.length}</div>
                <div className="text-sm text-muted-foreground">Orphaned Assets</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-500/10">
                <div className="text-2xl font-bold text-orange-500">{simulation.total_managed}</div>
                <div className="text-sm text-muted-foreground">Total Managed</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-500/10">
                <div className="text-2xl font-bold text-yellow-500">{simulation.documents_affected}</div>
                <div className="text-sm text-muted-foreground">Docs Affected</div>
              </div>
            </div>

            {/* Orphaned Assets List */}
            {simulation.orphaned_assets.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Critical: No Backup Manager
                </h4>
                <div className="flex flex-wrap gap-2">
                  {simulation.orphaned_assets.map((asset, i) => (
                    <Badge key={i} variant="destructive">
                      {asset.name} ({asset.type})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Generate Report Button */}
            <Button 
              size="lg"
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Legacy Pack...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Legacy Pack
                </>
              )}
            </Button>

            {/* Animated Progress */}
            {loading && (
              <div className="space-y-3 animate-in fade-in">
                <Progress value={progress} className="h-2" />
                <div className="space-y-2">
                  {STEPS.map((step) => (
                    <div 
                      key={step.key}
                      className={`flex items-center gap-2 text-sm transition-all ${
                        currentStep === step.key 
                          ? 'text-orange-500 font-medium' 
                          : STEPS.findIndex(s => s.key === currentStep) > STEPS.findIndex(s => s.key === step.key)
                          ? 'text-green-500'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {STEPS.findIndex(s => s.key === currentStep) > STEPS.findIndex(s => s.key === step.key) ? (
                        <span className="text-green-500">✓</span>
                      ) : currentStep === step.key ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        step.icon
                      )}
                      {step.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generated Report */}
      {report && (
        <Card className="border-green-500/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <FileText className="w-5 h-5" />
                Legacy Pack: {report.user_name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getRiskColor(report.risk_level)}>
                  {report.risk_level} RISK
                </Badge>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Markdown Report */}
            <div 
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: report.report_markdown
                  .replace(/^# /gm, '<h1 class="text-2xl font-bold mt-6 mb-3">')
                  .replace(/^## /gm, '<h2 class="text-xl font-bold mt-4 mb-2">')
                  .replace(/^- /gm, '<li>')
                  .replace(/\n/g, '<br/>')
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
