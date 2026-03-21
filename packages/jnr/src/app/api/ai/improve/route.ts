import { NextRequest } from 'next/server';
import { IMPROVE_SENTENCE_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import type { GLPStage } from '@/lib/glp/stages';
import { GLP_STAGES } from '@/lib/glp/stages';

export const runtime = 'edge';

/**
 * AI Sentence Improvement API for 8gent Jr
 *
 * Takes raw AAC card selections and returns:
 * - Grammatically improved sentence
 * - Explanation of changes
 * - Missing vocabulary suggestions
 *
 * Uses Groq (llama-3.1-8b-instant) for ultra-fast, free responses.
 */

interface ImproveRequest {
  /** Array of card labels (e.g., ["I", "want", "apple", "juice"]) */
  cards: string[];
  /** Optional child name for personalization */
  childName?: string;
  /** GLP stage (1-6). Stage 1-2: gestalts protected, Stage 3: cap at 5 words */
  glpStage?: GLPStage;
}

interface MissingVocabulary {
  word: string;
  category: string;
  reason: string;
}

interface ImproveResponse {
  improved: string;
  explanation: string;
  missing: MissingVocabulary[];
}

/** Cap a sentence to maxWords for stage 3 */
function capWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  return words.length > maxWords ? words.slice(0, maxWords).join(' ') : text;
}

export async function POST(request: NextRequest) {
  try {
    const body: ImproveRequest = await request.json();

    if (!body.cards || !Array.isArray(body.cards) || body.cards.length === 0) {
      return new Response(JSON.stringify({ error: 'Cards array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Priority: Groq (free, fast) > OpenAI > Anthropic
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!groqKey && !openaiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rawSentence = body.cards.join(' ');

    // GLP Stage Guard: protect gestalts at early stages
    if (body.glpStage && body.glpStage <= 2) {
      // Stage 1-2: gestalts are sacred, return input unchanged
      return new Response(
        JSON.stringify({
          original: rawSentence,
          improved: rawSentence,
          explanation: `GLP Stage ${body.glpStage}: gestalts protected, no modifications made`,
          missing: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.glpStage === 3) {
      // Stage 3: cap output at 5 words (single words + 2-word combos stage)
      const stageConfig = GLP_STAGES[3];
      const maxWords = Math.max(stageConfig.maxWordsPerUtterance, 5);
      const words = rawSentence.split(/\s+/);
      if (words.length <= maxWords) {
        return new Response(
          JSON.stringify({
            original: rawSentence,
            improved: rawSentence,
            explanation: `GLP Stage 3: already within ${maxWords}-word limit`,
            missing: [],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // For longer inputs at stage 3, let AI improve but we'll cap after
    }

    // Use Groq if available (primary - free and fast)
    if (groqKey) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 512,
          messages: [
            {
              role: 'system',
              content: IMPROVE_SENTENCE_SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: `Improve this AAC sentence: "${rawSentence}"`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Groq API error:', error);
        // Fall through to OpenAI if Groq fails
        if (!openaiKey) {
          return new Response(JSON.stringify({ error: 'AI service error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } else {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          // Parse the JSON response
          try {
            let jsonStr = content;
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
              jsonStr = jsonMatch[1].trim();
            }

            const result: ImproveResponse = JSON.parse(jsonStr);

            return new Response(
              JSON.stringify({
                original: rawSentence,
                improved: body.glpStage === 3 ? capWords(result.improved, 5) : result.improved,
                explanation: result.explanation,
                missing: result.missing || [],
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          } catch {
            // If JSON parsing fails, use the raw content as the improved sentence
            return new Response(
              JSON.stringify({
                original: rawSentence,
                improved: body.glpStage === 3 ? capWords(content.trim(), 5) : content.trim(),
                explanation: 'Grammar improved',
                missing: [],
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          }
        }
      }
    }

    // Fallback to OpenAI
    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 512,
          messages: [
            {
              role: 'system',
              content: IMPROVE_SENTENCE_SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: `Improve this AAC sentence: "${rawSentence}"`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API error:', error);
        return new Response(JSON.stringify({ error: 'AI service error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return new Response(JSON.stringify({ error: 'No response from AI' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Parse the JSON response
      try {
        let jsonStr = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1].trim();
        }

        const result: ImproveResponse = JSON.parse(jsonStr);

        return new Response(
          JSON.stringify({
            original: rawSentence,
            improved: result.improved,
            explanation: result.explanation,
            missing: result.missing || [],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } catch {
        return new Response(
          JSON.stringify({
            original: rawSentence,
            improved: content.trim(),
            explanation: 'Grammar improved',
            missing: [],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response(JSON.stringify({ error: 'No AI provider available' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Improve API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
