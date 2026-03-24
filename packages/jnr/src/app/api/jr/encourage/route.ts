import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

/**
 * POST /api/jr/encourage
 *
 * AI encouragement messages based on child's communication progress.
 * GLP-stage-aware, returns spoken + display messages and word suggestions.
 */

export const runtime = 'edge';

interface EncourageRequest {
  currentSentence: string[];
  glpStage?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  recentPhrases?: string[];
  childName?: string;
}

interface EncourageResponse {
  shouldEncourage: boolean;
  encouragementType: 'start' | 'continue' | 'complete' | 'celebrate' | 'expand';
  message: string;
  spokenMessage: string;
  suggestedWords: string[];
  suggestedCompletions: string[];
  emotionalTone: 'encouraging' | 'excited' | 'curious' | 'celebratory';
}

const FALLBACK: EncourageResponse = {
  shouldEncourage: true,
  encouragementType: 'start',
  message: "Let's talk!",
  spokenMessage: "Let's talk!",
  suggestedWords: ['I', 'want', 'more', 'help'],
  suggestedCompletions: [],
  emotionalTone: 'encouraging',
};

export async function POST(request: NextRequest) {
  try {
    const body: EncourageRequest = await request.json();
    const {
      currentSentence = [],
      glpStage = 2,
      timeOfDay = 'afternoon',
      recentPhrases = [],
      childName = 'buddy',
    } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(FALLBACK, { status: 200 });
    }

    const { text } = await generateText({
      model: anthropic('claude-3-5-haiku-20241022'),
      prompt: `You are a warm, encouraging AAC assistant helping ${childName}, a young child, communicate using picture symbols.

RULES:
- Keep responses SHORT (1-2 sentences max)
- Use SIMPLE words a child understands
- Be warm, never pushy
- Match GLP Stage ${glpStage}/6 (1-2 = single words/gestalts, 3-4 = simple sentences, 5-6 = complex)

STATE:
- Time: ${timeOfDay}
- Words selected: ${currentSentence.length > 0 ? `"${currentSentence.join(' ')}"` : 'none yet'}
- Recent phrases: ${recentPhrases.slice(0, 5).join(', ') || 'none'}

Provide encouragement + suggested words (max 4) + sentence completions (max 3).

Respond with ONLY valid JSON (no markdown):
{"shouldEncourage":true,"encouragementType":"continue","message":"Great start!","spokenMessage":"Good!","suggestedWords":["more","play","eat","go"],"suggestedCompletions":["I want more","I want to play"],"emotionalTone":"encouraging"}`,
    });

    let response: EncourageResponse;
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      response = JSON.parse(cleaned);
      response.suggestedWords = (response.suggestedWords || [])
        .filter((w): w is string => typeof w === 'string')
        .slice(0, 6);
      response.suggestedCompletions = (response.suggestedCompletions || [])
        .filter((c): c is string => typeof c === 'string')
        .slice(0, 4);
    } catch {
      response = {
        shouldEncourage: true,
        encouragementType: currentSentence.length === 0 ? 'start' : 'continue',
        message: currentSentence.length === 0
          ? 'Tap a word to start talking!'
          : "Keep going! You're doing great!",
        spokenMessage: currentSentence.length === 0
          ? 'What would you like to say?'
          : 'Keep going!',
        suggestedWords: ['I', 'want', 'more', 'help', 'yes', 'no'],
        suggestedCompletions: [],
        emotionalTone: 'encouraging',
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Jr Encourage] Error:', error);
    return NextResponse.json(FALLBACK, { status: 200 });
  }
}
