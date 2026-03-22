import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate Song API Route for 8gent Jr
 *
 * POST /api/nick/generate-song
 * Body: { sentences: string[], childName?: string, style?: string, tempo?: string }
 *
 * Uses OpenAI to generate kid-friendly song lyrics from selected words,
 * then returns lyrics + metadata ready for Suno/audio generation.
 */

interface GenerateSongRequest {
  sentences: string[];
  childName?: string;
  style?: string;
  tempo?: string;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const MAX_MODE_HEADER = `[Is_Max_Mode:Max]
[Quality:Maxi]
[Realism:Max]
[Real_Instruments:Max]
[Persona:Max]`;

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSongRequest = await request.json();
    const { sentences, childName, style, tempo } = body;

    if (!sentences || sentences.length === 0) {
      return NextResponse.json(
        { error: 'No words provided' },
        { status: 400 }
      );
    }

    // Build the lyrics generation prompt
    const wordsStr = sentences.join(', ');
    const nameStr = childName || 'a child';
    const styleHint = style
      ? `The song should feel ${style}.`
      : "The song should be fun and playful.";
    const tempoHint = tempo ? `Tempo: ${tempo}.` : '';

    const systemPrompt = `You are a children's songwriter. Write short, simple, fun song lyrics for young children (ages 3-6).
Use repetition, rhyming, and simple vocabulary. Keep it to 2-3 short verses and a chorus.
Only output the lyrics, nothing else. No markdown formatting.`;

    const userPrompt = `Write a short children's song for ${nameStr} using these words: ${wordsStr}.
${styleHint} ${tempoHint}
Keep it under 120 words. Make it easy to sing along to.`;

    let lyrics = '';
    let title = `${childName || 'My'}'s Song`;

    if (OPENAI_API_KEY) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 300,
            temperature: 0.8,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          lyrics = data.choices?.[0]?.message?.content?.trim() || '';

          // Try to extract a title from the first line if it looks like one
          const firstLine = lyrics.split('\n')[0];
          if (firstLine && firstLine.length < 40 && !firstLine.includes('[')) {
            title = firstLine.replace(/^#+\s*/, '').replace(/["""]/g, '');
          }
        }
      } catch (err) {
        console.error('OpenAI lyrics generation error:', err);
      }
    }

    // Fallback lyrics if OpenAI failed
    if (!lyrics) {
      const safeWords = sentences.slice(0, 5);
      lyrics = [
        `${safeWords[0] || 'La'} ${safeWords[1] || 'la'} ${safeWords[0] || 'la'},`,
        `Sing along with me!`,
        `${safeWords[2] || 'Happy'} ${safeWords[3] || 'day'}, ${safeWords[2] || 'happy'} ${safeWords[3] || 'day'},`,
        `${safeWords[4] || 'Fun'} as can be!`,
      ].join('\n');
    }

    // Build Suno-compatible style string with MAX MODE (from cowrite system)
    const baseStyle = [
      style || "children's pop, playful",
      tempo || 'medium tempo',
    ]
      .filter(Boolean)
      .join(', ');
    const sunoStyle = `${MAX_MODE_HEADER}\n\n${baseStyle}`;

    return NextResponse.json({
      title,
      lyrics,
      style: sunoStyle,
      words: sentences,
      childName: childName || null,
    });
  } catch (error) {
    console.error('Generate song error:', error);
    return NextResponse.json(
      { error: 'Failed to generate song' },
      { status: 500 }
    );
  }
}
