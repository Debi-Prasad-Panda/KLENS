import { useState } from "react";
import { SidebarAndHeader } from "@/components/layout/SidebarAndHeader";
import { Language, SUPPORTED_LANGUAGES, useLanguage } from "@/contexts/LanguageContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Languages, Globe, Palette } from "lucide-react";

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <SidebarAndHeader>
      <div className="container mx-auto px-6 py-8 animate-fade-in max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">{t("Settings", "Settings")}</h1>
          <p className="text-muted-foreground">{t("Manage your application preferences and localization.", "Manage your application preferences and localization.")}</p>
        </div>

        <div className="space-y-6">
          {/* Language Settings Card */}
          <div className="glass-card p-6 rounded-xl border border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{t("Language & Region", "Language & Region")}</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("Select your preferred language for the application interface.", "Select your preferred language for the application interface.")}
                  <br/>
                  {t("Note: AI Insights language is managed separately within the Document Viewer.", "Note: AI Insights language is managed separately within the Document Viewer.")}
                </p>

                <div className="flex flex-col gap-2 max-w-md">
                  <label className="text-sm font-medium">{t("Interface Language", "Interface Language")}</label>
                  <Select 
                    value={language} 
                    onValueChange={(value: any) => {
                      setLanguage(value);
                      toast.success(`Interface language changed to ${value}`);
                    }}
                  >
                    <SelectTrigger className="w-full bg-secondary/50 border-border h-11 rounded-lg">
                       <div className="flex items-center gap-2">
                          <Languages className="w-4 h-4 text-muted-foreground" />
                          <SelectValue placeholder={t("Select Language", "Select Language")} />
                       </div>
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("Current", "Current")}: <strong>{language}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Placeholder (Future) */}
          <div className="glass-card p-6 rounded-xl border border-border opacity-60">
             <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Palette className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{t("Appearance", "Appearance")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("Theme selection (Dark/Light) is currently managed by the system.", "Theme selection (Dark/Light) is currently managed by the system.")}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </SidebarAndHeader>
  );
}
