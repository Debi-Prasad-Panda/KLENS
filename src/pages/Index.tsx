import { useState } from "react";
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

type TabType = "dashboard" | "upload" | "search" | "graph" | "iot" | "ar" | "compliance" | "document" | "features" | "profile";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <MorningBriefing />
            <DashboardView onOpenDocument={() => setActiveTab("document")} />
          </>
        );
      case "document":
        return <DocumentViewer onBack={() => setActiveTab("dashboard")} />;
      case "upload":
        return (
          <div className="space-y-6">
            <DocumentProcessor />
            <EnterpriseConnectors />
          </div>
        );
      case "iot":
        return <IoTView />;
      case "graph":
        return <KnowledgeGraphView />;
      case "compliance":
        return <ComplianceView />;
      case "search":
        return <PlaceholderView type="search" />;
      case "ar":
        return <PlaceholderView type="ar" />;
      case "features":
        return <FeaturesShowcase />;
      case "profile":
        return <ProfileView />;
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
      <div className="pl-64">
        <TopNav />
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
