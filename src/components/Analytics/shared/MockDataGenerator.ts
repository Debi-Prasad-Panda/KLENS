// Mock Data Generator for K-LENS Analytics Demo Mode
// This ensures charts always have impressive data during presentations

export interface MissionControlData {
  kpis: {
    safetyScore: number;
    safetyTrend: 'up' | 'down' | 'stable';
    manHoursSaved: number;
    dollarsSaved: number;
    activeAlerts: number;
    criticalAlerts: number;
    documentsIndexed: number;
    documentsProcessed: number;
  };
  efficiency: Array<{
    day: string;
    manual: number;
    ai: number;
  }>;
  riskPulse: Array<{
    time: string;
    score: number;
    incident?: string;
  }>;
  anomalies: Array<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    message: string;
    location: string;
    timestamp: string;
  }>;
}

export interface DocumentAnalyticsData {
  ocrConfidence: Array<{
    documentId: string;
    documentName: string;
    confidence: number;
    needsReview: boolean;
  }>;
  queueStats: {
    docsPerMinute: number;
    queueLength: number;
    avgProcessingTime: number;
  };
  knowledgeGaps: {
    missingManuals: Array<{
      machineName: string;
      lastMentioned: string;
      mentionCount: number;
    }>;
    searchFailures: Array<{
      query: string;
      count: number;
      lastSearched: string;
    }>;
  };
}

export interface WorkforceAnalyticsData {
  shiftComparison: {
    metrics: string[];
    morningShift: number[];
    nightShift: number[];
  };
  certifications: {
    qualified: number;
    expired: number;
    expiringSoon: number;
    details: Array<{
      name: string;
      certification: string;
      status: 'valid' | 'expired' | 'expiring';
      expiryDate: string;
    }>;
  };
  adoption: Array<{
    month: string;
    aiSearch: number;
    folderBrowsing: number;
  }>;
}

export interface ComplianceAnalyticsData {
  departmentScores: Array<{
    department: string;
    score: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  auditReadiness: {
    overallProgress: number;
    categories: Array<{
      name: string;
      documentsRequired: number;
      documentsPresent: number;
    }>;
    nextAuditDate: string;
  };
  incidents: Array<{
    id: string;
    date: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    documentVersion: string;
    resolved: boolean;
  }>;
}

// Generate realistic mock data for Mission Control
export const getMissionControlData = (): MissionControlData => {
  const currentHour = new Date().getHours();
  
  return {
    kpis: {
      safetyScore: 98.2,
      safetyTrend: 'up',
      manHoursSaved: 1240,
      dollarsSaved: 62000,
      activeAlerts: 3,
      criticalAlerts: 1,
      documentsIndexed: 12847,
      documentsProcessed: 12431,
    },
    efficiency: [
      { day: 'Mon', manual: 8.2, ai: 0.45 },
      { day: 'Tue', manual: 7.8, ai: 0.38 },
      { day: 'Wed', manual: 9.1, ai: 0.52 },
      { day: 'Thu', manual: 7.5, ai: 0.41 },
      { day: 'Fri', manual: 8.6, ai: 0.48 },
      { day: 'Sat', manual: 6.2, ai: 0.35 },
      { day: 'Sun', manual: 5.8, ai: 0.32 },
    ],
    riskPulse: generateRiskPulseData(currentHour),
    anomalies: [
      {
        id: 'ANM-001',
        type: 'critical',
        message: 'Pressure valve variance detected',
        location: 'Boiler B7 - Section 3',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        id: 'ANM-002',
        type: 'warning',
        message: 'Temperature exceeds normal range',
        location: 'Compressor Unit C2',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      },
      {
        id: 'ANM-003',
        type: 'info',
        message: 'Scheduled maintenance reminder',
        location: 'Turbine Hall - West Wing',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      },
      {
        id: 'ANM-004',
        type: 'warning',
        message: 'Vibration levels elevated',
        location: 'Motor Assembly MA-12',
        timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
      },
      {
        id: 'ANM-005',
        type: 'info',
        message: 'Document update required',
        location: 'Safety Protocol SP-2024',
        timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
      },
    ],
  };
};

// Generate risk pulse data with realistic patterns
function generateRiskPulseData(currentHour: number): MissionControlData['riskPulse'] {
  const data: MissionControlData['riskPulse'] = [];
  
  for (let i = 0; i < 24; i++) {
    const hour = (currentHour - 23 + i + 24) % 24;
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    
    // Base score with some variation
    let score = 96 + Math.random() * 3;
    
    // Simulate incidents at specific hours
    if (hour === 8) {
      score = 85; // Morning shift change incident
      data.push({ time: timeStr, score, incident: 'Shift handover delay' });
    } else if (hour === 14) {
      score = 88; // Afternoon equipment check
      data.push({ time: timeStr, score, incident: 'Equipment inspection alert' });
    } else {
      data.push({ time: timeStr, score: Math.round(score * 10) / 10 });
    }
  }
  
  return data;
}

// Generate Document Analytics mock data
export const getDocumentAnalyticsData = (): DocumentAnalyticsData => {
  return {
    ocrConfidence: [
      { documentId: 'DOC-001', documentName: 'Maintenance_Log_2024.pdf', confidence: 98.5, needsReview: false },
      { documentId: 'DOC-002', documentName: 'Safety_Protocol_v3.pdf', confidence: 96.2, needsReview: false },
      { documentId: 'DOC-003', documentName: 'Handwritten_Notes_Dec.jpg', confidence: 72.4, needsReview: true },
      { documentId: 'DOC-004', documentName: 'Old_Blueprint_Scan.tiff', confidence: 65.8, needsReview: true },
      { documentId: 'DOC-005', documentName: 'Equipment_Manual_EN.pdf', confidence: 99.1, needsReview: false },
      { documentId: 'DOC-006', documentName: 'Faded_Logbook_Page.jpg', confidence: 58.3, needsReview: true },
    ],
    queueStats: {
      docsPerMinute: 4.2,
      queueLength: 23,
      avgProcessingTime: 14.5,
    },
    knowledgeGaps: {
      missingManuals: [
        { machineName: 'Hydraulic Press HP-7', lastMentioned: '2024-12-08', mentionCount: 12 },
        { machineName: 'CNC Mill Unit B', lastMentioned: '2024-12-09', mentionCount: 8 },
        { machineName: 'Conveyor System CS-3', lastMentioned: '2024-12-07', mentionCount: 5 },
      ],
      searchFailures: [
        { query: 'boiler certification renewal', count: 15, lastSearched: '2024-12-10' },
        { query: 'emergency shutdown procedure delta', count: 9, lastSearched: '2024-12-09' },
        { query: 'ISO 45001 compliance checklist', count: 7, lastSearched: '2024-12-10' },
      ],
    },
  };
};

// Generate Workforce Analytics mock data
export const getWorkforceAnalyticsData = (): WorkforceAnalyticsData => {
  return {
    shiftComparison: {
      metrics: ['Uploads', 'Searches', 'Resolution Time', 'Compliance', 'AI Usage'],
      morningShift: [85, 92, 78, 95, 88],
      nightShift: [72, 88, 82, 91, 75],
    },
    certifications: {
      qualified: 45,
      expired: 3,
      expiringSoon: 7,
      details: [
        { name: 'Rajesh Kumar', certification: 'Boiler Safety Level 2', status: 'expired', expiryDate: '2024-11-15' },
        { name: 'Priya Sharma', certification: 'Forklift Operation', status: 'expiring', expiryDate: '2024-12-20' },
        { name: 'Amit Patel', certification: 'Electrical Safety', status: 'expired', expiryDate: '2024-10-30' },
        { name: 'Neha Gupta', certification: 'First Aid', status: 'expiring', expiryDate: '2024-12-25' },
        { name: 'Vikram Singh', certification: 'Crane Operation', status: 'expired', expiryDate: '2024-09-01' },
      ],
    },
    adoption: [
      { month: 'Jul', aiSearch: 25, folderBrowsing: 75 },
      { month: 'Aug', aiSearch: 38, folderBrowsing: 62 },
      { month: 'Sep', aiSearch: 52, folderBrowsing: 48 },
      { month: 'Oct', aiSearch: 68, folderBrowsing: 32 },
      { month: 'Nov', aiSearch: 79, folderBrowsing: 21 },
      { month: 'Dec', aiSearch: 87, folderBrowsing: 13 },
    ],
  };
};

// Generate Compliance Analytics mock data
export const getComplianceAnalyticsData = (): ComplianceAnalyticsData => {
  return {
    departmentScores: [
      { department: 'Engineering', score: 100, trend: 'stable' },
      { department: 'Operations', score: 96, trend: 'up' },
      { department: 'Maintenance', score: 92, trend: 'up' },
      { department: 'HR', score: 85, trend: 'down' },
      { department: 'Safety', score: 98, trend: 'stable' },
      { department: 'Quality', score: 94, trend: 'up' },
    ],
    auditReadiness: {
      overallProgress: 87,
      categories: [
        { name: 'Safety Protocols', documentsRequired: 45, documentsPresent: 45 },
        { name: 'Equipment Manuals', documentsRequired: 120, documentsPresent: 108 },
        { name: 'Training Records', documentsRequired: 80, documentsPresent: 72 },
        { name: 'Incident Reports', documentsRequired: 25, documentsPresent: 25 },
        { name: 'Certifications', documentsRequired: 55, documentsPresent: 42 },
      ],
      nextAuditDate: '2025-01-15',
    },
    incidents: [
      { id: 'INC-001', date: '2024-12-05', severity: 'low', description: 'Minor slip in warehouse', documentVersion: 'SP-2024-v3', resolved: true },
      { id: 'INC-002', date: '2024-11-28', severity: 'medium', description: 'Equipment malfunction alert', documentVersion: 'EM-2024-v2', resolved: true },
      { id: 'INC-003', date: '2024-11-15', severity: 'high', description: 'Near-miss incident in loading dock', documentVersion: 'SP-2024-v2', resolved: true },
      { id: 'INC-004', date: '2024-10-30', severity: 'low', description: 'PPE compliance reminder', documentVersion: 'PPE-2024-v1', resolved: true },
    ],
  };
};

// Utility to format numbers
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Utility to format currency
export const formatCurrency = (num: number): string => {
  if (num >= 1000000) {
    return '$' + (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return '$' + (num / 1000).toFixed(0) + 'K';
  }
  return '$' + num.toString();
};

// Utility to format time ago
export const formatTimeAgo = (isoTime: string): string => {
  const date = new Date(isoTime);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
};
