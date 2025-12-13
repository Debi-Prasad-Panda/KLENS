/**
 * useVoiceToText - Custom React hook for voice-to-text using Web Speech API
 * 
 * Uses browser's native SpeechRecognition API (Chrome/Edge).
 * No external dependencies required.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
     results: SpeechRecognitionResultList;
     resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
     error: string;
     message: string;
}

interface SpeechRecognition extends EventTarget {
     continuous: boolean;
     interimResults: boolean;
     lang: string;
     start(): void;
     stop(): void;
     abort(): void;
     onresult: ((event: SpeechRecognitionEvent) => void) | null;
     onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
     onend: (() => void) | null;
     onstart: (() => void) | null;
     onspeechend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
     new(): SpeechRecognition;
}

declare global {
     interface Window {
          SpeechRecognition: SpeechRecognitionConstructor;
          webkitSpeechRecognition: SpeechRecognitionConstructor;
     }
}

export interface UseVoiceToTextOptions {
     language?: string;
     continuous?: boolean;
     onResult?: (transcript: string) => void;
     onError?: (error: string) => void;
}

export interface UseVoiceToTextReturn {
     isListening: boolean;
     transcript: string;
     finalTranscript: string;
     isSupported: boolean;
     error: string | null;
     startListening: () => void;
     stopListening: () => void;
     reset: () => void;
}

export function useVoiceToText(options: UseVoiceToTextOptions = {}): UseVoiceToTextReturn {
     const { language = 'en-US', continuous = false, onResult, onError } = options;

     const [isListening, setIsListening] = useState(false);
     const [transcript, setTranscript] = useState('');
     const [error, setError] = useState<string | null>(null);

     const recognitionRef = useRef<SpeechRecognition | null>(null);
     const onResultRef = useRef(onResult);
     const onErrorRef = useRef(onError);

     // Update callback refs
     useEffect(() => {
          onResultRef.current = onResult;
          onErrorRef.current = onError;
     }, [onResult, onError]);

     // Check browser support
     const isSupported = typeof window !== 'undefined' &&
          !!(window.SpeechRecognition || window.webkitSpeechRecognition);

     const startListening = useCallback(() => {
          if (!isSupported) {
               const msg = 'Speech recognition not supported. Use Chrome or Edge.';
               setError(msg);
               onErrorRef.current?.(msg);
               return;
          }

          // Create new instance each time
          const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognitionAPI();

          recognition.continuous = continuous;
          recognition.interimResults = true;
          recognition.lang = language;

          recognition.onstart = () => {
               setIsListening(true);
               setError(null);
               setTranscript('');
          };

          recognition.onresult = (event) => {
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

               // Call onResult when we have final text and recognition ends
               if (finalText) {
                    onResultRef.current?.(finalText);
               }
          };

          recognition.onerror = (event) => {
               // Ignore aborted errors (user stopped)
               if (event.error === 'aborted' || event.error === 'no-speech') {
                    setIsListening(false);
                    return;
               }

               const errorMessages: Record<string, string> = {
                    'not-allowed': 'Microphone permission denied.',
                    'audio-capture': 'No microphone found.',
                    'network': 'Network error. Check your connection.',
               };

               const msg = errorMessages[event.error] || `Error: ${event.error}`;
               setError(msg);
               setIsListening(false);
               onErrorRef.current?.(msg);
          };

          recognition.onend = () => {
               setIsListening(false);
          };

          recognitionRef.current = recognition;

          try {
               recognition.start();
          } catch (err) {
               setError('Failed to start. Try again.');
          }
     }, [isSupported, continuous, language]);

     const stopListening = useCallback(() => {
          if (recognitionRef.current) {
               try {
                    recognitionRef.current.stop();
               } catch {
                    // Ignore
               }
          }
          setIsListening(false);
     }, []);

     const reset = useCallback(() => {
          stopListening();
          setTranscript('');
          setError(null);
     }, [stopListening]);

     return {
          isListening,
          transcript,
          finalTranscript: transcript,
          isSupported,
          error,
          startListening,
          stopListening,
          reset,
     };
}
