/**
 * DigitalBadgeHeader - K-LENS Digital Identity Hub
 * 
 * The "Holographic ID Card" component that displays worker identity,
 * shift status, safety score, and quick actions (Emergency SOS, Handover).
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { ClearanceLevelLabels, type ShiftStatus } from "@/types/auth";
import {
     User,
     MapPin,
     Shield,
     Clock,
     AlertTriangle,
     RefreshCw,
     QrCode,
     Phone,
     Heart,
     Zap
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import "@/styles/digital-badge.css";

interface ProfileData {
     id: number;
     user_id: string;
     employee_id: string;
     clearance_level: number;
     emergency_contact_name?: string;
     emergency_contact_phone?: string;
     blood_type?: string;
     medical_tags?: string[];
     safety_score: number;
     shift_status: ShiftStatus;
     current_shift_start?: string;
     current_shift_end?: string;
     current_location?: string;
     shift_time_remaining?: string;
     expertise_tags?: string[];
}

export function DigitalBadgeHeader() {
     const { user, cinderellaAccess } = useAuth();
     const [profile, setProfile] = useState<ProfileData | null>(null);
     const [loading, setLoading] = useState(true);
     const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
     const [sosLoading, setSosLoading] = useState(false);
     const [handoverLoading, setHandoverLoading] = useState(false);

     // Fetch profile data
     useEffect(() => {
          const fetchProfile = async () => {
               try {
                    const data = await api.getProfile();
                    setProfile(data);

                    // Generate QR code with employee ID
                    if (data.employee_id) {
                         const qrData = JSON.stringify({
                              type: "KLENS_EMPLOYEE",
                              id: data.employee_id,
                              name: user?.name,
                              clearance: data.clearance_level,
                              timestamp: new Date().toISOString()
                         });
                         const url = await QRCode.toDataURL(qrData, {
                              width: 80,
                              margin: 1,
                              color: { dark: "#1e293b", light: "#ffffff" }
                         });
                         setQrCodeUrl(url);
                    }
               } catch (error) {
                    console.error("Failed to fetch profile:", error);
                    // Use mock data for demo
                    setProfile({
                         id: 1,
                         user_id: user?.id || "demo",
                         employee_id: "EMP-8821",
                         clearance_level: 4,
                         emergency_contact_name: "Jane Doe (Wife)",
                         emergency_contact_phone: "555-0199",
                         blood_type: "O+",
                         medical_tags: ["Diabetic"],
                         safety_score: 98,
                         shift_status: "ON_SHIFT",
                         current_location: "Zone B - Boiler Room",
                         shift_time_remaining: "2h 30m",
                         expertise_tags: ["Python", "SCADA Systems", "Technical Writing"]
                    });
               } finally {
                    setLoading(false);
               }
          };

          fetchProfile();
     }, [user]);

     // Handle Emergency SOS
     const handleEmergencySOS = async () => {
          if (sosLoading) return;

          const confirmed = window.confirm(
               "🆘 EMERGENCY SOS\n\nThis will alert all supervisors and log your location.\n\nAre you sure you want to trigger an emergency alert?"
          );

          if (!confirmed) return;

          setSosLoading(true);
          try {
               const result = await api.triggerEmergencySOS(
                    "Emergency SOS triggered from profile",
                    profile?.current_location
               );

               toast.success("🆘 Emergency SOS Triggered!", {
                    description: result.message,
                    duration: 10000
               });
          } catch (error) {
               toast.error("Failed to trigger SOS. Please call emergency services directly.");
          } finally {
               setSosLoading(false);
          }
     };

     // Handle Shift Handover
     const handleHandover = async () => {
          if (handoverLoading) return;

          setHandoverLoading(true);
          try {
               const result = await api.initiateHandover(
                    undefined,
                    "Shift handover initiated from Digital Badge",
                    ["Review pending approvals", "Check equipment status"]
               );

               toast.success("🔄 Handover Initiated!", {
                    description: `Handover #${result.handover_id} created. Status: ${result.status}`,
                    duration: 5000
               });
          } catch (error) {
               toast.error("Failed to initiate handover");
          } finally {
               setHandoverLoading(false);
          }
     };

     // Get shift status styling
     const getShiftStatusClass = (status: ShiftStatus) => {
          switch (status) {
               case "ON_SHIFT": return "status-on-shift";
               case "ON_BREAK": return "status-on-break";
               case "OFF_SHIFT": return "status-off-shift";
               default: return "status-off-shift";
          }
     };

     const getShiftStatusLabel = (status: ShiftStatus) => {
          switch (status) {
               case "ON_SHIFT": return "On Shift";
               case "ON_BREAK": return "On Break";
               case "OFF_SHIFT": return "Off Duty";
               default: return "Unknown";
          }
     };

     // Get safety score color
     const getSafetyScoreClass = (score: number) => {
          if (score >= 80) return "safety-high";
          if (score >= 50) return "safety-medium";
          return "safety-low";
     };

     // Calculate stroke offset for safety ring
     const getSafetyStrokeOffset = (score: number) => {
          const circumference = 251.2; // 2 * PI * 40
          return circumference - (score / 100) * circumference;
     };

     if (loading) {
          return (
               <div className="holographic-card p-6 animate-pulse">
                    <div className="h-32 bg-slate-800/50 rounded-lg"></div>
               </div>
          );
     }

     if (!profile) return null;

     return (
          <div className={`${cinderellaAccess ? "cinderella-active" : ""}`}>
               <div className="holographic-card p-6">
                    <div className="flex flex-col lg:flex-row gap-6">

                         {/* LEFT: Holographic ID Card */}
                         <div className="flex items-start gap-4 flex-1">
                              {/* Hexagon Avatar */}
                              <div className="hexagon-avatar">
                                   <div className="hexagon-avatar-inner">
                                        <User className="w-10 h-10 text-slate-400" />
                                   </div>
                              </div>

                              <div className="flex-1">
                                   {/* Name & Employee ID */}
                                   <h2 className="text-xl font-bold text-white mb-1">
                                        {user?.name || "Unknown User"}
                                   </h2>
                                   <p className="text-sm text-slate-400 font-mono mb-2">
                                        #{profile.employee_id}
                                   </p>

                                   {/* Clearance Level Badge */}
                                   <div className={`clearance-badge clearance-${profile.clearance_level} inline-block`}>
                                        {ClearanceLevelLabels[profile.clearance_level] || "UNKNOWN CLEARANCE"}
                                   </div>

                                   {/* Cinderella Timer (if active) */}
                                   {cinderellaAccess && (
                                        <div className="mt-2 flex items-center gap-2">
                                             <Zap className="w-4 h-4 text-yellow-500" />
                                             <span className="cinderella-timer">
                                                  Admin Mode: {new Date(cinderellaAccess.expiresAt).toLocaleTimeString()}
                                             </span>
                                        </div>
                                   )}
                              </div>

                              {/* QR Code */}
                              {qrCodeUrl && (
                                   <div className="qr-code-container hidden md:block" title="Scan to verify identity">
                                        <img src={qrCodeUrl} alt="Employee QR Code" className="w-16 h-16" />
                                   </div>
                              )}
                         </div>

                         {/* CENTER: Vital Status */}
                         <div className="flex-1 border-l border-slate-700/50 pl-6">
                              <div className="vital-status-grid">
                                   {/* Shift Status */}
                                   <div className="vital-stat">
                                        <span className="vital-stat-label">Shift Status</span>
                                        <div className={`status-indicator ${getShiftStatusClass(profile.shift_status)}`}>
                                             {getShiftStatusLabel(profile.shift_status)}
                                        </div>
                                        {profile.shift_time_remaining && profile.shift_status === "ON_SHIFT" && (
                                             <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                  <Clock className="w-3 h-3" />
                                                  Ends in {profile.shift_time_remaining}
                                             </span>
                                        )}
                                   </div>

                                   {/* Location */}
                                   <div className="vital-stat">
                                        <span className="vital-stat-label">Location</span>
                                        <span className="vital-stat-value flex items-center gap-1">
                                             <MapPin className="w-4 h-4 text-blue-400" />
                                             {profile.current_location || "Not detected"}
                                        </span>
                                   </div>

                                   {/* Safety Score */}
                                   <div className="vital-stat items-center">
                                        <span className="vital-stat-label">Safety Score</span>
                                        <div className={`safety-score-meter ${getSafetyScoreClass(profile.safety_score)}`}>
                                             <svg className="safety-score-ring w-16 h-16" viewBox="0 0 100 100">
                                                  <circle className="bg" cx="50" cy="50" r="40" />
                                                  <circle
                                                       className="progress"
                                                       cx="50"
                                                       cy="50"
                                                       r="40"
                                                       style={{ strokeDashoffset: getSafetyStrokeOffset(profile.safety_score) }}
                                                  />
                                             </svg>
                                             <div className="safety-score-value">
                                                  <span className="text-lg font-bold">{profile.safety_score}</span>
                                                  <span className="text-[10px] text-slate-500">/100</span>
                                             </div>
                                        </div>
                                   </div>
                              </div>

                              {/* Expertise Tags */}
                              {profile.expertise_tags && profile.expertise_tags.length > 0 && (
                                   <div className="mt-4 flex flex-wrap gap-2">
                                        {profile.expertise_tags.slice(0, 4).map((tag, i) => (
                                             <span key={i} className="expertise-tag">{tag}</span>
                                        ))}
                                        {profile.expertise_tags.length > 4 && (
                                             <span className="expertise-tag">+{profile.expertise_tags.length - 4}</span>
                                        )}
                                   </div>
                              )}
                         </div>

                         {/* RIGHT: Quick Actions */}
                         <div className="flex flex-col gap-3 lg:border-l lg:border-slate-700/50 lg:pl-6">
                              <button
                                   className="btn-emergency-sos"
                                   onClick={handleEmergencySOS}
                                   disabled={sosLoading}
                              >
                                   <AlertTriangle className="w-5 h-5" />
                                   {sosLoading ? "Alerting..." : "Emergency SOS"}
                              </button>

                              <button
                                   className="btn-handover"
                                   onClick={handleHandover}
                                   disabled={handoverLoading}
                              >
                                   <RefreshCw className={`w-5 h-5 ${handoverLoading ? "animate-spin" : ""}`} />
                                   {handoverLoading ? "Initiating..." : "Handover Shift"}
                              </button>

                              {/* Emergency Contact (small) */}
                              {profile.emergency_contact_name && (
                                   <div className="mt-2 p-2 bg-slate-800/50 rounded-lg">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                             <Phone className="w-3 h-3" />
                                             <span className="truncate">{profile.emergency_contact_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                             <Heart className="w-3 h-3 text-red-400" />
                                             <span>{profile.blood_type || "Blood type not set"}</span>
                                        </div>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>
          </div>
     );
}
