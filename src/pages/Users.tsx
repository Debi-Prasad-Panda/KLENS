/**
 * Users Page - Workforce Management
 * Admin-only page for managing workforce
 */

import { SidebarAndHeader } from "@/components/layout/SidebarAndHeader";
import { WorkforceCommandCenter } from "@/components/klens/WorkforceCommandCenter";

export default function Users() {
  return (
    <SidebarAndHeader>
      <WorkforceCommandCenter />
    </SidebarAndHeader>
  );
}
