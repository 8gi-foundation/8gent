/**
 * @fileoverview AAC Screenshot Uploader Component
 *
 * A multi-image upload component for capturing existing AAC setups.
 * Part of the onboarding flow to enable "zero friction" familiarity.
 *
 * Features:
 * - Drag and drop support
 * - Multi-image upload (up to 5)
 * - Image preview with remove
 * - Analysis progress indicator
 * - Confidence score display
 * - "This looks right" / "Let me adjust" options
 *
 * @module components/onboarding/AACUploader
 */

import React, { useCallback, useRef, useState } from 'react';
import type { AACAnalysisState, FamiliarityProfile } from '@/types/familiarity';

/**
 * Props for the AACUploader component
 */
export interface AACUploaderProps {
  /** Current analysis state */
  state: AACAnalysisState;
  /** Merged familiarity profile (after analysis) */
  profile: FamiliarityProfile | null;
  /** Maximum images allowed */
  maxImages?: number;
  /** Callback when images are added */
  onAddImages: (images: string[]) => void;
  /** Callback when image is removed */
  onRemoveImage: (index: number) => void;
  /** Callback to start analysis */
  onAnalyze: () => Promise<void>;
  /** Callback when user confirms profile */
  onConfirm: () => void;
  /** Callback when user wants to adjust */
  onAdjust: () => void;
  /** Callback to skip this step */
  onSkip?: () => void;
  /** Whether this step is optional */
  isOptional?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Converts a File to base64 data URI
 */
async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * AAC Screenshot Uploader Component
 *
 * @example
 * ```tsx
 * <AACUploader
 *   state={familiarityState}
 *   profile={familiarityProfile}
 *   onAddImages={addImages}
 *   onRemoveImage={removeImage}
 *   onAnalyze={analyzeImages}
 *   onConfirm={confirmProfile}
 *   onAdjust={() => setShowAdjustments(true)}
 *   onSkip={goToNextStep}
 *   isOptional
 * />
 * ```
 */
export function AACUploader({
  state,
  profile,
  maxImages = 5,
  onAddImages,
  onRemoveImage,
  onAnalyze,
  onConfirm,
  onAdjust,
  onSkip,
  isOptional = true,
  className = '',
}: AACUploaderProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const validFiles = Array.from(files).filter(
        (file) =>
          file.type.startsWith('image/') &&
          ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)
      );

      if (validFiles.length === 0) return;

      try {
        const dataUris = await Promise.all(validFiles.map(fileToDataUri));
        onAddImages(dataUris);
      } catch (error) {
        console.error('Failed to process images:', error);
      }
    },
    [onAddImages]
  );

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Click to upload
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Render based on current step
  const renderContent = () => {
    switch (state.step) {
      case 'upload':
        return renderUploadStep();
      case 'analyzing':
        return renderAnalyzingStep();
      case 'review':
        return renderReviewStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderUploadStep();
    }
  };

  // Upload step UI
  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Upload Your Current AAC
        </h3>
        <p className="mt-2 text-gray-600">
          Share screenshots of your existing AAC so we can make this feel familiar
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-8
          transition-all duration-200 cursor-pointer
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
          ${state.uploadedImages.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={state.uploadedImages.length < maxImages ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={state.uploadedImages.length >= maxImages}
        />

        <div className="flex flex-col items-center">
          {/* Upload icon */}
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <p className="text-gray-700 font-medium">
            Drop screenshots here or tap to upload
          </p>
          <p className="text-sm text-gray-500 mt-1">
            PNG, JPEG up to {maxImages} images
          </p>
        </div>
      </div>

      {/* Image previews */}
      {state.uploadedImages.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            {state.uploadedImages.length} of {maxImages} screenshots
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {state.uploadedImages.map((imageUrl, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden group"
              >
                <img
                  src={imageUrl}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(index);
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full
                             opacity-0 group-hover:opacity-100 transition-opacity
                             flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {state.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onAnalyze}
          disabled={state.uploadedImages.length === 0}
          className={`
            flex-1 py-3 px-6 rounded-xl font-medium text-white
            transition-all duration-200
            ${state.uploadedImages.length > 0
              ? 'bg-blue-600 hover:bg-blue-700 active:scale-98'
              : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          Analyze Screenshots
        </button>

        {isOptional && onSkip && (
          <button
            onClick={onSkip}
            className="py-3 px-6 rounded-xl font-medium text-gray-600
                       border border-gray-300 hover:bg-gray-50
                       transition-all duration-200"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );

  // Analyzing step UI
  const renderAnalyzingStep = () => (
    <div className="flex flex-col items-center py-12 space-y-6">
      {/* Animated spinner */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
        <div
          className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"
          style={{ animationDuration: '1s' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-blue-600">{state.progress}%</span>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900">Analyzing your AAC...</h3>
        <p className="mt-2 text-gray-600">
          We're learning from your existing setup
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${state.progress}%` }}
        />
      </div>
    </div>
  );

  // Review step UI
  const renderReviewStep = () => {
    if (!profile) return null;

    const confidencePercent = Math.round(profile.layoutSimilarityScore);
    const isHighConfidence = confidencePercent >= 70;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            We found your layout!
          </h3>
          <p className="mt-2 text-gray-600">
            Here's what we detected from your AAC
          </p>
        </div>

        {/* Confidence score */}
        <div className={`
          p-4 rounded-xl border-2 flex items-center justify-between
          ${isHighConfidence ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}
        `}>
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${isHighConfidence ? 'bg-green-500' : 'bg-yellow-500'}
            `}>
              {isHighConfidence ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                </svg>
              )}
            </div>
            <div>
              <p className={`font-medium ${isHighConfidence ? 'text-green-700' : 'text-yellow-700'}`}>
                {confidencePercent}% Match
              </p>
              <p className={`text-sm ${isHighConfidence ? 'text-green-600' : 'text-yellow-600'}`}>
                {isHighConfidence ? 'Great match!' : 'Some adjustments may help'}
              </p>
            </div>
          </div>
        </div>

        {/* Detected settings */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-gray-900">Detected Settings</h4>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <p className="text-gray-500">Grid Layout</p>
              <p className="font-medium text-gray-900">
                {profile.gridLayout.rows} x {profile.gridLayout.cols}
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <p className="text-gray-500">Card Size</p>
              <p className="font-medium text-gray-900 capitalize">{profile.cardSize}</p>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <p className="text-gray-500">Color Scheme</p>
              <p className="font-medium text-gray-900 capitalize">
                {profile.colorScheme === 'fitzgerald' ? 'Fitzgerald Key' : profile.colorScheme}
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <p className="text-gray-500">Icon Style</p>
              <p className="font-medium text-gray-900 uppercase">{profile.iconStyle}</p>
            </div>
          </div>

          {/* Categories detected */}
          <div className="bg-white p-3 rounded-lg">
            <p className="text-gray-500 text-sm">Categories Found</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.detectedCategories.slice(0, 8).map((cat, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: cat.color + '40',
                    color: cat.color,
                    border: `1px solid ${cat.color}`,
                  }}
                >
                  {cat.name}
                </span>
              ))}
              {profile.detectedCategories.length > 8 && (
                <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                  +{profile.detectedCategories.length - 8} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full py-3 px-6 rounded-xl font-medium text-white
                       bg-green-600 hover:bg-green-700 active:scale-98
                       transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            This looks right!
          </button>

          <button
            onClick={onAdjust}
            className="w-full py-3 px-6 rounded-xl font-medium text-gray-600
                       border border-gray-300 hover:bg-gray-50
                       transition-all duration-200"
          >
            Let me adjust some things
          </button>
        </div>
      </div>
    );
  };

  // Complete step UI
  const renderCompleteStep = () => (
    <div className="flex flex-col items-center py-8 space-y-4">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900">
          All set!
        </h3>
        <p className="mt-2 text-gray-600">
          Your familiar layout will be applied
        </p>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-2xl p-6 ${className}`}>
      {renderContent()}
    </div>
  );
}

export default AACUploader;
