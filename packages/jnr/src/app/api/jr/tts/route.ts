import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/jr/tts
 *
 * Text-to-speech endpoint. Uses ElevenLabs when API key is available,
 * returns 204 otherwise (client falls back to browser Speech Synthesis).
 *
 * Body: { text: string, voiceId?: string, stability?: number, similarityBoost?: number }
 * Returns: audio/mpeg or 204 No Content
 */

export const runtime = 'edge';

interface TTSRequest {
  text: string;
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
}

// Rachel - warm female voice, good for children
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { text, voiceId, stability = 0.7, similarityBoost = 0.8 } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 500) {
      return NextResponse.json({ error: 'Text too long (max 500 chars)' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      // No ElevenLabs key -- client should use browser TTS
      return new NextResponse(null, { status: 204 });
    }

    const voice = voiceId || DEFAULT_VOICE_ID;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: Math.max(0, Math.min(1, stability)),
            similarity_boost: Math.max(0, Math.min(1, similarityBoost)),
            style: 0.3,
          },
        }),
      },
    );

    if (!response.ok) {
      console.error('[Jr TTS] ElevenLabs error:', response.status);
      return new NextResponse(null, { status: 204 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.byteLength),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[Jr TTS] Error:', error);
    return new NextResponse(null, { status: 204 });
  }
}
