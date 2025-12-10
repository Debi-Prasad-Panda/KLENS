/**
 * KioskLockScreen Component
 * 
 * A full-screen lock overlay with PIN input for factory kiosk mode.
 * Appears after user inactivity and requires PIN to unlock.
 */

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Fingerprint, AlertCircle, ArrowLeft, Shield } from 'lucide-react';

interface KioskLockScreenProps {
  /** Whether the lock screen is visible */
  isLocked: boolean;
  /** Callback when successfully unlocked */
  onUnlock: () => void;
  /** User's name to display */
  userName?: string;
  /** Current shift status */
  shiftStatus?: string;
}

export function KioskLockScreen({
  isLocked,
  onUnlock,
  userName = 'User',
  shiftStatus,
}: KioskLockScreenProps) {
  const { verifyKioskPin, logout } = useAuth();
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input when lock screen appears
  useEffect(() => {
    if (isLocked) {
      setPin(['', '', '', '']);
      setError(null);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isLocked]);

  const handlePinChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(null);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (value && index === 3) {
      const fullPin = [...newPin].join('');
      if (fullPin.length === 4) {
        handleVerify(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (pinCode: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const isValid = await verifyKioskPin(pinCode);
      
      if (isValid) {
        onUnlock();
      } else {
        setError('Incorrect PIN. Please try again.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onUnlock();
  };

  const handleKeypadClick = (digit: string) => {
    const firstEmpty = pin.findIndex(p => p === '');
    if (firstEmpty !== -1) {
      handlePinChange(firstEmpty, digit);
    }
  };

  const handleClear = () => {
    setPin(['', '', '', '']);
    setError(null);
    inputRefs.current[0]?.focus();
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Lock Card */}
      <div className="relative w-full max-w-md mx-4">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
              <Lock className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Screen Locked</h1>
          <p className="text-slate-400">Welcome back, <span className="text-white font-medium">{userName}</span></p>
          {shiftStatus && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {shiftStatus}
            </div>
          )}
        </div>

        {/* PIN Input */}
        <div className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl ${shake ? 'animate-shake' : ''}`}>
          <p className="text-slate-400 text-center mb-6">Enter your 4-digit PIN to unlock</p>
          
          {/* PIN Boxes */}
          <div className="flex justify-center gap-4 mb-6">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isVerifying}
                className={`
                  w-14 h-16 text-center text-2xl font-bold rounded-xl
                  bg-slate-900/50 border-2 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  ${digit ? 'border-blue-500 text-white' : 'border-slate-600 text-slate-400'}
                  ${error ? 'border-red-500' : ''}
                  ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'clear'].map((key, i) => (
              <button
                key={i}
                onClick={() => key === 'clear' ? handleClear() : key && handleKeypadClick(key)}
                disabled={isVerifying || !key}
                className={`
                  h-14 rounded-xl font-semibold text-lg transition-all duration-150
                  ${!key ? 'invisible' : ''}
                  ${key === 'clear' 
                    ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50' 
                    : 'bg-slate-700/30 text-white hover:bg-slate-600/50 active:scale-95'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {key === 'clear' ? <ArrowLeft className="w-5 h-5 mx-auto" /> : key}
              </button>
            ))}
          </div>

          {/* Fingerprint Hint */}
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Fingerprint className="w-4 h-4" />
            <span>Touch ID available on supported devices</span>
          </div>
        </div>

        {/* Logout Option */}
        <div className="text-center mt-6">
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            Not {userName}? <span className="text-blue-400 hover:underline">Sign out</span>
          </button>
        </div>
      </div>

      {/* Add shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
