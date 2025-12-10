import { useState } from "react";
import { SidebarAndHeader } from "@/components/layout/SidebarAndHeader";
import { Language, SUPPORTED_LANGUAGES, useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useKiosk } from "@/components/klens/KioskProvider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Languages, Globe, Palette, Lock, Shield, Eye, EyeOff, Check, X } from "lucide-react";

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const { setKioskPin, user } = useAuth();
  const { isKioskMode, enableKiosk, disableKiosk, lockScreen } = useKiosk();
  
  // PIN setup state
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const handleSetPin = async () => {
    setPinError(null);
    
    // Validation
    if (pin.length !== 4) {
      setPinError("PIN must be exactly 4 digits");
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setPinError("PIN must contain only numbers");
      return;
    }
    if (pin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }

    setIsSettingPin(true);
    try {
      await setKioskPin(pin);
      toast.success("Kiosk PIN set successfully! 🔐");
      setPin("");
      setConfirmPin("");
    } catch (error: any) {
      setPinError(error.message || "Failed to set PIN");
      toast.error("Failed to set PIN");
    } finally {
      setIsSettingPin(false);
    }
  };

  const handleToggleKiosk = () => {
    if (isKioskMode) {
      disableKiosk();
      toast.info("Kiosk mode disabled");
    } else {
      enableKiosk();
      toast.success("Kiosk mode enabled - Screen will lock after 5 minutes of inactivity");
    }
  };

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

          {/* Kiosk PIN Security Card */}
          <div className="glass-card p-6 rounded-xl border border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{t("Kiosk Mode & Security", "Kiosk Mode & Security")}</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("Set up a 4-digit PIN for quick screen unlock on shared factory terminals.", "Set up a 4-digit PIN for quick screen unlock on shared factory terminals.")}
                </p>

                {/* Kiosk Mode Toggle */}
                <div className="flex items-center justify-between mb-6 p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t("Factory Kiosk Mode", "Factory Kiosk Mode")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("Auto-lock screen after 5 minutes of inactivity", "Auto-lock screen after 5 minutes of inactivity")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleKiosk}
                    className={`
                      relative w-14 h-7 rounded-full transition-colors duration-200
                      ${isKioskMode ? 'bg-emerald-500' : 'bg-slate-600'}
                    `}
                  >
                    <div
                      className={`
                        absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200
                        ${isKioskMode ? 'translate-x-8' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                {/* PIN Setup Form */}
                <div className="space-y-4 max-w-md">
                  <label className="text-sm font-medium block">{t("Set/Change Kiosk PIN", "Set/Change Kiosk PIN")}</label>
                  
                  {/* New PIN */}
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      value={pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPin(val);
                        setPinError(null);
                      }}
                      placeholder="Enter 4-digit PIN"
                      className="w-full h-11 px-4 pr-10 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-lg tracking-widest"
                      maxLength={4}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Confirm PIN */}
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      value={confirmPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setConfirmPin(val);
                        setPinError(null);
                      }}
                      placeholder="Confirm PIN"
                      className="w-full h-11 px-4 pr-10 rounded-lg bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-lg tracking-widest"
                      maxLength={4}
                    />
                    {confirmPin.length === 4 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {pin === confirmPin ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                      </span>
                    )}
                  </div>

                  {/* Error message */}
                  {pinError && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <X className="w-4 h-4" /> {pinError}
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSetPin}
                    disabled={isSettingPin || pin.length !== 4 || confirmPin.length !== 4}
                    className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isSettingPin ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Setting PIN...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        {t("Set PIN", "Set PIN")}
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Lock Button */}
                {isKioskMode && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <button
                      onClick={lockScreen}
                      className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      {t("Lock Screen Now", "Lock Screen Now")}
                    </button>
                  </div>
                )}
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
