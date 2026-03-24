import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

/**
 * POST /api/jr/autocomplete
 *
 * AI word completion for AAC. Takes partial word input and existing
 * vocabulary, returns age-appropriate word suggestions.
 */

export const runtime = 'edge';

interface AutocompleteRequest {
  input: string;
  existingWords?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AutocompleteRequest = await request.json();
    const { input, existingWords = [] } = body;

    if (!input || input.trim().length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured', suggestions: [] },
        { status: 500 },
      );
    }

    const { text } = await generateText({
      model: anthropic('claude-3-5-haiku-20241022'),
      prompt: `You are an AAC (Augmentative and Alternative Communication) word suggestion assistant for a young child.

The child has started typing: "${input}"

Existing vocabulary cards: ${existingWords.slice(0, 50).join(', ')}

Suggest 5 words that:
1. Complete or relate to what they started typing
2. Are age-appropriate for a young child
3. Are commonly used in daily communication
4. Mix between words they already have and new useful words

Return ONLY a JSON array of 5 words, no explanation. Example: ["hello", "help", "happy", "home", "hungry"]`,
    });

    let suggestions: string[] = [];
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      suggestions = JSON.parse(cleaned);
      if (!Array.isArray(suggestions)) suggestions = [];
      suggestions = suggestions
        .filter((s): s is string => typeof s === 'string')
        .slice(0, 6);
    } catch {
      const wordMatch = text.match(/["']([^"']+)["']/g);
      if (wordMatch) {
        suggestions = wordMatch.map((w) => w.replace(/["']/g, '')).slice(0, 6);
      }
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('[Jr Autocomplete] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions', suggestions: [] },
      { status: 500 },
    );
  }
}
