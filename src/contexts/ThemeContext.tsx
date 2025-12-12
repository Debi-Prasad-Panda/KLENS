/**
 * ThemeContext - K-LENS Theme Provider
 * Manages light/dark theme switching with localStorage persistence
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
     theme: Theme;
     resolvedTheme: 'dark' | 'light';
     setTheme: (theme: Theme) => void;
     toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
     children: ReactNode;
     defaultTheme?: Theme;
     storageKey?: string;
}

export function ThemeProvider({
     children,
     defaultTheme = 'dark',
     storageKey = 'klens-theme'
}: ThemeProviderProps) {
     const [theme, setThemeState] = useState<Theme>(() => {
          // Try to get from localStorage
          if (typeof window !== 'undefined') {
               const stored = localStorage.getItem(storageKey);
               if (stored === 'dark' || stored === 'light' || stored === 'system') {
                    return stored;
               }
          }
          return defaultTheme;
     });

     const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

     // Resolve system theme
     useEffect(() => {
          const getSystemTheme = () => {
               if (typeof window !== 'undefined') {
                    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
               }
               return 'dark';
          };

          const resolved = theme === 'system' ? getSystemTheme() : theme;
          setResolvedTheme(resolved);

          // Apply theme to document
          const root = document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(resolved);

          // Store in localStorage
          localStorage.setItem(storageKey, theme);

          // Listen for system theme changes
          if (theme === 'system') {
               const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
               const handler = (e: MediaQueryListEvent) => {
                    setResolvedTheme(e.matches ? 'dark' : 'light');
                    root.classList.remove('light', 'dark');
                    root.classList.add(e.matches ? 'dark' : 'light');
               };
               mediaQuery.addEventListener('change', handler);
               return () => mediaQuery.removeEventListener('change', handler);
          }
     }, [theme, storageKey]);

     const setTheme = (newTheme: Theme) => {
          setThemeState(newTheme);
     };

     const toggleTheme = () => {
          setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
     };

     return (
          <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
               {children}
          </ThemeContext.Provider>
     );
}

export function useTheme() {
     const context = useContext(ThemeContext);
     if (!context) {
          throw new Error('useTheme must be used within a ThemeProvider');
     }
     return context;
}
