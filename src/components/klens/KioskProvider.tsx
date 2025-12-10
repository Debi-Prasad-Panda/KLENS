/**
 * KioskProvider Component
 * 
 * Wraps the app with kiosk mode functionality.
 * Automatically locks screen after inactivity and requires PIN to unlock.
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAutoLock } from '@/hooks/useAutoLock';
import { KioskLockScreen } from './KioskLockScreen';

interface KioskContextType {
  /** Whether kiosk mode is enabled */
  isKioskMode: boolean;
  /** Enable kiosk mode */
  enableKiosk: () => void;
  /** Disable kiosk mode */
  disableKiosk: () => void;
  /** Manually lock the screen */
  lockScreen: () => void;
  /** Whether screen is currently locked */
  isLocked: boolean;
  /** Time remaining before auto-lock (seconds) */
  timeRemaining: number;
}

const KioskContext = createContext<KioskContextType | undefined>(undefined);

interface KioskProviderProps {
  children: ReactNode;
  /** Lock timeout in minutes (default: 5) */
  lockTimeoutMinutes?: number;
  /** Whether kiosk mode is enabled by default */
  defaultEnabled?: boolean;
}

export function KioskProvider({
  children,
  lockTimeoutMinutes = 5,
  defaultEnabled = false,
}: KioskProviderProps) {
  const { user, isAuthenticated, industrialContext } = useAuth();
  const [isKioskMode, setIsKioskMode] = useState(defaultEnabled);

  const {
    isLocked,
    lock,
    unlock,
    timeRemaining,
  } = useAutoLock({
    timeout: lockTimeoutMinutes * 60 * 1000,
    enabled: isKioskMode && isAuthenticated,
  });

  const enableKiosk = () => setIsKioskMode(true);
  const disableKiosk = () => {
    setIsKioskMode(false);
    unlock();
  };
  const lockScreen = () => lock();

  // Get shift status display
  const getShiftDisplay = () => {
    if (!industrialContext) return undefined;
    const status = industrialContext.currentStatus;
    if (status === 'ON_SHIFT') return '🟢 On Shift';
    if (status === 'ON_BREAK') return '🟡 On Break';
    return '⚫ Off Shift';
  };

  return (
    <KioskContext.Provider
      value={{
        isKioskMode,
        enableKiosk,
        disableKiosk,
        lockScreen,
        isLocked,
        timeRemaining,
      }}
    >
      {children}
      
      {/* Lock Screen Overlay */}
      {isKioskMode && (
        <KioskLockScreen
          isLocked={isLocked}
          onUnlock={unlock}
          userName={user?.name || user?.email || 'User'}
          shiftStatus={getShiftDisplay()}
        />
      )}
    </KioskContext.Provider>
  );
}

export function useKiosk() {
  const context = useContext(KioskContext);
  if (!context) {
    throw new Error('useKiosk must be used within KioskProvider');
  }
  return context;
}
