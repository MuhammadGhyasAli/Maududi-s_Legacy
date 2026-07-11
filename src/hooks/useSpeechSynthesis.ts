'use client';

import { useCallback, useRef, useState } from 'react';

type SynthesisStatus = 'idle' | 'loading' | 'playing' | 'error';

interface UseSpeechSynthesisOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const { onStart, onEnd, onError } = options;
  const [status, setStatus] = useState<SynthesisStatus>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef(false);

  const speak = useCallback(
    async (text: string) => {
      if (!text) return;

      abortRef.current = false;

      try {
        setStatus('loading');
        onStart?.();

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'TTS request failed' }));
          throw new Error(error.error || `HTTP ${response.status}`);
        }

        if (abortRef.current) return;

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        return new Promise<void>((resolve, reject) => {
          const audio = new Audio(url);
          audioRef.current = audio;

          audio.oncanplaythrough = () => {
            setStatus('playing');
          };

          audio.onended = () => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            setStatus('idle');
            onEnd?.();
            resolve();
          };

          audio.onerror = () => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            setStatus('error');
            const msg = 'Audio playback failed';
            onError?.(msg);
            reject(new Error(msg));
          };

          audio.play().catch((err) => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            setStatus('error');
            const msg = err instanceof Error ? err.message : 'Playback failed';
            onError?.(msg);
            reject(new Error(msg));
          });
        });
      } catch (error) {
        if (abortRef.current) return;
        setStatus('error');
        const msg = error instanceof Error ? error.message : 'Synthesis failed';
        onError?.(msg);
        throw error;
      }
    },
    [onStart, onEnd, onError]
  );

  const stop = useCallback(() => {
    abortRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setStatus('idle');
    onEnd?.();
  }, [onEnd]);

  return {
    status,
    speak,
    stop,
    isSpeaking: status === 'loading' || status === 'playing',
  };
}
