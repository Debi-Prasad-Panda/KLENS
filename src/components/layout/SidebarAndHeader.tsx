import { useState } from "react";
import { Sidebar } from "@/components/klens/Sidebar";
import { TopNav } from "@/components/klens/TopNav";
import { useNavigate } from "react-router-dom";

interface SidebarAndHeaderProps {
  children: React.ReactNode;
}

export function SidebarAndHeader({ children }: SidebarAndHeaderProps) {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const navigate = useNavigate();

  // Since this component is used in standalone pages (like Settings),
  // we default the active tab to "settings".
  // When a user clicks another tab, we navigate to the main dashboard.
  const handleTabChange = (tab: string) => {
    if (tab === "settings") {
      // Already here
      return;
    }
    // Navigate to dashboard for other views
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar 
        activeTab="settings" 
        setActiveTab={(tab: any) => handleTabChange(tab)} 
      />

      {/* Main Content */}
      <div className={`pl-64 transition-all duration-300 ${
        isAIChatOpen ? "pr-[480px]" : "pr-0"
      }`}>
        <TopNav onAIChatToggle={setIsAIChatOpen} />
        <main>
          {children}
        </main>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-success/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
}
