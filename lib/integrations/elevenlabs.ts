import { getServerEnv } from "@/lib/env";

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export async function synthesizeSpeech(text: string, voiceId?: string) {
  const env = getServerEnv();
  if (!env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not configured.");
  }

  const resolvedVoiceId = voiceId ?? env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": env.ELEVENLABS_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.8
      }
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to synthesise speech with ElevenLabs: ${message}`);
  }

  const audioBuffer = await response.arrayBuffer();
  return Buffer.from(audioBuffer);
}
