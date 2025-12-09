import { useState, useEffect } from "react";
import { Sidebar } from "@/components/klens/Sidebar";
import { TopNav } from "@/components/klens/TopNav";
import { DashboardView } from "@/components/klens/DashboardView";
import { MorningBriefing } from "@/components/klens/MorningBriefing";
import { UploadView } from "@/components/klens/UploadView";
import { DocumentProcessor } from "@/components/klens/DocumentProcessor";
import { EnterpriseConnectors } from "@/components/klens/EnterpriseConnectors";
import { IoTView } from "@/components/klens/IoTView";
import { KnowledgeGraphView } from "@/components/klens/KnowledgeGraphView";
import { ComplianceView } from "@/components/klens/ComplianceView";
import { PlaceholderView } from "@/components/klens/PlaceholderView";
import { DocumentViewer } from "@/components/klens/DocumentViewer";
import { FeaturesShowcase } from "@/components/klens/FeaturesShowcase";
import { ProfileView } from "@/components/klens/ProfileView";
import { DocumentLibrary } from "@/components/klens/DocumentLibrary";
import { SettingsView } from "@/components/klens/SettingsView";
import { SearchDiscoveryView } from "@/components/klens/SearchDiscoveryView";

type TabType = "dashboard" | "search" | "graph" | "iot" | "ar" | "compliance" | "documents" | "document-view" | "features" | "profile" | "settings";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Listen for navigation events from TopNav
  useEffect(() => {
    const handleNavigateProfile = () => setActiveTab("profile");
    const handleNavigateSettings = () => setActiveTab("settings");
    
    window.addEventListener('navigate-profile', handleNavigateProfile);
    window.addEventListener('navigate-settings', handleNavigateSettings);
    
    return () => {
      window.removeEventListener('navigate-profile', handleNavigateProfile);
      window.removeEventListener('navigate-settings', handleNavigateSettings);
    };
  });

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <MorningBriefing />
            <DashboardView onOpenDocument={() => {
              setActiveTab("documents");
            }} />
          </>
        );
      case "documents":
        return <DocumentLibrary onOpenDocument={(doc) => {
          setSelectedDocument(doc);
          setActiveTab("document-view");
        }} />;
      case "document-view":
        return <DocumentViewer onBack={() => setActiveTab("documents")} document={selectedDocument} />;

      case "iot":
        return <IoTView />;
      case "graph":
        return <KnowledgeGraphView />;
      case "compliance":
        return <ComplianceView />;
      case "search":
        return <SearchDiscoveryView onOpenDocument={(doc) => {
          setSelectedDocument(doc);
          setActiveTab("document-view");
        }} />;
      case "ar":
        return <PlaceholderView type="ar" />;
      case "features":
        return <FeaturesShowcase />;
      case "profile":
        return <ProfileView />;
      case "settings":
        return <SettingsView />;
      default:
        return (
          <>
            <MorningBriefing />
            <DashboardView onOpenDocument={() => setActiveTab("document")} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className={`pl-64 transition-all duration-300 ${
        isAIChatOpen ? "pr-[480px]" : "pr-0"
      }`}>
        <TopNav onAIChatToggle={setIsAIChatOpen} />
        <main className="p-6">
          {renderView()}
        </main>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-success/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
};

export default Index;
