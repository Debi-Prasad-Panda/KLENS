/**
 * useAutoLock Hook
 * 
 * Monitors user activity and triggers screen lock after inactivity.
 * Perfect for factory kiosk/shared terminal scenarios.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoLockOptions {
  /** Time in milliseconds before locking (default: 5 minutes) */
  timeout?: number;
  /** Whether auto-lock is enabled */
  enabled?: boolean;
  /** Events to track as user activity */
  events?: string[];
}

interface UseAutoLockReturn {
  /** Whether the screen is currently locked */
  isLocked: boolean;
  /** Lock the screen manually */
  lock: () => void;
  /** Unlock the screen */
  unlock: () => void;
  /** Reset the inactivity timer */
  resetTimer: () => void;
  /** Time remaining before lock (in seconds) */
  timeRemaining: number;
}

const DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const DEFAULT_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'touchstart',
  'scroll',
  'click',
];

export function useAutoLock(options: UseAutoLockOptions = {}): UseAutoLockReturn {
  const {
    timeout = DEFAULT_TIMEOUT,
    enabled = true,
    events = DEFAULT_EVENTS,
  } = options;

  const [isLocked, setIsLocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(Math.floor(timeout / 1000));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const lock = useCallback(() => {
    setIsLocked(true);
    // Clear timers when locked
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const unlock = useCallback(() => {
    setIsLocked(false);
    lastActivityRef.current = Date.now();
    setTimeRemaining(Math.floor(timeout / 1000));
  }, [timeout]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setTimeRemaining(Math.floor(timeout / 1000));

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    if (enabled && !isLocked) {
      timerRef.current = setTimeout(() => {
        lock();
      }, timeout);
    }
  }, [timeout, enabled, isLocked, lock]);

  // Activity listener
  useEffect(() => {
    if (!enabled || isLocked) return;

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer
    resetTimer();

    // Countdown timer (updates every second)
    countdownRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, Math.floor((timeout - elapsed) / 1000));
      setTimeRemaining(remaining);
    }, 1000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [enabled, isLocked, events, timeout, resetTimer]);

  return {
    isLocked,
    lock,
    unlock,
    resetTimer,
    timeRemaining,
  };
}
