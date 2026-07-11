'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultItem {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

type RecognitionConstructor = new () => SpeechRecognitionInstance;

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
  const {
    language = 'en-US',
    continuous = false,
    interimResults = true,
    onResult,
    onError,
    onEnd,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const onEndRef = useRef(onEnd);
  useEffect(() => { onResultRef.current = onResult; });
  useEffect(() => { onErrorRef.current = onError; });
  useEffect(() => { onEndRef.current = onEnd; });

  useEffect(() => {
    const SpeechRecognitionAPI =
      (typeof window !== 'undefined' &&
        ((window as unknown as Record<string, unknown>).SpeechRecognition as RecognitionConstructor | undefined)) ||
      (typeof window !== 'undefined' &&
        ((window as unknown as Record<string, unknown>).webkitSpeechRecognition as RecognitionConstructor | undefined));

    setIsSupported(!!SpeechRecognitionAPI);

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = language;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const results = event.results;
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const transcript = result[0]?.transcript || '';
          const isFinal = result.isFinal;
          onResultRef.current?.({ transcript, isFinal });
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        onErrorRef.current?.(event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
        onEndRef.current?.();
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
        recognitionRef.current = null;
      }
    };
  }, [language, continuous, interimResults]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop();
      setIsListening(false);
    } catch {
      setIsListening(false);
    }
  }, []);

  const abortListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.abort();
      setIsListening(false);
    } catch {
      setIsListening(false);
    }
  }, []);

  return {
    isSupported,
    isListening,
    startListening,
    stopListening,
    abortListening,
  };
}
