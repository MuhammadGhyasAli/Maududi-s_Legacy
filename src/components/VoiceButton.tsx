'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  language?: string;
  disabled?: boolean;
}

const LANGUAGE_MAP: Record<string, string> = {
  English: 'en-US',
  Turkish: 'tr-TR',
  Urdu: 'ur-PK',
  Arabic: 'ar-SA',
  Persian: 'fa-IR',
  Bengali: 'bn-BD',
};

const VoiceButton: React.FC<VoiceButtonProps> = ({
  onTranscript,
  language = 'en-US',
  disabled = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef('');
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => { onTranscriptRef.current = onTranscript; });

  const handleResult = useCallback(
    ({ transcript, isFinal }: { transcript: string; isFinal: boolean }) => {
      if (isFinal) {
        transcriptRef.current += transcript;
        onTranscriptRef.current(transcriptRef.current);
        transcriptRef.current = '';
      }
    },
    []
  );

  const handleError = useCallback((err: string) => {
    if (err === 'no-speech' || err === 'aborted') return;
    setError(err === 'not-allowed' ? 'Mic access denied' : 'Voice input error');
  }, []);

  const handleEnd = useCallback(() => {
  }, []);

  const bcp47 = LANGUAGE_MAP[language] || 'en-US';

  const { isSupported, isListening, startListening, stopListening } =
    useSpeechRecognition({
      language: bcp47,
      continuous: true,
      interimResults: false,
      onResult: handleResult,
      onError: handleError,
      onEnd: handleEnd,
    });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (disabled || !isSupported) return;
      setError(null);
      transcriptRef.current = '';
      startListening();
    },
    [disabled, isSupported, startListening]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (!isListening) return;
      stopListening();
    },
    [isListening, stopListening]
  );

  const handleClick = useCallback(() => {
    if (disabled || !isSupported) return;
    setError(null);
    if (isListening) {
      stopListening();
      if (transcriptRef.current) {
        onTranscript(transcriptRef.current);
        transcriptRef.current = '';
      }
    } else {
      transcriptRef.current = '';
      startListening();
    }
  }, [disabled, isSupported, isListening, startListening, stopListening, onTranscript]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        disabled={disabled}
        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
        className={`cursor-pointer p-1.5 rounded-full transition-all duration-200 flex items-center justify-center shrink-0 min-w-[36px] min-h-[36px] relative
          ${isListening
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
            : disabled
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-400 hover:text-brand-green hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping bg-red-400/40" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </>
        )}
      </button>
      {error && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-red-500 text-white text-[10px] rounded whitespace-nowrap shadow-lg z-50">
          {error}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-500" />
        </div>
      )}
    </div>
  );
};

export default VoiceButton;
