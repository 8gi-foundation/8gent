/**
 * @fileoverview AI Card Generation Interface
 *
 * The CardGenerator component provides an interface for creating new AAC cards
 * using AI image generation. Parents/caregivers can describe what they need,
 * and the system generates an ARASAAC-style image for the new card.
 *
 * Features:
 * - Text prompt input for describing the card
 * - Style selection (ARASAAC, cartoon, simple)
 * - Preview before saving
 * - Category assignment
 * - Speech text customization
 *
 * The generation uses a fine-tuned model to produce consistent ARASAAC-style
 * symbols that match the pre-built card library.
 *
 * @module components/aac/CardGenerator
 */

import React, { useState } from 'react';
import type { CardGenerationRequest, AACCategory, AACCard } from '@/types/aac';

/**
 * Props for the CardGenerator component
 */
export interface CardGeneratorProps {
  /** Available categories for the new card */
  categories: AACCategory[];

  /** Callback when a new card is generated and saved */
  onCardGenerated: (card: AACCard) => void;

  /** Callback to close the generator */
  onClose: () => void;

  /** Whether generation is currently in progress */
  isGenerating?: boolean;
}

/**
 * Generation style options
 */
export type GenerationStyle = 'arasaac' | 'cartoon' | 'realistic' | 'simple';

/**
 * AI Card Generation Interface Component
 *
 * @example
 * ```tsx
 * <CardGenerator
 *   categories={categories}
 *   onCardGenerated={handleNewCard}
 *   onClose={closeGenerator}
 * />
 * ```
 */
export function CardGenerator({
  categories,
  onCardGenerated,
  onClose,
  isGenerating = false,
}: CardGeneratorProps): React.ReactElement {
  const [prompt, setPrompt] = useState('');
  const [label, setLabel] = useState('');
  const [speechText, setSpeechText] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [style, setStyle] = useState<GenerationStyle>('arasaac');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement generateCard function using AI image generation API
  // TODO: Add retry logic for failed generations
  // TODO: Implement preview functionality
  // TODO: Add loading states and progress indicators

  const handleGenerate = async () => {
    if (!prompt.trim() || !label.trim()) {
      setError('Please provide both a description and label');
      return;
    }

    const request: CardGenerationRequest = {
      prompt: prompt.trim(),
      label: label.trim(),
      speechText: speechText.trim() || label.trim(),
      categoryId,
      style,
    };

    // TODO: Call card generation API
    // const result = await generateCard(request);
    // setPreviewUrl(result.imageUrl);
  };

  const handleSave = () => {
    if (!previewUrl) return;

    const newCard: AACCard = {
      id: `generated-${Date.now()}`,
      label,
      speechText: speechText || label,
      imageUrl: previewUrl,
      categoryId,
      isGenerated: true,
      generationMeta: {
        prompt,
        generatedAt: new Date().toISOString(),
        model: 'arasaac-style-v1',
      },
    };

    onCardGenerated(newCard);
  };

  return (
    <div className="card-generator">
      <header className="card-generator-header">
        <h2>Create New Card</h2>
        <button onClick={onClose} aria-label="Close">
          &times;
        </button>
      </header>

      <div className="card-generator-form">
        {/* Description Input */}
        <div className="form-field">
          <label htmlFor="prompt">
            Describe what you want
            <span className="hint">e.g., "A child eating pizza"</span>
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you need..."
            rows={3}
          />
        </div>

        {/* Label Input */}
        <div className="form-field">
          <label htmlFor="label">Card Label</label>
          <input
            id="label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., eat pizza"
          />
        </div>

        {/* Speech Text Input */}
        <div className="form-field">
          <label htmlFor="speechText">
            Speech Text
            <span className="hint">(optional, defaults to label)</span>
          </label>
          <input
            id="speechText"
            type="text"
            value={speechText}
            onChange={(e) => setSpeechText(e.target.value)}
            placeholder="What should be spoken..."
          />
        </div>

        {/* Category Selection */}
        <div className="form-field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Style Selection */}
        <div className="form-field">
          <label>Image Style</label>
          <div className="style-options">
            {(['arasaac', 'cartoon', 'simple'] as GenerationStyle[]).map(
              (s) => (
                <button
                  key={s}
                  className={`style-option ${style === s ? 'active' : ''}`}
                  onClick={() => setStyle(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && <div className="error-message">{error}</div>}

        {/* Preview Area */}
        {previewUrl && (
          <div className="preview-area">
            <img src={previewUrl} alt="Generated preview" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="card-generator-actions">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || !label.trim()}
            className="btn-primary"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>

          {previewUrl && (
            <button onClick={handleSave} className="btn-success">
              Save Card
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CardGenerator;
