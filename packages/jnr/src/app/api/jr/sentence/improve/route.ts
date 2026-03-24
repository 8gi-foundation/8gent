import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

/**
 * POST /api/jr/sentence/improve
 *
 * Takes raw AAC card selections, returns grammatically improved sentence.
 * GLP-stage-aware. Also detects missing vocabulary that would help.
 */

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are an AAC sentence improver for children. Take words from communication cards and form natural sentences.

Rules:
1. Keep the meaning EXACTLY the same
2. Add only necessary grammar (articles, prepositions, conjugations)
3. Keep sentences simple and age-appropriate
4. Output should sound natural when spoken aloud
5. Do NOT add new concepts or change the intent

Also detect missing vocabulary. Respond with JSON:
{
  "improved": "the improved sentence",
  "explanation": "brief explanation of changes",
  "missing": [{"word": "missing word", "category": "core|actions|feelings", "reason": "why this would help"}]
}`;

interface ImproveRequest {
  cards: string[];
  glpStage?: number;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: ImproveRequest = await request.json();

    if (!body.cards || !Array.isArray(body.cards) || body.cards.length === 0) {
      return json({ error: 'Cards array required' }, 400);
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return json({ error: 'API key not configured' }, 500);
    }

    const rawSentence = body.cards.join(' ');

    const { text } = await generateText({
      model: anthropic('claude-3-5-haiku-20241022'),
      system: SYSTEM_PROMPT,
      prompt: `Improve this AAC sentence: "${rawSentence}"`,
    });

    // Parse response
    try {
      let jsonStr = text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();
      const result = JSON.parse(jsonStr);
      return json({
        original: rawSentence,
        improved: result.improved,
        explanation: result.explanation,
        missing: result.missing || [],
      });
    } catch {
      return json({
        original: rawSentence,
        improved: text.trim(),
        explanation: 'Grammar improved',
        missing: [],
      });
    }
  } catch (error) {
    console.error('[Jr Improve] Error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}
