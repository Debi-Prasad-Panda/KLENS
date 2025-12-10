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
