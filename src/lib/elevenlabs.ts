export const ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
export const ELEVENLABS_MODEL_ID = 'eleven_multilingual_v2';

export interface TtsOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

export async function synthesizeSpeech(options: TtsOptions): Promise<ArrayBuffer> {
  const {
    text,
    voiceId = ELEVENLABS_VOICE_ID,
    modelId = ELEVENLABS_MODEL_ID,
    stability = 0.5,
    similarityBoost = 0.75,
  } = options;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`ElevenLabs TTS failed (${response.status}): ${errorBody}`);
  }

  return response.arrayBuffer();
}
