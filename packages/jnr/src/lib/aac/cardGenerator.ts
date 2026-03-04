/**
 * @fileoverview AI Card Image Generation
 *
 * This module provides AI-powered image generation for creating custom
 * AAC cards. It uses image generation APIs (e.g., Fal.ai) with prompts
 * optimized for ARASAAC-style symbols.
 *
 * The generated images match the visual style of standard AAC symbols:
 * - Simple, clear illustrations
 * - Bold outlines
 * - Limited color palette
 * - High contrast for visibility
 * - Consistent visual language
 *
 * @module lib/aac/cardGenerator
 */

import type {
  CardGenerationRequest,
  CardGenerationResult,
  AACCard,
} from '@/types/aac';

/**
 * Style presets for different image generation styles
 */
const STYLE_PRESETS = {
  arasaac: {
    prefix:
      'Simple AAC symbol in ARASAAC style, clear bold outlines, flat colors, white background, centered composition, high contrast, suitable for children, minimal details,',
    suffix:
      'vector illustration style, clean lines, educational pictogram, accessibility symbol',
    negativePrompt:
      'complex, detailed, realistic, photographic, 3d, shadows, gradient, busy background, text, watermark',
  },
  cartoon: {
    prefix:
      'Cute cartoon illustration for children, simple shapes, bright colors, friendly style,',
    suffix: 'child-friendly, cheerful, educational',
    negativePrompt:
      'scary, complex, realistic, adult themes, violence, text, watermark',
  },
  simple: {
    prefix:
      'Minimalist icon, simple geometric shapes, flat design, single color,',
    suffix: 'clean, modern, accessible',
    negativePrompt:
      'detailed, complex, gradients, 3d, shadows, realistic, text',
  },
  realistic: {
    prefix: 'Clear photograph-style illustration, simple composition,',
    suffix: 'clean background, high clarity, educational',
    negativePrompt: 'blurry, complex background, cluttered, artistic, abstract',
  },
};

/**
 * Configuration for the image generation API
 */
interface GeneratorConfig {
  /** API endpoint for image generation */
  apiEndpoint: string;
  /** API key for authentication */
  apiKey: string;
  /** Model to use for generation */
  model: string;
  /** Default image size */
  imageSize: { width: number; height: number };
}

/**
 * Default configuration (Fal.ai)
 */
const DEFAULT_CONFIG: GeneratorConfig = {
  apiEndpoint: 'https://fal.run/fal-ai/flux/schnell',
  apiKey: '', // Set via environment variable
  model: 'flux-schnell',
  imageSize: { width: 512, height: 512 },
};

/**
 * Generate an AAC card image using AI
 *
 * @param request - The card generation request
 * @param config - Optional configuration overrides
 * @returns Promise resolving to the generation result
 *
 * @example
 * ```ts
 * const result = await generateCardImage({
 *   prompt: 'a child eating pizza happily',
 *   label: 'eat pizza',
 *   categoryId: 'actions',
 *   style: 'arasaac'
 * });
 *
 * if (result.success) {
 *   console.log('Generated card:', result.card);
 * }
 * ```
 */
export async function generateCardImage(
  request: CardGenerationRequest,
  config: Partial<GeneratorConfig> = {}
): Promise<CardGenerationResult> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const style = request.style || 'arasaac';
  const stylePreset = STYLE_PRESETS[style];

  // Build the full prompt with style modifiers
  const fullPrompt = `${stylePreset.prefix} ${request.prompt}, ${stylePreset.suffix}`;

  try {
    // TODO: Implement actual API call to Fal.ai or similar
    // const response = await fetch(fullConfig.apiEndpoint, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Key ${fullConfig.apiKey}`,
    //   },
    //   body: JSON.stringify({
    //     prompt: fullPrompt,
    //     negative_prompt: stylePreset.negativePrompt,
    //     image_size: fullConfig.imageSize,
    //     num_inference_steps: 4,
    //     seed: Math.floor(Math.random() * 1000000),
    //   }),
    // });
    //
    // const data = await response.json();
    // const imageUrl = data.images[0].url;

    // Placeholder implementation
    const imageUrl = `/cards/generated/${Date.now()}.png`;

    const card: AACCard = {
      id: `generated-${Date.now()}`,
      label: request.label,
      speechText: request.speechText || request.label,
      imageUrl,
      categoryId: request.categoryId,
      isGenerated: true,
      isCustom: true,
      symbolSource: 'fal-generated',
      glpStage: request.glpStage,
      createdAt: new Date().toISOString(),
      generationMeta: {
        prompt: request.prompt,
        generatedAt: new Date().toISOString(),
        model: fullConfig.model,
        seed: Math.floor(Math.random() * 1000000),
      },
    };

    return {
      success: true,
      card,
      cached: false,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      cached: false,
    };
  }
}

/**
 * Optimize a user prompt for AAC image generation
 *
 * Takes a natural language description and reformats it to work
 * better with image generation models for AAC symbols.
 *
 * @param userPrompt - The user's original prompt
 * @returns Optimized prompt for image generation
 */
export function optimizePrompt(userPrompt: string): string {
  // Remove unnecessary words
  let optimized = userPrompt
    .toLowerCase()
    .replace(/\b(a|an|the|please|can you|make|create|generate)\b/gi, '')
    .trim();

  // Add helpful context for AAC symbols
  if (!optimized.includes('person') && !optimized.includes('child')) {
    // If describing an action, add a simple figure
    if (
      optimized.match(
        /\b(eating|drinking|playing|running|sleeping|reading)\b/i
      )
    ) {
      optimized = `simple figure ${optimized}`;
    }
  }

  return optimized;
}

/**
 * Validate that a prompt is appropriate for child-friendly content
 *
 * @param prompt - The prompt to validate
 * @returns True if the prompt is appropriate
 */
export function validatePrompt(prompt: string): {
  valid: boolean;
  reason?: string;
} {
  const blockedTerms = [
    'violent',
    'scary',
    'blood',
    'weapon',
    'adult',
    'inappropriate',
  ];

  const lowerPrompt = prompt.toLowerCase();
  for (const term of blockedTerms) {
    if (lowerPrompt.includes(term)) {
      return {
        valid: false,
        reason: `Prompt contains inappropriate content for children's AAC`,
      };
    }
  }

  return { valid: true };
}

/**
 * Get suggested prompts for common custom card needs
 */
export function getSuggestedPrompts(): Array<{
  label: string;
  prompt: string;
  category: string;
}> {
  return [
    { label: 'my pet', prompt: 'a friendly pet', category: 'animals' },
    { label: 'favorite food', prompt: 'delicious food on a plate', category: 'food' },
    { label: 'my school', prompt: 'school building', category: 'places' },
    { label: 'my family', prompt: 'happy family together', category: 'people' },
    { label: 'my toy', prompt: 'favorite toy', category: 'toys' },
  ];
}

export default generateCardImage;
