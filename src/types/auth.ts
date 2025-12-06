export type UserRole = "admin" | "manager" | "engineer" | "safety_officer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export interface CinderellaAccess {
  grantedBy: string;
  expiresAt: Date;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  cinderellaAccess: CinderellaAccess | null;
  isAuthenticated: boolean;
}
