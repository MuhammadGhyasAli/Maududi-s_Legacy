const GROQ_API_BASE = 'https://api.groq.com/openai/v1';

function getKeys(): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const k = process.env[`GROQ_API_KEY_${i}`];
    if (k) keys.push(k);
  }
  const fallback = process.env.GROQ_API_KEY;
  if (fallback) keys.push(fallback);
  return keys;
}

interface GroqRequest {
  model: string;
  messages: { role: string; content: any }[];
  temperature: number;
  max_tokens: number;
  top_p: number;
}

export async function callGroq(body: GroqRequest): Promise<{ response: string }> {
  const keys = getKeys();
  if (keys.length === 0) {
    throw new Error('No GROQ_API_KEY configured');
  }

  let lastErr: string | null = null;

  for (const key of keys) {
    try {
      const res = await fetch(`${GROQ_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        return { response: data.choices[0].message.content };
      }

      if (res.status === 429 || res.status >= 500) {
        lastErr = `Groq API error: ${res.status} ${await res.text()}`;
        continue;
      }

      const errText = await res.text();
      throw new Error(`Groq API error: ${res.status} ${errText}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      lastErr = msg;
    }
  }

  throw new Error(lastErr || 'All Groq API keys failed');
}
