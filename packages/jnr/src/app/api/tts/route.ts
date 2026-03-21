import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { readFileSync, unlinkSync } from "fs";

export const runtime = "nodejs";

/**
 * KittenTTS API Route
 *
 * POST /api/tts
 * Body: { text: string, voice?: string, speed?: number }
 * Returns: audio/wav
 *
 * Uses local KittenTTS with Kiki voice for natural child-friendly speech.
 * Falls back to 204 No Content if generation fails (client should use browser TTS).
 */
export async function POST(req: Request) {
  try {
    const { text, voice = "Kiki", speed = 0.85 } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text" }, { status: 400 });
    }

    // Sanitize text: remove quotes and backslashes, limit length
    const safe = text.replace(/['"\\\n\r]/g, " ").trim().slice(0, 500);
    if (!safe) {
      return NextResponse.json({ error: "Empty text after sanitize" }, { status: 400 });
    }

    const wavPath = `/tmp/jnr-tts-${Date.now()}.wav`;

    execSync(
      `python3 -c "from kittentts import KittenTTS; m = KittenTTS('KittenML/kitten-tts-nano-0.8'); m.generate_to_file('${safe}', '${wavPath}', voice='${voice}', speed=${speed})"`,
      { timeout: 15000 }
    );

    const audio = readFileSync(wavPath);
    try {
      unlinkSync(wavPath);
    } catch {
      // cleanup best-effort
    }

    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("KittenTTS error:", error);
    // Return 204 so client knows to fall back to browser TTS
    return new NextResponse(null, { status: 204 });
  }
}
