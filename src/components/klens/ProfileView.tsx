/**
 * ProfileView - K-LENS Digital Identity Hub
 * 
 * Main profile page containing:
 * - DigitalBadgeHeader (Holographic ID Card)
 * - ProfileTabs (Overview, Identity Wallet, Security)
 */

import { DigitalBadgeHeader } from "./DigitalBadgeHeader";
import { ProfileTabs } from "./ProfileTabs";

export function ProfileView() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Digital Badge Header - The "Holographic ID Card" */}
      <DigitalBadgeHeader />

      {/* Tabbed Content Area */}
      <ProfileTabs />
    </div>
  );
}
