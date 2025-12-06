import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthState, CinderellaAccess } from "@/types/auth";
import { api } from "@/lib/api";

interface AuthContextType extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  grantCinderellaAccess: (duration: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      return {
        user: JSON.parse(userStr),
        token,
        cinderellaAccess: null,
        isAuthenticated: true
      };
    }
    return {
      user: null,
      token: null,
      cinderellaAccess: null,
      isAuthenticated: false
    };
  });

  useEffect(() => {
    if (authState.cinderellaAccess) {
      const timer = setTimeout(() => {
        setAuthState(prev => ({ ...prev, cinderellaAccess: null }));
      }, authState.cinderellaAccess.expiresAt.getTime() - Date.now());
      return () => clearTimeout(timer);
    }
  }, [authState.cinderellaAccess]);

  const login = (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    api.setToken(token);
    setAuthState({
      user,
      token,
      cinderellaAccess: null,
      isAuthenticated: true
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      cinderellaAccess: null,
      isAuthenticated: false
    });
  };

  const grantCinderellaAccess = (durationMinutes: number) => {
    const expiresAt = new Date(Date.now() + durationMinutes * 60000);
    setAuthState(prev => ({
      ...prev,
      cinderellaAccess: {
        grantedBy: "System Admin",
        expiresAt,
        permissions: ["delete", "approve", "override"]
      }
    }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, grantCinderellaAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
