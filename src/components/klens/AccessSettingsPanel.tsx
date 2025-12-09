import { useState } from "react";
import {
     Shield,
     Globe,
     Building2,
     Users,
     UserCheck,
     ChevronDown,
     X,
     Plus,
     Lock
} from "lucide-react";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import {
     Collapsible,
     CollapsibleContent,
     CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Access level definitions
export type AccessLevel = "public" | "department" | "managers_only" | "custom";

export interface AccessRules {
     access_level: AccessLevel;
     target_department?: string;
     allowed_users?: string[];
}

interface AccessSettingsPanelProps {
     accessRules: AccessRules;
     onAccessRulesChange: (rules: AccessRules) => void;
     userDepartment?: string;
}

// Department options - can be extended based on organization
const DEPARTMENTS = [
     { value: "Engineering", label: "Engineering", icon: "⚙️" },
     { value: "Operations", label: "Operations", icon: "🏭" },
     { value: "Safety", label: "Safety & Compliance", icon: "🛡️" },
     { value: "Finance", label: "Finance", icon: "💰" },
     { value: "HR", label: "Human Resources", icon: "👥" },
     { value: "IT", label: "Information Technology", icon: "💻" },
     { value: "Management", label: "Management", icon: "📊" },
];

// Access level configurations
const ACCESS_LEVELS = [
     {
          value: "public" as AccessLevel,
          label: "Public",
          description: "Everyone in the company",
          icon: Globe,
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
     },
     {
          value: "department" as AccessLevel,
          label: "Department Only",
          description: "Only users in selected department",
          icon: Building2,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
     },
     {
          value: "managers_only" as AccessLevel,
          label: "Managers Only",
          description: "Only managers in selected department",
          icon: UserCheck,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
     },
     {
          value: "custom" as AccessLevel,
          label: "Custom Access",
          description: "Specific users by email",
          icon: Users,
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
     },
];

export function AccessSettingsPanel({
     accessRules,
     onAccessRulesChange,
     userDepartment = "Engineering",
}: AccessSettingsPanelProps) {
     const [isOpen, setIsOpen] = useState(true);
     const [emailInput, setEmailInput] = useState("");

     const currentLevel = ACCESS_LEVELS.find(
          (level) => level.value === accessRules.access_level
     ) || ACCESS_LEVELS[0];

     const handleAccessLevelChange = (value: AccessLevel) => {
          const newRules: AccessRules = {
               access_level: value,
          };

          // Set default department for department-based access
          if (value === "department" || value === "managers_only") {
               newRules.target_department = accessRules.target_department || userDepartment;
          }

          // Preserve custom users if switching back to custom
          if (value === "custom") {
               newRules.allowed_users = accessRules.allowed_users || [];
          }

          onAccessRulesChange(newRules);
     };

     const handleDepartmentChange = (department: string) => {
          onAccessRulesChange({
               ...accessRules,
               target_department: department,
          });
     };

     const addEmail = () => {
          if (!emailInput.trim()) return;

          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailInput.trim())) {
               return;
          }

          const newEmails = [...(accessRules.allowed_users || [])];
          if (!newEmails.includes(emailInput.trim())) {
               newEmails.push(emailInput.trim());
               onAccessRulesChange({
                    ...accessRules,
                    allowed_users: newEmails,
               });
          }
          setEmailInput("");
     };

     const removeEmail = (email: string) => {
          const newEmails = (accessRules.allowed_users || []).filter(
               (e) => e !== email
          );
          onAccessRulesChange({
               ...accessRules,
               allowed_users: newEmails,
          });
     };

     const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === "Enter") {
               e.preventDefault();
               addEmail();
          }
     };

     return (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
               <CollapsibleTrigger className="w-full">
                    <div className="glass-card p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors cursor-pointer">
                         <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg ${currentLevel.bgColor} flex items-center justify-center`}>
                                   <Shield className={`w-5 h-5 ${currentLevel.color}`} />
                              </div>
                              <div className="text-left">
                                   <p className="font-medium flex items-center gap-2">
                                        Access Settings
                                        <Badge variant="outline" className={`${currentLevel.color} border-current`}>
                                             {currentLevel.label}
                                        </Badge>
                                   </p>
                                   <p className="text-sm text-muted-foreground">
                                        {currentLevel.description}
                                   </p>
                              </div>
                         </div>
                         <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </div>
               </CollapsibleTrigger>

               <CollapsibleContent>
                    <div className="glass-card mt-2 p-4 space-y-4 animate-fade-in">
                         {/* Access Level Selector */}
                         <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                   <Lock className="w-4 h-4 text-muted-foreground" />
                                   Access Level
                              </label>
                              <Select
                                   value={accessRules.access_level}
                                   onValueChange={(value) => handleAccessLevelChange(value as AccessLevel)}
                              >
                                   <SelectTrigger className="w-full">
                                        <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent>
                                        {ACCESS_LEVELS.map((level) => (
                                             <SelectItem key={level.value} value={level.value}>
                                                  <div className="flex items-center gap-2">
                                                       <level.icon className={`w-4 h-4 ${level.color}`} />
                                                       <span>{level.label}</span>
                                                       <span className="text-xs text-muted-foreground">
                                                            - {level.description}
                                                       </span>
                                                  </div>
                                             </SelectItem>
                                        ))}
                                   </SelectContent>
                              </Select>
                         </div>

                         {/* Department Selector - shown for department and managers_only */}
                         {(accessRules.access_level === "department" ||
                              accessRules.access_level === "managers_only") && (
                                   <div className="space-y-2 animate-fade-in">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                             <Building2 className="w-4 h-4 text-muted-foreground" />
                                             Target Department
                                        </label>
                                        <Select
                                             value={accessRules.target_department || userDepartment}
                                             onValueChange={handleDepartmentChange}
                                        >
                                             <SelectTrigger className="w-full">
                                                  <SelectValue />
                                             </SelectTrigger>
                                             <SelectContent>
                                                  {DEPARTMENTS.map((dept) => (
                                                       <SelectItem key={dept.value} value={dept.value}>
                                                            <div className="flex items-center gap-2">
                                                                 <span>{dept.icon}</span>
                                                                 <span>{dept.label}</span>
                                                            </div>
                                                       </SelectItem>
                                                  ))}
                                             </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                             {accessRules.access_level === "managers_only"
                                                  ? "Only managers in this department can access"
                                                  : "All users in this department can access"}
                                        </p>
                                   </div>
                              )}

                         {/* Email Input - shown for custom access */}
                         {accessRules.access_level === "custom" && (
                              <div className="space-y-3 animate-fade-in">
                                   <label className="text-sm font-medium flex items-center gap-2">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        Allowed Users
                                   </label>

                                   <div className="flex gap-2">
                                        <Input
                                             type="email"
                                             placeholder="Enter email address"
                                             value={emailInput}
                                             onChange={(e) => setEmailInput(e.target.value)}
                                             onKeyDown={handleKeyDown}
                                             className="flex-1"
                                        />
                                        <Button
                                             type="button"
                                             variant="secondary"
                                             size="icon"
                                             onClick={addEmail}
                                             disabled={!emailInput.trim()}
                                        >
                                             <Plus className="w-4 h-4" />
                                        </Button>
                                   </div>

                                   {/* Email Tags */}
                                   {accessRules.allowed_users && accessRules.allowed_users.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                             {accessRules.allowed_users.map((email) => (
                                                  <Badge
                                                       key={email}
                                                       variant="secondary"
                                                       className="flex items-center gap-1 px-2 py-1"
                                                  >
                                                       <span className="truncate max-w-[200px]">{email}</span>
                                                       <button
                                                            type="button"
                                                            onClick={() => removeEmail(email)}
                                                            className="ml-1 hover:text-destructive transition-colors"
                                                       >
                                                            <X className="w-3 h-3" />
                                                       </button>
                                                  </Badge>
                                             ))}
                                        </div>
                                   )}

                                   <p className="text-xs text-muted-foreground">
                                        Only these specific users can access this document
                                   </p>
                              </div>
                         )}

                         {/* Access Summary */}
                         <div className="pt-3 border-t border-border">
                              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                   <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                                   <div>
                                        <strong>Access Summary:</strong>
                                        {accessRules.access_level === "public" && (
                                             <span> All authenticated users can view this document.</span>
                                        )}
                                        {accessRules.access_level === "department" && (
                                             <span> Users in <strong>{accessRules.target_department || userDepartment}</strong> department can view.</span>
                                        )}
                                        {accessRules.access_level === "managers_only" && (
                                             <span> Only <strong>managers</strong> in <strong>{accessRules.target_department || userDepartment}</strong> can view.</span>
                                        )}
                                        {accessRules.access_level === "custom" && (
                                             <span> {accessRules.allowed_users?.length || 0} specific user(s) + you can view.</span>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>
               </CollapsibleContent>
          </Collapsible>
     );
}
