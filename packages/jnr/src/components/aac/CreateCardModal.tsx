'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

const CATEGORIES = [
  { id: 'people', label: 'People', icon: '👤' },
  { id: 'actions', label: 'Actions', icon: '🏃' },
  { id: 'feelings', label: 'Feelings', icon: '😊' },
  { id: 'questions', label: 'Questions', icon: '❓' },
  { id: 'greetings', label: 'Greetings', icon: '👋' },
  { id: 'places', label: 'Places', icon: '🏠' },
  { id: 'food', label: 'Food', icon: '🍎' },
  { id: 'drinks', label: 'Drinks', icon: '🥤' },
  { id: 'animals', label: 'Animals', icon: '🐾' },
  { id: 'toys', label: 'Toys', icon: '🧸' },
  { id: 'body', label: 'Body', icon: '🦴' },
  { id: 'clothes', label: 'Clothes', icon: '👕' },
  { id: 'colors', label: 'Colors', icon: '🎨' },
  { id: 'numbers', label: 'Numbers', icon: '🔢' },
  { id: 'time', label: 'Time', icon: '🕐' },
  { id: 'weather', label: 'Weather', icon: '🌤️' },
  { id: 'safety', label: 'Safety', icon: '🆘' },
  { id: 'custom', label: 'Custom', icon: '✨' },
] as const;

interface CreateCardModalProps {
  tenantId: Id<'tenants'>;
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (cardId: string) => void;
}

export function CreateCardModal({ tenantId, isOpen, onClose, onCreated }: CreateCardModalProps) {
  const addCard = useMutation(api.cardPacks.addCustomCard);

  const [label, setLabel] = useState('');
  const [speechText, setSpeechText] = useState('');
  const [categoryId, setCategoryId] = useState('custom');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!label.trim()) {
      setError('Label is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addCard({
        tenantId,
        label: label.trim(),
        speechText: (speechText.trim() || label.trim()),
        imageUrl: imageUrl.trim() || `https://placehold.co/200x200/FFF8F0/E8610A?text=${encodeURIComponent(label.trim())}`,
        categoryId,
      });
      onCreated?.(result.cardId);
      // Reset form
      setLabel('');
      setSpeechText('');
      setCategoryId('custom');
      setImageUrl('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create card');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26, 22, 18, 0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-xl"
        style={{ backgroundColor: '#FFFDF9', color: '#1A1612' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: 'var(--font-fraunces, serif)' }}
          >
            Create Card
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-black/5"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-4">
          {/* Label */}
          <div>
            <label
              htmlFor="card-label"
              className="block text-sm font-medium mb-1"
              style={{ fontFamily: 'var(--font-inter, sans-serif)' }}
            >
              Label *
            </label>
            <input
              id="card-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Teddy bear"
              maxLength={40}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
              style={{
                backgroundColor: '#FFF8F0',
                border: '1.5px solid #E8E0D6',
                fontFamily: 'var(--font-inter, sans-serif)',
                              }}
              autoFocus
            />
          </div>

          {/* Speech text */}
          <div>
            <label
              htmlFor="card-speech"
              className="block text-sm font-medium mb-1"
              style={{ fontFamily: 'var(--font-inter, sans-serif)' }}
            >
              Speech text
              <span className="ml-1 font-normal text-xs" style={{ color: '#8C8078' }}>
                (defaults to label)
              </span>
            </label>
            <input
              id="card-speech"
              type="text"
              value={speechText}
              onChange={(e) => setSpeechText(e.target.value)}
              placeholder={label || 'What the card says when tapped'}
              maxLength={100}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
              style={{
                backgroundColor: '#FFF8F0',
                border: '1.5px solid #E8E0D6',
                fontFamily: 'var(--font-inter, sans-serif)',
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="card-category"
              className="block text-sm font-medium mb-1"
              style={{ fontFamily: 'var(--font-inter, sans-serif)' }}
            >
              Category
            </label>
            <select
              id="card-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors appearance-none"
              style={{
                backgroundColor: '#FFF8F0',
                border: '1.5px solid #E8E0D6',
                fontFamily: 'var(--font-inter, sans-serif)',
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label
              htmlFor="card-image"
              className="block text-sm font-medium mb-1"
              style={{ fontFamily: 'var(--font-inter, sans-serif)' }}
            >
              Image URL
              <span className="ml-1 font-normal text-xs" style={{ color: '#8C8078' }}>
                (optional, AI generation coming soon)
              </span>
            </label>
            <input
              id="card-image"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
              style={{
                backgroundColor: '#FFF8F0',
                border: '1.5px solid #E8E0D6',
                fontFamily: 'var(--font-inter, sans-serif)',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'transparent',
                border: '1.5px solid #E8E0D6',
                color: '#1A1612',
                fontFamily: 'var(--font-inter, sans-serif)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !label.trim()}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{
                backgroundColor: '#E8610A',
                color: '#FFFDF9',
                fontFamily: 'var(--font-inter, sans-serif)',
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCardModal;
