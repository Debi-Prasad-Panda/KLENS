import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleBasedView } from "./RoleBasedView";
import { NuclearKeys } from "./NuclearKeys";
import { AuditTrail } from "./AuditTrail";
import { Shield, GitBranch, Eye, Languages } from "lucide-react";

export function FeaturesShowcase() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">Advanced Features</h2>
        <p className="text-muted-foreground">Government-grade security and intelligence features</p>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Role Views
          </TabsTrigger>
          <TabsTrigger value="nuclear" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Nuclear Keys
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Audit Trail
          </TabsTrigger>
          <TabsTrigger value="multilingual" className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            Multilingual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <RoleBasedView />
        </TabsContent>

        <TabsContent value="nuclear" className="mt-6">
          <NuclearKeys />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditTrail />
        </TabsContent>

        <TabsContent value="multilingual" className="mt-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Languages className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold">Multilingual Support</h3>
                <p className="text-sm text-muted-foreground">16+ languages for diverse workforce</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["English", "Hindi", "Malayalam", "Tamil", "Telugu", "Kannada", "Bengali", "Marathi"].map((lang) => (
                <button key={lang} className="p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors text-left">
                  <span className="text-sm font-medium">{lang}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-sm mb-2">Sample Translation:</p>
              <p className="text-sm font-mono">EN: "Boiler pressure exceeds safe threshold"</p>
              <p className="text-sm font-mono text-primary">HI: "बॉयलर का दबाव सुरक्षित सीमा से अधिक है"</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
