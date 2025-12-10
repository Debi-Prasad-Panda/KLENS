/**
 * ProfileTabs - K-LENS Digital Identity Hub
 * 
 * Tabbed content area with 5 primary tabs:
 * - Overview (Command Center)
 * - Identity Wallet (Certifications)
 * - Security & Devices
 * - Preferences (Cockpit)
 * - Analytics (Self-Quantified)
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./profile/OverviewTab";
import { IdentityWalletTab } from "./profile/IdentityWalletTab";
import { SecurityTab } from "./profile/SecurityTab";
import { PreferencesTab } from "./profile/PreferencesTab";
import { AnalyticsTab } from "./profile/AnalyticsTab";
import { LayoutDashboard, Wallet, Shield, Settings, BarChart3 } from "lucide-react";

export function ProfileTabs() {
     return (
          <Tabs defaultValue="overview" className="w-full">
               <TabsList className="grid w-full grid-cols-5 bg-slate-900/50 border border-slate-700/50 p-1 rounded-lg">
                    <TabsTrigger
                         value="overview"
                         className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all text-xs sm:text-sm"
                    >
                         <LayoutDashboard className="w-4 h-4" />
                         <span className="hidden md:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger
                         value="wallet"
                         className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md transition-all text-xs sm:text-sm"
                    >
                         <Wallet className="w-4 h-4" />
                         <span className="hidden md:inline">Wallet</span>
                    </TabsTrigger>
                    <TabsTrigger
                         value="security"
                         className="flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all text-xs sm:text-sm"
                    >
                         <Shield className="w-4 h-4" />
                         <span className="hidden md:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger
                         value="preferences"
                         className="flex items-center gap-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-md transition-all text-xs sm:text-sm"
                    >
                         <Settings className="w-4 h-4" />
                         <span className="hidden md:inline">Preferences</span>
                    </TabsTrigger>
                    <TabsTrigger
                         value="analytics"
                         className="flex items-center gap-2 data-[state=active]:bg-pink-600 data-[state=active]:text-white rounded-md transition-all text-xs sm:text-sm"
                    >
                         <BarChart3 className="w-4 h-4" />
                         <span className="hidden md:inline">Analytics</span>
                    </TabsTrigger>
               </TabsList>

               <TabsContent value="overview" className="mt-6">
                    <OverviewTab />
               </TabsContent>

               <TabsContent value="wallet" className="mt-6">
                    <IdentityWalletTab />
               </TabsContent>

               <TabsContent value="security" className="mt-6">
                    <SecurityTab />
               </TabsContent>

               <TabsContent value="preferences" className="mt-6">
                    <PreferencesTab />
               </TabsContent>

               <TabsContent value="analytics" className="mt-6">
                    <AnalyticsTab />
               </TabsContent>
          </Tabs>
     );
}
