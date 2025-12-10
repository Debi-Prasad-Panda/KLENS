export type UserRole = "ADMIN" | "MANAGER" | "ENGINEER" | "OPERATOR" | "SAFETY_OFFICER";

// For backwards compatibility with existing code
export type LegacyUserRole = "admin" | "manager" | "engineer" | "safety_officer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string | null;
  avatar?: string;
}

export interface IndustrialContext {
  shiftPattern: "MORNING" | "AFTERNOON" | "NIGHT" | null;
  currentStatus: "ON_SHIFT" | "ON_BREAK" | "OFF_SHIFT";
  isOnShift: boolean;
  hasExpiredCerts: boolean;
  expiredCertCount: number;
}

export interface CinderellaAccess {
  grantedBy: string;
  expiresAt: Date;
  permissions: string[];
}

export interface Certification {
  id: string;
  certName: string;
  certIssuer?: string;
  issueDate?: string;
  expiryDate: string;
  status: "VALID" | "EXPIRED" | "REVOKED";
  documentUrl?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  industrialContext: IndustrialContext | null;
  cinderellaAccess: CinderellaAccess | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Response types
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    role: UserRole;
    department: string | null;
    shift_pattern: string | null;
    current_status: string;
    is_on_shift: boolean;
    has_expired_certs: boolean;
  };
}

// ==================== DIGITAL IDENTITY HUB ====================

export type ShiftStatus = "ON_SHIFT" | "ON_BREAK" | "OFF_SHIFT";

export enum ClearanceLevel {
  LEVEL_1 = 1, // Basic Access
  LEVEL_2 = 2, // Standard Access
  LEVEL_3 = 3, // Elevated Access
  LEVEL_4 = 4, // Restricted Access
  LEVEL_5 = 5, // Maximum Clearance
}

export const ClearanceLevelLabels: Record<number, string> = {
  1: "LEVEL 1: BASIC ACCESS",
  2: "LEVEL 2: STANDARD ACCESS",
  3: "LEVEL 3: ELEVATED ACCESS",
  4: "LEVEL 4: RESTRICTED ACCESS",
  5: "LEVEL 5: MAXIMUM CLEARANCE",
};

export interface UserProfile {
  id: number;
  user_id: string;

  // Identity
  employeeId: string;
  clearanceLevel: number;  // 1-5

  // Health & Safety
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  medicalTags?: string[];
  safetyScore: number;  // 0-100

  // Shift Context
  shiftStatus: ShiftStatus;
  currentShiftStart?: Date | string;
  currentShiftEnd?: Date | string;
  currentLocation?: string;
  shiftTimeRemaining?: string;  // "2h 30m"

  // Skills / AI Persona
  expertiseTags: string[];
  voiceSettings?: {
    speed: number;
    autoListen: boolean;
    wakeWord?: string;
  };
}

export interface EmergencySOSResponse {
  success: boolean;
  sos_id: number;
  message: string;
  notified_supervisors: string[];
}

export interface HandoverResponse {
  handover_id: number;
  status: string;
  from_user_id: string;
  to_user_id?: string;
}
