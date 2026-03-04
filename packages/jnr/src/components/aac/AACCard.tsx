/**
 * @fileoverview Individual AAC Card Component
 *
 * The AACCard represents a single communication symbol that can be tapped
 * to add to the sentence builder or speak immediately. Cards display an
 * image (ARASAAC-style or AI-generated) with an optional text label.
 *
 * Features:
 * - Large touch target (minimum 44x44px for accessibility)
 * - Visual feedback on press (scale animation)
 * - Haptic feedback on tap
 * - Support for both pre-built and AI-generated images
 * - Configurable label visibility
 *
 * @module components/aac/AACCard
 */

import React from 'react';
import type { AACCard as AACCardType } from '@/types/aac';

/**
 * Props for the AACCard component
 */
export interface AACCardProps {
  /** The card data to display */
  card: AACCardType;

  /** Size of the card in pixels */
  size: number;

  /** Whether to show the text label */
  showLabel: boolean;

  /** Whether this card is currently selected (in sentence builder) */
  isSelected: boolean;

  /** Callback when card is tapped */
  onTap: (card: AACCardType) => void;

  /** Callback for long press (edit mode) */
  onLongPress?: (card: AACCardType) => void;

  /** Whether the card is in edit mode */
  isEditing?: boolean;
}

/**
 * Individual AAC Card Component
 *
 * @example
 * ```tsx
 * <AACCard
 *   card={happyCard}
 *   size={100}
 *   showLabel={true}
 *   isSelected={false}
 *   onTap={handleCardTap}
 *   onLongPress={handleLongPress}
 * />
 * ```
 */
export function AACCard({
  card,
  size,
  showLabel,
  isSelected,
  onTap,
  onLongPress,
  isEditing = false,
}: AACCardProps): React.ReactElement {
  // TODO: Implement press animation with framer-motion
  // TODO: Add haptic feedback using navigator.vibrate()
  // TODO: Implement long press detection
  // TODO: Add accessibility attributes (role="button", aria-label, etc.)

  const handleTap = () => {
    // Trigger haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onTap(card);
  };

  const handleLongPress = () => {
    if (onLongPress) {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      onLongPress(card);
    }
  };

  return (
    <button
      className="aac-card"
      onClick={handleTap}
      aria-label={card.speechText}
      role="button"
      style={{
        width: size,
        height: size,
        backgroundColor: card.backgroundColor || '#ffffff',
        borderColor: card.borderColor || '#e0e0e0',
        borderWidth: isSelected ? 3 : 1,
        borderStyle: 'solid',
        borderRadius: 12,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.1s ease',
      }}
    >
      {/* Card Image */}
      <div
        className="aac-card-image"
        style={{
          flex: 1,
          width: '100%',
          backgroundImage: `url(${card.imageUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Card Label */}
      {showLabel && (
        <span
          className="aac-card-label"
          style={{
            fontSize: Math.max(12, size * 0.14),
            fontWeight: 600,
            textAlign: 'center',
            marginTop: 4,
            lineHeight: 1.2,
          }}
        >
          {card.label}
        </span>
      )}

      {/* Edit indicator for edit mode */}
      {isEditing && (
        <div className="aac-card-edit-indicator">
          {/* Edit icon overlay */}
        </div>
      )}

      {/* AI-generated indicator */}
      {card.isGenerated && (
        <div
          className="aac-card-generated-badge"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            fontSize: 10,
          }}
        >
          AI
        </div>
      )}
    </button>
  );
}

export default AACCard;
