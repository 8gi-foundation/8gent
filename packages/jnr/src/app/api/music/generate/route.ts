import { NextRequest, NextResponse } from 'next/server';

/**
 * 8gent Jr - Song Generation API
 *
 * POST /api/music/generate
 * Body: { prompt: string, childName?: string }
 *
 * Flow:
 * 1. Use Groq (or OpenAI fallback) to expand the prompt into child-friendly lyrics + style
 * 2. Call Suno to start generation - returns taskId for polling
 * 3. If no SUNO_API_KEY, returns 503 so the UI can hide the feature
 */

export const maxDuration = 60;

const SONG_PROMPT_SYSTEM = `You are a children's songwriter. Given a prompt or list of words/sentences, create a fun, simple song for children aged 4-10.

Rules:
1. Keep lyrics simple, repetitive, and age-appropriate
2. Use verse/chorus structure
3. Each line should be 5-8 words max
4. Make it uplifting and joyful
5. Include [Verse] and [Chorus] tags

Respond with JSON only:
{
  "title": "Song Title (2-4 words)",
  "style": "children's pop, happy, playful, simple melody, acoustic guitar",
  "lyrics": "[Verse]\\nLine 1\\nLine 2\\n\\n[Chorus]\\nLine 1\\nLine 2\\n\\n[Verse]\\nLine 1\\nLine 2\\n\\n[Chorus]\\nLine 1\\nLine 2"
}`;

const MAX_MODE_HEADER = `[Is_Max_Mode:Max]
[Quality:Maxi]
[Realism:Max]
[Real_Instruments:Max]
[Persona:Max]`;

function jsonResp(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}

function parseSongData(content: string): { title: string; style: string; lyrics: string } | null {
  try {
    let jsonStr = content;
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) jsonStr = match[1].trim();
    const parsed = JSON.parse(jsonStr);
    if (parsed.title && parsed.style && parsed.lyrics) return parsed;
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const sunoKey = process.env.SUNO_API_KEY;
  if (!sunoKey) {
    return jsonResp({ error: 'Song generation not configured', code: 'E-NO-KEY' }, 503);
  }

  try {
    const body = await request.json();
    const prompt: string = body.prompt || '';
    const childName: string = body.childName || 'the child';

    if (!prompt.trim()) {
      return jsonResp({ error: 'Prompt is required' }, 400);
    }

    // Step 1: Generate lyrics via LLM
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const userMessage = `Create a children's song for ${childName} based on this prompt: "${prompt}"`;

    let songData: { title: string; style: string; lyrics: string } | null = null;

    if (groqKey) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            max_tokens: 1024,
            messages: [
              { role: 'system', content: SONG_PROMPT_SYSTEM },
              { role: 'user', content: userMessage },
            ],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) songData = parseSongData(content);
        }
      } catch (err) {
        console.error('[music/generate] Groq error:', err);
      }
    }

    if (!songData && openaiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 1024,
            messages: [
              { role: 'system', content: SONG_PROMPT_SYSTEM },
              { role: 'user', content: userMessage },
            ],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) songData = parseSongData(content);
        }
      } catch (err) {
        console.error('[music/generate] OpenAI error:', err);
      }
    }

    // Fallback lyrics if both LLMs failed
    if (!songData) {
      songData = {
        title: `${childName}'s Song`,
        style: "children's pop, happy, playful",
        lyrics: `[Verse]\nLa la la, sing along\nMaking music all day long\n\n[Chorus]\nSing with me, sing with me\nHappy as can be`,
      };
    }

    // Step 2: Submit to Suno
    const fullStyle = `${MAX_MODE_HEADER}\n\n${songData.style}`;

    const sunoRes = await fetch('https://api.sunoapi.org/api/v1/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sunoKey}` },
      body: JSON.stringify({
        customMode: true,
        instrumental: false,
        title: songData.title,
        style: fullStyle,
        prompt: songData.lyrics,
        model: 'V4_5',
      }),
    });

    if (!sunoRes.ok) {
      console.error('[music/generate] Suno HTTP error:', sunoRes.status);
      return jsonResp({ error: 'Song generation failed', code: 'E-SUNO-HTTP' }, 500);
    }

    const sunoData = await sunoRes.json();

    if (sunoData.code !== 200 || !sunoData.data?.taskId) {
      console.error('[music/generate] Suno bad response:', sunoData);
      return jsonResp({ error: 'Song generation failed', code: 'E-SUNO-DATA' }, 500);
    }

    return jsonResp({
      taskId: sunoData.data.taskId,
      title: songData.title,
      style: songData.style,
      lyrics: songData.lyrics,
    });
  } catch (error) {
    console.error('[music/generate] Unexpected error:', error);
    return jsonResp({ error: 'Song generation failed', code: 'E-5000' }, 500);
  }
}
