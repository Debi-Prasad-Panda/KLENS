/// <reference types="vite/client" />

// Web Speech API declarations
interface SpeechRecognition extends EventTarget {
     continuous: boolean;
     interimResults: boolean;
     lang: string;
     onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
     onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
     onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
     onend: ((this: SpeechRecognition, ev: Event) => any) | null;
     start(): void;
     stop(): void;
     abort(): void;
}

interface SpeechRecognitionEvent extends Event {
     readonly results: SpeechRecognitionResultList;
     readonly resultIndex: number;
}

interface SpeechRecognitionResultList {
     readonly length: number;
     item(index: number): SpeechRecognitionResult;
     [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
     readonly length: number;
     readonly isFinal: boolean;
     item(index: number): SpeechRecognitionAlternative;
     [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
     readonly transcript: string;
     readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
     readonly error: string;
     readonly message: string;
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

