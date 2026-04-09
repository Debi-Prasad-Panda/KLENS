/**
 * K-LENS Industrial Auth Context
 * 
 * Provides authentication state and methods using Supabase Auth.
 * Includes industrial context (shift status, certifications).
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase, getAccessToken } from "@/lib/supabase";
import { User, AuthState, IndustrialContext, CinderellaAccess, UserRole, AuthResponse } from "@/types/auth";
import { api } from "@/lib/api";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: UserRole, department?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshIndustrialContext: () => Promise<void>;
  updateShiftStatus: (status: "ON_SHIFT" | "ON_BREAK" | "OFF_SHIFT") => Promise<void>;
  setKioskPin: (pin: string) => Promise<void>;
  verifyKioskPin: (pin: string) => Promise<boolean>;
  grantCinderellaAccess: (duration: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Transform Supabase user to our User type
const transformUser = (
  supabaseUser: SupabaseUser | null,
  profile?: AuthResponse["user"] | null
): User | null => {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name: profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email || "",
    role: (((profile?.role as string) || (supabaseUser.user_metadata?.role as string) || "OPERATOR").toUpperCase() as UserRole),
    department: profile?.department || supabaseUser.user_metadata?.department || null,
    avatar: supabaseUser.user_metadata?.avatar_url,
  };
};

// Transform profile to IndustrialContext
const transformIndustrialContext = (profile: AuthResponse["user"] | null): IndustrialContext | null => {
  if (!profile) return null;

  return {
    shiftPattern: profile.shift_pattern as IndustrialContext["shiftPattern"],
    currentStatus: (profile.current_status as IndustrialContext["currentStatus"]) || "OFF_SHIFT",
    isOnShift: profile.is_on_shift ?? true,
    hasExpiredCerts: profile.has_expired_certs ?? false,
    expiredCertCount: 0,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    industrialContext: null,
    cinderellaAccess: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Fetch industrial context from backend
  const fetchIndustrialContext = useCallback(async (accessToken: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const profile = await response.json();
        return profile as AuthResponse["user"];
      }
    } catch (error) {
      console.error("Failed to fetch industrial context:", error);
    }
    return null;
  }, []);

  // Initialize auth state from Supabase session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Auth session initialization timed out")), 6000)
          ),
        ]);

        const { data: { session } } = sessionResult;

        if (session?.user && session.access_token) {
          // Set token for API client
          api.setToken(session.access_token);

          // Fetch industrial context
          const profile = await fetchIndustrialContext(session.access_token);

          setAuthState({
            user: transformUser(session.user, profile),
            token: session.access_token,
            industrialContext: transformIndustrialContext(profile),
            cinderellaAccess: null,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);

        if (event === "SIGNED_IN" && session?.user && session.access_token) {
          api.setToken(session.access_token);
          const profile = await fetchIndustrialContext(session.access_token);

          setAuthState({
            user: transformUser(session.user, profile),
            token: session.access_token,
            industrialContext: transformIndustrialContext(profile),
            cinderellaAccess: null,
            isAuthenticated: true,
            isLoading: false,
          });
        } else if (event === "SIGNED_OUT") {
          setAuthState({
            user: null,
            token: null,
            industrialContext: null,
            cinderellaAccess: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } else if (event === "TOKEN_REFRESHED" && session?.access_token) {
          api.setToken(session.access_token);
          setAuthState(prev => ({ ...prev, token: session.access_token }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchIndustrialContext]);

  // Cinderella access timer
  useEffect(() => {
    if (authState.cinderellaAccess) {
      const timer = setTimeout(() => {
        setAuthState(prev => ({ ...prev, cinderellaAccess: null }));
      }, authState.cinderellaAccess.expiresAt.getTime() - Date.now());
      return () => clearTimeout(timer);
    }
  }, [authState.cinderellaAccess]);

  // Login with email/password
  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session?.access_token) {
        api.setToken(data.session.access_token);
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error(error.message || "Login failed");
    }
  };

  // Register new user
  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole = "OPERATOR",
    department?: string
  ) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role,
            department,
          },
        },
      });

      if (error) throw error;

      if (data.session?.access_token) {
        api.setToken(data.session.access_token);
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error(error.message || "Registration failed");
    }
  };

  // Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      api.setToken("");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Refresh industrial context
  const refreshIndustrialContext = async () => {
    const token = await getAccessToken();
    if (token) {
      const profile = await fetchIndustrialContext(token);
      setAuthState(prev => ({
        ...prev,
        industrialContext: transformIndustrialContext(profile),
      }));
    }
  };

  // Update shift status
  const updateShiftStatus = async (status: "ON_SHIFT" | "ON_BREAK" | "OFF_SHIFT") => {
    const token = await getAccessToken();
    if (!token) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/shift-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      await refreshIndustrialContext();
    } catch (error) {
      console.error("Failed to update shift status:", error);
    }
  };

  // Set kiosk PIN
  const setKioskPin = async (pin: string) => {
    const token = await getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/kiosk/set-pin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pin }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to set PIN");
    }
  };

  // Verify kiosk PIN
  const verifyKioskPin = async (pin: string): Promise<boolean> => {
    const token = await getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/kiosk/verify-pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pin }),
      });

      return response.ok;
    } catch {
      return false;
    }
  };

  // Grant Cinderella access (time-limited elevated permissions)
  const grantCinderellaAccess = (durationMinutes: number) => {
    const expiresAt = new Date(Date.now() + durationMinutes * 60000);
    setAuthState(prev => ({
      ...prev,
      cinderellaAccess: {
        grantedBy: "System Admin",
        expiresAt,
        permissions: ["delete", "approve", "override"],
      },
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        refreshIndustrialContext,
        updateShiftStatus,
        setKioskPin,
        verifyKioskPin,
        grantCinderellaAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
