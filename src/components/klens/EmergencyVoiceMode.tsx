/**
 * EmergencyVoiceMode - Hands-free voice command interface for industrial emergencies
 * 
 * Activated via floating red button or Ctrl+Space. Workers wearing gloves/PPE
 * can use voice commands to interact with K-LENS during emergencies.
 * 
 * Demo Commands:
 * - "Show me the fire suppression manual!"
 * - "Isolate pump P-301!"
 * - "Who is the safety officer on shift?"
 * - "Trigger evacuation alarm!"
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, X, AlertTriangle, Volume2, FileText, Users, Siren, Settings, Search, VolumeX, History, Phone } from 'lucide-react';
import { toast } from 'sonner';
import '@/styles/emergency-voice.css';

// Command patterns and their actions
interface CommandPattern {
     patterns: RegExp[];
     action: string;
     category: 'document' | 'iot' | 'team' | 'emergency' | 'navigation';
     icon: typeof Mic;
     description: string;
     searchTerm?: string;
     voiceResponse?: string;
     requiresConfirmation?: boolean;
}

const COMMAND_PATTERNS: CommandPattern[] = [
     // Team/Personnel commands
     {
          patterns: [
               /safety\s*officer/i,
               /who\s*is\s*(the\s*)?(safety|shift|duty)/i,
               /who\s*is\s*(the\s*)?(system\s*)?(manager|supervisor|officer|lead|head|incharge|in-charge)/i,
               /supervisor/i,
               /manager/i,
          ],
          action: 'SHOW_SAFETY_OFFICER',
          category: 'team',
          icon: Users,
          description: 'Showing Safety Officer on Shift',
          voiceResponse: 'The current Safety Officer on shift is Rajesh Kumar. Extension 4421.',
     },
     // Emergency commands - Require confirmation
     {
          patterns: [
               /trigger\s*(evacuation|alarm|emergency)/i,
               /evacuation\s*alarm/i,
               /sound\s*(the\s*)?(alarm|siren)/i,
               /activate\s*(evacuation|alarm)/i,
          ],
          action: 'TRIGGER_EVACUATION',
          category: 'emergency',
          icon: Siren,
          description: '🚨 TRIGGERING EVACUATION ALARM',
          voiceResponse: 'ATTENTION! EVACUATION ALARM ACTIVATED! All personnel must evacuate immediately!',
          requiresConfirmation: true,
     },
     {
          patterns: [/sos/i, /help\s*me/i, /emergency\s*sos/i, /mayday/i],
          action: 'TRIGGER_SOS',
          category: 'emergency',
          icon: AlertTriangle,
          description: '🆘 TRIGGERING EMERGENCY SOS',
          voiceResponse: 'Emergency SOS activated! Alerting emergency response teams!',
          requiresConfirmation: true,
     },
     // Document commands
     {
          patterns: [/fire\s*(suppression|safety|manual)/i, /show\s*(me\s*)?(the\s*)?fire/i],
          action: 'OPEN_FIRE_MANUAL',
          category: 'document',
          icon: FileText,
          description: 'Opening Fire Suppression Manual',
          searchTerm: 'fire suppression',
          voiceResponse: 'Opening fire suppression manual.',
     },
     {
          patterns: [/safety\s*(rules|manual|protocol)/i, /give\s*(me\s*)?(the\s*)?safety/i],
          action: 'OPEN_SAFETY_RULES',
          category: 'document',
          icon: FileText,
          description: 'Opening Safety Rules',
          searchTerm: 'safety rules',
          voiceResponse: 'Opening safety rules and protocols.',
     },
     // IoT commands
     {
          patterns: [/isolate\s*(pump|motor|valve)/i, /shut\s*(down|off)\s*(pump|motor)/i],
          action: 'ISOLATE_EQUIPMENT',
          category: 'iot',
          icon: Settings,
          description: 'Initiating Equipment Isolation',
          voiceResponse: 'Initiating equipment isolation.',
     },
     {
          patterns: [/sensor|iot|check\s*equipment/i],
          action: 'OPEN_IOT',
          category: 'iot',
          icon: Settings,
          description: 'Opening IoT Dashboard',
          voiceResponse: 'Opening IoT dashboard.',
     },
     // Search fallback
     {
          patterns: [/search\s*(for\s*)?(.+)/i, /find\s*(.+)/i, /look\s*(for|up)\s*(.+)/i],
          action: 'SEARCH_DOCUMENTS',
          category: 'document',
          icon: Search,
          description: 'Searching Documents',
          voiceResponse: 'Searching documents.',
     },
];

interface CommandHistoryEntry {
     command: string;
     action: string;
     timestamp: Date;
     success: boolean;
}

const EMERGENCY_CONTACTS = [
     { name: 'Rajesh Kumar', role: 'Safety Officer', ext: '4421', zone: 'Zone B' },
     { name: 'Priya Sharma', role: 'Shift Supervisor', ext: '4422', zone: 'Zone A' },
     { name: 'Control Room', role: 'Emergency Response', ext: '100', zone: 'Main' },
     { name: 'Medical Bay', role: 'First Aid', ext: '108', zone: 'Building C' },
];

interface EmergencyVoiceModeProps {
     onNavigate?: (tab: string, searchQuery?: string) => void;
     isAIChatOpen?: boolean;
}

export function EmergencyVoiceMode({ onNavigate, isAIChatOpen = false }: EmergencyVoiceModeProps) {
     const [isOpen, setIsOpen] = useState(false);
     const [recognizedCommand, setRecognizedCommand] = useState<CommandPattern | null>(null);
     const [isProcessing, setIsProcessing] = useState(false);
     const [extractedSearchTerm, setExtractedSearchTerm] = useState<string>('');
     const [localError, setLocalError] = useState<string | null>(null);
     const [isListening, setIsListening] = useState(false);
     const [transcript, setTranscript] = useState('');
     const [isEvacuationMode, setIsEvacuationMode] = useState(false);
     const [isSirenPlaying, setIsSirenPlaying] = useState(false);
     const [pendingCommand, setPendingCommand] = useState<{ cmd: CommandPattern; match?: RegExpMatchArray; searchTerm?: string } | null>(null);
     const [commandHistory, setCommandHistory] = useState<CommandHistoryEntry[]>([]);
     const [showHistory, setShowHistory] = useState(false);
     const [showContacts, setShowContacts] = useState(false);

     const recognitionRef = useRef<any>(null);
     const shouldRestartRef = useRef(false);
     const audioContextRef = useRef<AudioContext | null>(null);
     const sirenOscillatorsRef = useRef<OscillatorNode[]>([]);
     const isSpeakingRef = useRef(false);
     const hasShownListeningToast = useRef(false);

     const isSupported = typeof window !== 'undefined' &&
          !!(window.SpeechRecognition || window.webkitSpeechRecognition);

     const addToHistory = useCallback((command: string, action: string, success: boolean) => {
          setCommandHistory(prev => [
               { command, action, timestamp: new Date(), success },
               ...prev.slice(0, 9)
          ]);
     }, []);

     const speak = useCallback((text: string, urgent: boolean = false): Promise<void> => {
          return new Promise((resolve) => {
               if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    isSpeakingRef.current = true;

                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.rate = urgent ? 1.2 : 1.0;
                    utterance.pitch = urgent ? 1.3 : 1.0;
                    utterance.volume = 1.0;
                    utterance.lang = 'en-US';

                    utterance.onend = () => {
                         isSpeakingRef.current = false;
                         resolve();
                    };

                    utterance.onerror = () => {
                         isSpeakingRef.current = false;
                         resolve();
                    };

                    window.speechSynthesis.speak(utterance);
               } else {
                    resolve();
               }
          });
     }, []);

     const stopSiren = useCallback(() => {
          sirenOscillatorsRef.current.forEach(osc => {
               try {
                    osc.stop();
                    osc.disconnect();
               } catch (e) { }
          });
          sirenOscillatorsRef.current = [];
          setIsSirenPlaying(false);

          if (audioContextRef.current) {
               try {
                    audioContextRef.current.close();
               } catch (e) { }
               audioContextRef.current = null;
          }
     }, []);

     const playAlarmSound = useCallback(() => {
          if (isSirenPlaying) return;

          try {
               const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
               audioContextRef.current = audioContext;
               setIsSirenPlaying(true);

               const createSirenCycle = (startTime: number) => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(440, startTime);
                    oscillator.frequency.linearRampToValueAtTime(880, startTime + 0.5);
                    oscillator.frequency.linearRampToValueAtTime(440, startTime + 1);

                    gainNode.gain.setValueAtTime(0.3, startTime);
                    gainNode.gain.linearRampToValueAtTime(0.1, startTime + 1);

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.start(startTime);
                    oscillator.stop(startTime + 1);

                    sirenOscillatorsRef.current.push(oscillator);
                    return oscillator;
               };

               const now = audioContext.currentTime;
               for (let i = 0; i < 10; i++) {
                    createSirenCycle(now + i * 1.1);
               }

               setTimeout(() => stopSiren(), 11000);
          } catch (e) {
               console.error('[Voice] Audio alarm failed:', e);
               setIsSirenPlaying(false);
          }
     }, [isSirenPlaying, stopSiren]);

     const dismissEvacuation = useCallback(() => {
          setIsEvacuationMode(false);
          stopSiren();
          window.speechSynthesis.cancel();
          toast.info('Evacuation alert dismissed', { duration: 2000 });
     }, [stopSiren]);

     const triggerEvacuationAlarm = useCallback(() => {
          setIsEvacuationMode(true);
          playAlarmSound();
          speak('ATTENTION! EVACUATION ALARM ACTIVATED! All personnel must evacuate immediately! Proceed to your designated assembly points!', true);
          toast.error('🚨 EVACUATION ALARM TRIGGERED', {
               description: 'All personnel report to designated assembly points IMMEDIATELY!',
               duration: 15000,
          });
          addToHistory('Trigger evacuation alarm', 'TRIGGER_EVACUATION', true);
     }, [speak, playAlarmSound, addToHistory]);

     const triggerSOSAlert = useCallback(() => {
          setIsEvacuationMode(true);
          playAlarmSound();
          speak('Emergency SOS activated! Alerting all supervisors and emergency response teams!', true);
          toast.error('🆘 EMERGENCY SOS ACTIVATED', {
               description: 'Alerting emergency response team. Help is on the way!',
               duration: 15000,
          });
          addToHistory('Emergency SOS', 'TRIGGER_SOS', true);
     }, [speak, playAlarmSound, addToHistory]);

     const confirmCommand = useCallback(() => {
          if (pendingCommand) {
               const { cmd } = pendingCommand;
               if (cmd.action === 'TRIGGER_EVACUATION') {
                    triggerEvacuationAlarm();
               } else if (cmd.action === 'TRIGGER_SOS') {
                    triggerSOSAlert();
               }
               setPendingCommand(null);
          }
     }, [pendingCommand, triggerEvacuationAlarm, triggerSOSAlert]);

     const cancelCommand = useCallback(() => {
          speak('Command cancelled.');
          toast.info('Command cancelled', { duration: 2000 });
          setPendingCommand(null);
          setRecognizedCommand(null);
          setIsProcessing(false);
     }, [speak]);

     const startListening = useCallback(async () => {
          if (!isSupported) {
               setLocalError('Voice recognition requires Chrome or Edge browser.');
               return;
          }

          setLocalError(null);
          setTranscript('');

          try {
               await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (permErr: any) {
               if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
                    setLocalError('Microphone permission denied. Please allow microphone access.');
               } else if (permErr.name === 'NotFoundError') {
                    setLocalError('No microphone found. Please connect a microphone.');
               } else {
                    setLocalError(`Microphone error: ${permErr.message || permErr.name}`);
               }
               return;
          }

          shouldRestartRef.current = true;

          const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognitionAPI();

          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onstart = () => {
               setIsListening(true);
               setLocalError(null);
               // Only show toast once, not on every auto-restart
               if (!hasShownListeningToast.current) {
                    toast.info('🎤 Listening...', { description: 'Speak your command!', duration: 2000 });
                    hasShownListeningToast.current = true;
               }
          };

          recognition.onresult = (event: any) => {
               if (isSpeakingRef.current) return;

               let finalText = '';
               let interimText = '';

               for (let i = 0; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                         finalText += result[0].transcript;
                    } else {
                         interimText += result[0].transcript;
                    }
               }

               const fullText = finalText || interimText;
               setTranscript(fullText);

               if (finalText && finalText.trim().length > 0) {
                    shouldRestartRef.current = false;
                    recognition.stop();
                    processCommand(finalText.trim());
               }
          };

          recognition.onerror = (event: any) => {
               if (event.error === 'not-allowed') {
                    setLocalError('Microphone permission denied.');
                    shouldRestartRef.current = false;
                    setIsListening(false);
               } else if (event.error === 'audio-capture') {
                    setLocalError('No microphone found.');
                    shouldRestartRef.current = false;
                    setIsListening(false);
               }
          };

          recognition.onend = () => {
               if (shouldRestartRef.current && isOpen && !isSpeakingRef.current) {
                    try {
                         recognition.start();
                    } catch (e) {
                         setIsListening(false);
                    }
               } else if (!isSpeakingRef.current) {
                    setIsListening(false);
               }
          };

          recognitionRef.current = recognition;

          try {
               recognition.start();
          } catch (err: any) {
               setLocalError('Failed to start voice recognition.');
               setIsListening(false);
          }
     }, [isSupported, isOpen]);

     const stopListening = useCallback(() => {
          shouldRestartRef.current = false;
          hasShownListeningToast.current = false; // Reset for next time
          if (recognitionRef.current) {
               try {
                    recognitionRef.current.stop();
               } catch (e) { }
          }
          setIsListening(false);
     }, []);

     const reset = useCallback(() => {
          stopListening();
          setTranscript('');
          setLocalError(null);
     }, [stopListening]);

     const processCommand = useCallback((text: string) => {
          console.log('[Voice] Processing command:', text);

          // Clean text only if it has the wake word prefix
          const hasWakeWord = /^(hey\s+)?k[\s-]?lens[!,.]?\s*/i.test(text);
          const cleanedText = hasWakeWord
               ? text.toLowerCase().replace(/^(hey\s+)?k[\s-]?lens[!,.]?\s*/i, '').trim()
               : text.toLowerCase().trim();

          console.log('[Voice] Cleaned text:', cleanedText);

          // FIRST: Check for confirmation/cancellation (must be before command matching!)
          if (pendingCommand) {
               console.log('[Voice] Checking for confirmation response...');
               if (/^(yes|confirm|affirmative|proceed|ok)$/i.test(cleanedText)) {
                    console.log('[Voice] ✅ Confirmed!');
                    confirmCommand();
                    return;
               } else if (/^(no|cancel|abort|stop)$/i.test(cleanedText)) {
                    console.log('[Voice] ❌ Cancelled!');
                    cancelCommand();
                    return;
               }
          }

          // SECOND: Try to match command patterns
          console.log('[Voice] Matching against command patterns...');
          for (const cmd of COMMAND_PATTERNS) {
               for (const pattern of cmd.patterns) {
                    const match = cleanedText.match(pattern) || text.toLowerCase().match(pattern);
                    if (match) {
                         console.log('[Voice] ✅ Matched command:', cmd.action);
                         setRecognizedCommand(cmd);
                         setIsProcessing(true);

                         let searchTerm = '';
                         if (cmd.action === 'SEARCH_DOCUMENTS' && (match[2] || match[1])) {
                              searchTerm = (match[2] || match[1] || '').trim();
                         } else if (cmd.searchTerm) {
                              searchTerm = cmd.searchTerm;
                         }
                         setExtractedSearchTerm(searchTerm);

                         if (cmd.requiresConfirmation) {
                              speak(`You are about to ${cmd.action === 'TRIGGER_EVACUATION' ? 'trigger the evacuation alarm' : 'activate emergency SOS'}. Say "confirm" to proceed, or "cancel" to abort.`);
                              setPendingCommand({ cmd, match, searchTerm });
                              setTimeout(() => startListening(), 3000);
                              return;
                         }

                         setTimeout(() => {
                              executeCommand(cmd, match, searchTerm);
                         }, 1500);

                         return;
                    }
               }
          }



          console.log('[Voice] No command matched, falling back to search');

          // THIRD: Fallback to search
          if (cleanedText.length > 3) {
               const searchCmd: CommandPattern = {
                    patterns: [],
                    action: 'SEARCH_DOCUMENTS',
                    category: 'document',
                    icon: Search,
                    description: `Searching for: "${text}"`,
                    searchTerm: cleanedText,
                    voiceResponse: `Searching for ${cleanedText}`,
               };

               setRecognizedCommand(searchCmd);
               setExtractedSearchTerm(cleanedText);
               setIsProcessing(true);

               setTimeout(() => {
                    executeCommand(searchCmd, undefined, cleanedText);
               }, 1500);
          } else {
               speak('Sorry, I did not understand. Please try again.');
          }
     }, [speak, pendingCommand, confirmCommand, cancelCommand, startListening]);

     const executeCommand = useCallback((cmd: CommandPattern, match?: RegExpMatchArray, searchTermOverride?: string) => {
          stopListening();

          const finalSearchTerm = searchTermOverride || cmd.searchTerm || extractedSearchTerm;

          if (cmd.voiceResponse) {
               speak(cmd.voiceResponse, cmd.category === 'emergency');
          }

          addToHistory(cmd.description, cmd.action, true);

          switch (cmd.action) {
               case 'OPEN_FIRE_MANUAL':
               case 'OPEN_SAFETY_RULES':
               case 'SEARCH_DOCUMENTS':
                    toast.success('📄 Navigating to Documents', {
                         description: `Searching for: ${finalSearchTerm}`,
                         duration: 3000,
                    });
                    onNavigate?.('search', finalSearchTerm);
                    break;

               case 'ISOLATE_EQUIPMENT':
                    const equipmentMatch = match?.[0]?.match(/(pump|motor|valve)\s*([a-z0-9-]*)/i);
                    const equipmentName = equipmentMatch ? `${equipmentMatch[1]} ${equipmentMatch[2] || ''}`.trim() : 'Equipment';
                    toast.warning(`⚠️ Isolating ${equipmentName}`, {
                         description: 'Sending shutdown command...',
                         duration: 5000,
                    });
                    onNavigate?.('iot');
                    break;

               case 'OPEN_IOT':
                    toast.success('📊 Opening IoT Dashboard', { duration: 3000 });
                    onNavigate?.('iot');
                    break;

               case 'SHOW_SAFETY_OFFICER':
                    toast.success('👷 Safety Officer on Shift', {
                         description: 'Rajesh Kumar - Extension: 4421 - Zone B Control Room',
                         duration: 8000,
                    });
                    speak('The current Safety Officer on shift is Rajesh Kumar. Extension 4421.');
                    onNavigate?.('profile');
                    break;

               case 'TRIGGER_EVACUATION':
                    triggerEvacuationAlarm();
                    break;

               case 'TRIGGER_SOS':
                    triggerSOSAlert();
                    break;
          }

          if (cmd.category !== 'emergency') {
               setTimeout(() => {
                    setIsOpen(false);
                    setRecognizedCommand(null);
                    setIsProcessing(false);
                    setExtractedSearchTerm('');
                    reset();
               }, 2000);
          } else {
               setTimeout(() => {
                    setIsOpen(false);
                    setRecognizedCommand(null);
                    setIsProcessing(false);
                    setExtractedSearchTerm('');
                    reset();
               }, 5000);
          }
     }, [onNavigate, stopListening, reset, extractedSearchTerm, speak, triggerEvacuationAlarm, triggerSOSAlert, addToHistory]);

     useEffect(() => {
          return () => {
               stopSiren();
               window.speechSynthesis.cancel();
          };
     }, [stopSiren]);

     useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
               if (e.ctrlKey && e.code === 'Space') {
                    e.preventDefault();
                    setIsOpen(true);
               }
               if (e.code === 'Escape' && isOpen) {
                    handleClose();
               }
          };

          window.addEventListener('keydown', handleKeyDown);
          return () => window.removeEventListener('keydown', handleKeyDown);
     }, [isOpen]);

     const handleClose = useCallback(() => {
          stopListening();
          reset();
          setIsOpen(false);
          setRecognizedCommand(null);
          setIsProcessing(false);
          setExtractedSearchTerm('');
          setLocalError(null);
          setPendingCommand(null);
          window.speechSynthesis.cancel();
     }, [stopListening, reset]);

     const handleOpen = useCallback(() => {
          setIsOpen(true);
          setLocalError(null);
     }, []);

     const renderWaveform = () => {
          const bars = 24;
          return (
               <div className="emergency-waveform">
                    {Array.from({ length: bars }).map((_, i) => (
                         <div
                              key={i}
                              className={`waveform-bar ${isListening ? 'active' : ''}`}
                              style={{
                                   animationDelay: `${i * 0.05}s`,
                                   height: isListening ? `${20 + Math.random() * 40}px` : '8px',
                              }}
                         />
                    ))}
               </div>
          );
     };

     return (
          <>
               {isEvacuationMode && (
                    <div className="evacuation-overlay">
                         <div className="evacuation-content">
                              <Siren className="evacuation-icon" />
                              <h1 className="evacuation-title">🚨 EVACUATION ALERT 🚨</h1>
                              <p className="evacuation-message">
                                   ALL PERSONNEL EVACUATE IMMEDIATELY
                              </p>
                              <p className="evacuation-submessage">
                                   Proceed to your designated assembly points
                              </p>

                              <div className="evacuation-controls">
                                   {isSirenPlaying && (
                                        <button className="evacuation-btn mute" onClick={stopSiren}>
                                             <VolumeX className="w-5 h-5" />
                                             Mute Siren
                                        </button>
                                   )}
                                   <button className="evacuation-btn dismiss" onClick={dismissEvacuation}>
                                        <X className="w-5 h-5" />
                                        Dismiss Alert
                                   </button>
                              </div>
                         </div>
                    </div>
               )}

               {/* Emergency Voice FAB - Hidden when AI chat is open to avoid overlap */}
               {!isAIChatOpen && (
                    <button
                         onClick={handleOpen}
                         className="emergency-fab"
                         aria-label="Activate Voice Command Mode (Ctrl+Space)"
                         title="Voice Command Mode (Ctrl+Space)"
                    >
                         <Mic className="w-6 h-6" />
                         <span className="emergency-fab-pulse" />
                         <span className="emergency-fab-pulse delay-1" />
                    </button>
               )}

               {isOpen && (
                    <div className="emergency-modal-backdrop" onClick={handleClose}>
                         <div
                              className="emergency-modal"
                              onClick={(e) => e.stopPropagation()}
                              role="dialog"
                              aria-modal="true"
                         >
                              <button onClick={handleClose} className="emergency-modal-close">
                                   <X className="w-6 h-6" />
                              </button>

                              {/* Smart Features Bar */}
                              <div className="smart-features-bar">
                                   <button
                                        className={`smart-btn ${showHistory ? 'active' : ''}`}
                                        onClick={() => { setShowHistory(!showHistory); setShowContacts(false); }}
                                   >
                                        <History className="w-4 h-4" />
                                        History
                                   </button>
                                   <button
                                        className={`smart-btn ${showContacts ? 'active' : ''}`}
                                        onClick={() => { setShowContacts(!showContacts); setShowHistory(false); }}
                                   >
                                        <Phone className="w-4 h-4" />
                                        Contacts
                                   </button>
                              </div>

                              {showHistory && (
                                   <div className="history-panel">
                                        <h3>Recent Commands</h3>
                                        {commandHistory.length === 0 ? (
                                             <p className="history-empty">No commands yet</p>
                                        ) : (
                                             <ul className="history-list">
                                                  {commandHistory.map((entry, idx) => (
                                                       <li key={idx} className={`history-item ${entry.success ? 'success' : 'failed'}`}>
                                                            <span className="history-command">{entry.command}</span>
                                                            <span className="history-time">
                                                                 {entry.timestamp.toLocaleTimeString()}
                                                            </span>
                                                       </li>
                                                  ))}
                                             </ul>
                                        )}
                                   </div>
                              )}

                              {showContacts && (
                                   <div className="contacts-panel">
                                        <h3>Emergency Contacts</h3>
                                        <ul className="contacts-list">
                                             {EMERGENCY_CONTACTS.map((contact, idx) => (
                                                  <li key={idx} className="contact-item">
                                                       <div className="contact-info">
                                                            <span className="contact-name">{contact.name}</span>
                                                            <span className="contact-role">{contact.role}</span>
                                                       </div>
                                                       <div className="contact-ext">
                                                            <Phone className="w-3 h-3" />
                                                            Ext. {contact.ext}
                                                       </div>
                                                  </li>
                                             ))}
                                        </ul>
                                   </div>
                              )}

                              {pendingCommand && (
                                   <div className="confirmation-dialog">
                                        <div className="confirmation-icon">
                                             <AlertTriangle className="w-12 h-12" />
                                        </div>
                                        <h3>Confirm Critical Action</h3>
                                        <p>
                                             {pendingCommand.cmd.action === 'TRIGGER_EVACUATION'
                                                  ? 'You are about to trigger the EVACUATION ALARM.'
                                                  : 'You are about to activate EMERGENCY SOS.'}
                                        </p>
                                        <div className="confirmation-buttons">
                                             <button className="confirm-btn cancel" onClick={cancelCommand}>
                                                  Cancel
                                             </button>
                                             <button className="confirm-btn confirm" onClick={confirmCommand}>
                                                  Confirm
                                             </button>
                                        </div>
                                        <p className="confirmation-voice-hint">
                                             Or say "Confirm" or "Cancel"
                                        </p>
                                   </div>
                              )}

                              {!pendingCommand && !showHistory && !showContacts && (
                                   <>
                                        <div className="emergency-modal-header">
                                             <div className={`emergency-icon ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}>
                                                  {isProcessing && recognizedCommand ? (
                                                       <recognizedCommand.icon className="w-12 h-12" />
                                                  ) : isListening ? (
                                                       <Volume2 className="w-12 h-12" />
                                                  ) : (
                                                       <Mic className="w-12 h-12" />
                                                  )}
                                             </div>
                                             <h2 className="emergency-modal-title">
                                                  {isProcessing
                                                       ? recognizedCommand?.description
                                                       : isListening
                                                            ? 'Listening...'
                                                            : 'Voice Command Mode'}
                                             </h2>
                                             <p className="emergency-modal-subtitle">
                                                  {isProcessing
                                                       ? 'Executing command...'
                                                       : isListening
                                                            ? 'Say a command like "Show me the safety rules"'
                                                            : 'Click "Start Listening" to begin'}
                                             </p>
                                        </div>

                                        {renderWaveform()}

                                        <div className="emergency-transcript">
                                             {transcript ? (
                                                  <p className="transcript-text">{transcript}</p>
                                             ) : (
                                                  <p className="transcript-placeholder">Your voice command will appear here...</p>
                                             )}
                                        </div>
                                        {!isProcessing && (
                                             <div className="emergency-hints">
                                                  <p className="hints-title">Try saying (or click to execute):</p>
                                                  <div className="hints-grid">
                                                       <div
                                                            className="hint-item cursor-pointer hover:bg-opacity-20"
                                                            onClick={() => processCommand("Show me the safety rules")}
                                                       >
                                                            <FileText className="w-4 h-4" />
                                                            <span>"Show me the safety rules"</span>
                                                       </div>
                                                       <div
                                                            className="hint-item cursor-pointer hover:bg-opacity-20"
                                                            onClick={() => processCommand("Isolate pump P-301")}
                                                       >
                                                            <Settings className="w-4 h-4" />
                                                            <span>"Isolate pump P-301"</span>
                                                       </div>
                                                       <div
                                                            className="hint-item cursor-pointer hover:bg-opacity-20"
                                                            onClick={() => processCommand("Who is the manager?")}
                                                       >
                                                            <Users className="w-4 h-4" />
                                                            <span>"Who is the manager?"</span>
                                                       </div>
                                                       <div
                                                            className="hint-item cursor-pointer hover:bg-opacity-20"
                                                            onClick={() => processCommand("Trigger evacuation alarm")}
                                                       >
                                                            <Siren className="w-4 h-4" />
                                                            <span>"Trigger evacuation alarm"</span>
                                                       </div>
                                                  </div>
                                             </div>
                                        )}
                                   </>
                              )}

                              {localError && (
                                   <div className="emergency-error">
                                        <AlertTriangle className="w-5 h-5" />
                                        <span>{localError}</span>
                                   </div>
                              )}

                              {!isSupported && (
                                   <div className="emergency-warning">
                                        <AlertTriangle className="w-5 h-5" />
                                        <span>Voice recognition requires Chrome or Edge browser.</span>
                                   </div>
                              )}

                              {!pendingCommand && !showHistory && !showContacts && (
                                   <div className="emergency-controls">
                                        {isListening ? (
                                             <button onClick={stopListening} className="control-btn stop">
                                                  <MicOff className="w-5 h-5" />
                                                  Stop Listening
                                             </button>
                                        ) : (
                                             <button
                                                  onClick={startListening}
                                                  className="control-btn start"
                                                  disabled={!isSupported || isProcessing}
                                             >
                                                  <Mic className="w-5 h-5" />
                                                  Start Listening
                                             </button>
                                        )}
                                   </div>
                              )}

                              <p className="keyboard-hint">
                                   Press <kbd>Esc</kbd> to close • <kbd>Ctrl</kbd>+<kbd>Space</kbd> to activate
                              </p>
                         </div>
                    </div>
               )}
          </>
     );
}

export default EmergencyVoiceMode;
