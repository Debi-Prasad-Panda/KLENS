import { useState } from "react";
import { Share2, MessageSquare, Database, Mail, Loader2, AlertCircle } from "lucide-react";

interface Connector {
  id: string;
  name: string;
  icon: typeof Share2;
  color: string;
}

const connectors: Connector[] = [
  { id: "sharepoint", name: "SharePoint", icon: Share2, color: "text-blue-400" },
  { id: "whatsapp", name: "WhatsApp", icon: MessageSquare, color: "text-green-400" },
  { id: "maximo", name: "IBM Maximo", icon: Database, color: "text-purple-400" },
  { id: "email", name: "Email Gateway", icon: Mail, color: "text-cyan-400" }
];

export function EnterpriseConnectors() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = (id: string, name: string) => {
    setConnecting(id);
    setError(null);
    
    setTimeout(() => {
      setConnecting(null);
      setError(`Enterprise Gateway Error: ${name} credentials not configured. Contact system administrator.`);
      setTimeout(() => setError(null), 5000);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Enterprise Integrations</h3>
        <p className="text-sm text-muted-foreground">Connect to external data sources</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/20 border border-destructive/50 rounded-lg animate-fade-in">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => handleConnect(connector.id, connector.name)}
            disabled={connecting === connector.id}
            className="integration-btn"
          >
            {connecting === connector.id ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <connector.icon className={`w-5 h-5 ${connector.color}`} />
            )}
            <span className="text-sm font-medium">{connector.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
