/**
 * IdentityWalletTab - Certifications & Skills
 * 
 * Contains:
 * - Certification cards grid (credit card style)
 * - Status indicators (valid, expiring, expired)
 * - Skill Matrix with endorsement tags
 */

import { useState } from "react";
import {
     Award,
     Calendar,
     AlertTriangle,
     CheckCircle,
     XCircle,
     Plus,
     ExternalLink,
     Star,
     User
} from "lucide-react";
import { toast } from "sonner";

// Mock certifications data
const MOCK_CERTIFICATIONS = [
     {
          id: 1,
          name: "High Voltage Safety",
          issuer: "OSHA",
          issuerLogo: "⚡",
          issueDate: "2024-01-15",
          expiryDate: "2026-01-15",
          status: "valid",
          documentUrl: "#",
     },
     {
          id: 2,
          name: "Industrial First Aid",
          issuer: "Red Cross",
          issuerLogo: "🏥",
          issueDate: "2023-06-20",
          expiryDate: "2024-12-25",
          status: "expiring",
          documentUrl: "#",
     },
     {
          id: 3,
          name: "Forklift Operator",
          issuer: "OSHA",
          issuerLogo: "🚜",
          issueDate: "2022-03-10",
          expiryDate: "2024-03-10",
          status: "expired",
          documentUrl: "#",
     },
     {
          id: 4,
          name: "ISO 9001 Auditor",
          issuer: "ISO",
          issuerLogo: "📋",
          issueDate: "2024-05-01",
          expiryDate: "2027-05-01",
          status: "valid",
          documentUrl: "#",
     },
];

// Mock skills with endorsements
const MOCK_SKILLS = [
     { name: "Python", endorsements: 5, endorsed_by: ["John D.", "Sarah M."] },
     { name: "SCADA Systems", endorsements: 3, endorsed_by: ["Mike R."] },
     { name: "Technical Writing", endorsements: 4, endorsed_by: ["Lisa K.", "Tom B."] },
     { name: "Industrial Safety", endorsements: 7, endorsed_by: ["Safety Team"] },
     { name: "PLC Programming", endorsements: 2, endorsed_by: ["Engineering Dept"] },
     { name: "Welding", endorsements: 1, endorsed_by: ["Workshop Lead"] },
];

export function IdentityWalletTab() {
     const [selectedCert, setSelectedCert] = useState<number | null>(null);

     const getStatusStyles = (status: string) => {
          switch (status) {
               case "valid":
                    return {
                         border: "border-emerald-500/50",
                         bg: "bg-emerald-900/20",
                         text: "text-emerald-400",
                         icon: CheckCircle,
                         label: "Valid",
                    };
               case "expiring":
                    return {
                         border: "border-amber-500/50",
                         bg: "bg-amber-900/20",
                         text: "text-amber-400",
                         icon: AlertTriangle,
                         label: "Expiring Soon",
                    };
               case "expired":
                    return {
                         border: "border-red-500/50",
                         bg: "bg-red-900/20",
                         text: "text-red-400",
                         icon: XCircle,
                         label: "Expired",
                    };
               default:
                    return {
                         border: "border-slate-500/50",
                         bg: "bg-slate-900/20",
                         text: "text-slate-400",
                         icon: Award,
                         label: "Unknown",
                    };
          }
     };

     const formatDate = (dateStr: string) => {
          const date = new Date(dateStr);
          return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
     };

     const handleRenew = (certName: string) => {
          toast.info(`Renewing ${certName}...`, {
               description: "You will be redirected to the certification portal.",
          });
     };

     const handleUpload = (certName: string) => {
          toast.info(`Upload new certificate for ${certName}`, {
               description: "Select file to upload replacement certificate.",
          });
     };

     return (
          <div className="space-y-8">
               {/* Certifications Section */}
               <div>
                    <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-purple-600/20">
                                   <Award className="w-5 h-5 text-purple-400" />
                              </div>
                              <div>
                                   <h3 className="font-semibold text-white">Certifications</h3>
                                   <p className="text-xs text-slate-400">{MOCK_CERTIFICATIONS.length} certificates in wallet</p>
                              </div>
                         </div>
                         <button className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm transition-colors">
                              <Plus className="w-4 h-4" />
                              Add New
                         </button>
                    </div>

                    {/* Certification Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {MOCK_CERTIFICATIONS.map((cert) => {
                              const styles = getStatusStyles(cert.status);
                              const StatusIcon = styles.icon;

                              return (
                                   <div
                                        key={cert.id}
                                        className={`relative p-5 rounded-xl border ${styles.border} ${styles.bg} overflow-hidden transition-all hover:scale-[1.02] cursor-pointer`}
                                        onClick={() => setSelectedCert(selectedCert === cert.id ? null : cert.id)}
                                   >
                                        {/* Card background pattern */}
                                        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                                             <Award className="w-full h-full" />
                                        </div>

                                        {/* Top row: Issuer and Status */}
                                        <div className="flex items-center justify-between mb-3">
                                             <div className="flex items-center gap-2">
                                                  <span className="text-2xl">{cert.issuerLogo}</span>
                                                  <span className="text-xs text-slate-400 uppercase tracking-wider">{cert.issuer}</span>
                                             </div>
                                             <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${styles.bg} ${styles.text} text-xs`}>
                                                  <StatusIcon className="w-3 h-3" />
                                                  {styles.label}
                                             </div>
                                        </div>

                                        {/* Cert Name */}
                                        <h4 className="text-lg font-semibold text-white mb-3">{cert.name}</h4>

                                        {/* Dates */}
                                        <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                                             <div className="flex items-center gap-1">
                                                  <Calendar className="w-3 h-3" />
                                                  <span>Issued: {formatDate(cert.issueDate)}</span>
                                             </div>
                                             <div className="flex items-center gap-1">
                                                  <Calendar className="w-3 h-3" />
                                                  <span className={cert.status === "expired" ? "text-red-400" : ""}>
                                                       Exp: {formatDate(cert.expiryDate)}
                                                  </span>
                                             </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                             {cert.status === "expiring" && (
                                                  <button
                                                       onClick={(e) => { e.stopPropagation(); handleRenew(cert.name); }}
                                                       className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
                                                  >
                                                       Renew Now
                                                  </button>
                                             )}
                                             {cert.status === "expired" && (
                                                  <button
                                                       onClick={(e) => { e.stopPropagation(); handleUpload(cert.name); }}
                                                       className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                                                  >
                                                       Upload New
                                                  </button>
                                             )}
                                             <button
                                                  onClick={(e) => { e.stopPropagation(); }}
                                                  className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg text-sm transition-colors"
                                             >
                                                  <ExternalLink className="w-4 h-4" />
                                             </button>
                                        </div>
                                   </div>
                              );
                         })}
                    </div>
               </div>

               {/* Skills Matrix Section */}
               <div>
                    <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-600/20">
                                   <Star className="w-5 h-5 text-blue-400" />
                              </div>
                              <div>
                                   <h3 className="font-semibold text-white">Skill Matrix</h3>
                                   <p className="text-xs text-slate-400">AI-powered skill tracking</p>
                              </div>
                         </div>
                         <button className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm transition-colors">
                              <Plus className="w-4 h-4" />
                              Add Skill
                         </button>
                    </div>

                    {/* Skills Tags */}
                    <div className="glass-card p-5 rounded-xl border border-slate-700/50">
                         <div className="flex flex-wrap gap-3">
                              {MOCK_SKILLS.map((skill, idx) => (
                                   <div
                                        key={idx}
                                        className="group relative flex items-center gap-2 px-4 py-2 bg-blue-900/20 border border-blue-600/30 rounded-lg hover:border-blue-500/50 transition-colors cursor-pointer"
                                   >
                                        <span className="text-sm text-blue-300">{skill.name}</span>
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                             <User className="w-3 h-3" />
                                             <span>{skill.endorsements}</span>
                                        </div>

                                        {/* Tooltip with endorsers */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 rounded-lg text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                             <p className="font-medium text-white mb-1">Endorsed by:</p>
                                             {skill.endorsed_by.map((name, i) => (
                                                  <p key={i}>• {name}</p>
                                             ))}
                                        </div>
                                   </div>
                              ))}
                         </div>

                         <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-500">
                              <p>💡 Skills are verified by AI from your document interactions and endorsed by supervisors.</p>
                         </div>
                    </div>
               </div>
          </div>
     );
}
