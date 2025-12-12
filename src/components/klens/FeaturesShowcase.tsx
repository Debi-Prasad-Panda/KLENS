import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleManagementView } from "./RoleManagementView";
import { NuclearKeys } from "./NuclearKeys";
import { AuditTrail } from "./AuditTrail";
import { Shield, GitBranch, Eye, Users } from "lucide-react";

export function FeaturesShowcase() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">Advanced Features</h2>
        <p className="text-muted-foreground">Government-grade security and intelligence features</p>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Role Management
          </TabsTrigger>
          <TabsTrigger value="nuclear" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Nuclear Keys
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <RoleManagementView />
        </TabsContent>

        <TabsContent value="nuclear" className="mt-6">
          <NuclearKeys />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditTrail />
        </TabsContent>
      </Tabs>
    </div>
  );
}
