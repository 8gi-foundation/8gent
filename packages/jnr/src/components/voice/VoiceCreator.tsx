/**
 * VoiceCreator Component for 8gent Jr
 *
 * Child-friendly voice creation wizard with:
 * - Fun, colorful preset selection UI
 * - Voice preview before creation
 * - Visual feedback and animations
 * - Celebration on completion
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceDesigner } from '@/hooks/useVoiceDesigner';
import type { VoiceDesignerConfig, VoiceConfig } from '@/types/aac';

// Play icon SVG
const PlayIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

// Stop icon SVG
const StopIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

// Check icon SVG
const CheckIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Confetti celebration component
const Confetti = () => {
  const colors = ['#FFD93D', '#6BCB77', '#4ECDC4', '#F472B6', '#60A5FA', '#A78BFA'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            backgroundColor: piece.color,
            left: `${piece.left}%`,
          }}
          initial={{ top: '-5%', rotate: 0, opacity: 1 }}
          animate={{
            top: '105%',
            rotate: piece.rotation,
            opacity: 0,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
};

// Waveform visualization component for audio playback
const Waveform = ({ isActive }: { isActive: boolean }) => {
  const bars = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-blue-500 rounded-full"
          animate={
            isActive
              ? {
                  height: [6, 24 + Math.random() * 24, 6],
                }
              : { height: 6 }
          }
          transition={
            isActive
              ? {
                  duration: 0.3 + Math.random() * 0.3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: i * 0.03,
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
};

// Voice preset card component
interface VoicePresetCardProps {
  preset: VoiceDesignerConfig;
  isSelected: boolean;
  isGenerating: boolean;
  onSelect: () => void;
}

const VoicePresetCard = ({
  preset,
  isSelected,
  isGenerating,
  onSelect,
}: VoicePresetCardProps) => {
  // Get emoji based on gender and age
  const getEmoji = () => {
    if (preset.gender === 'male') return '👦';
    if (preset.gender === 'female') return '👧';
    return '🧒';
  };

  // Get color based on gender
  const getColor = () => {
    if (preset.gender === 'male') return 'from-blue-400 to-blue-500';
    if (preset.gender === 'female') return 'from-pink-400 to-pink-500';
    return 'from-purple-400 to-purple-500';
  };

  return (
    <motion.button
      onClick={onSelect}
      disabled={isGenerating}
      className={`
        relative
        w-full
        p-4
        rounded-2xl
        border-2
        transition-all
        ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-lg'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
        }
        ${isGenerating ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
      `}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: isGenerating ? 1 : 1.02 }}
    >
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <CheckIcon />
        </motion.div>
      )}

      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className={`
            w-14 h-14
            rounded-full
            bg-gradient-to-br ${getColor()}
            flex items-center justify-center
            text-2xl
            shadow-md
          `}
        >
          {getEmoji()}
        </div>

        {/* Info */}
        <div className="flex-1 text-left">
          <p className="font-semibold text-gray-800 text-lg">
            {preset.description}
          </p>
          <p className="text-sm text-gray-500 capitalize">
            {preset.accent} accent
          </p>
        </div>
      </div>
    </motion.button>
  );
};

// Props for VoiceCreator
export interface VoiceCreatorProps {
  apiKey: string;
  childName?: string;
  onComplete?: (voice: VoiceConfig) => void;
  onSkip?: () => void;
}

/**
 * VoiceCreator - Fun voice creation wizard using Voice Designer presets
 */
export function VoiceCreator({
  apiKey,
  childName = 'My',
  onComplete,
  onSkip,
}: VoiceCreatorProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [createdVoice, setCreatedVoice] = useState<VoiceConfig | null>(null);
  const [voiceName, setVoiceName] = useState(`${childName}'s Voice`);
  const [step, setStep] = useState<'select' | 'preview' | 'name' | 'creating'>(
    'select'
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    generatePreview,
    createVoice,
    preview,
    clearPreview,
    isGenerating,
    isCreating,
    presets,
  } = useVoiceDesigner({
    apiKey,
    onVoiceCreated: (voice) => {
      setCreatedVoice(voice);
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        onComplete?.(voice);
      }, 3000);
    },
    onError: (error) => {
      console.error('Voice creation error:', error);
      setStep('select');
    },
  });

  // Handle preset selection
  const handleSelectPreset = useCallback(
    async (preset: VoiceDesignerConfig) => {
      await generatePreview(preset);
    },
    [generatePreview]
  );

  // When preview is ready, go to preview step
  useEffect(() => {
    if (preview && step === 'select') {
      setStep('preview');
    }
  }, [preview, step]);

  // Play/stop preview audio
  const handlePlayPreview = useCallback(() => {
    if (!preview) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(preview.audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [preview, isPlaying]);

  // Handle voice creation
  const handleCreateVoice = useCallback(async () => {
    setStep('creating');
    await createVoice(voiceName);
  }, [createVoice, voiceName]);

  // Handle try different voice
  const handleTryDifferent = useCallback(() => {
    clearPreview();
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
    setStep('select');
  }, [clearPreview]);

  // Render celebration screen
  if (showCelebration) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-yellow-100 to-orange-100 flex items-center justify-center">
        <Confetti />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 100 }}
          className="text-center px-6"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="text-8xl mb-6"
          >
            🎉
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Amazing!</h1>
          <p className="text-xl text-gray-600">{voiceName} is ready!</p>
        </motion.div>
      </div>
    );
  }

  // Step: Creating voice
  if (step === 'creating' || isCreating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-6 flex flex-col items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl mb-8"
        >
          ✨
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Creating your voice...
        </h2>
        <p className="text-gray-500 text-center">
          This might take a moment...
        </p>
        <Waveform isActive={true} />
      </div>
    );
  }

  // Step: Name the voice
  if (step === 'name') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎤</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Name Your Voice
            </h1>
            <p className="text-gray-600">
              Give your new voice a name!
            </p>
          </div>

          <input
            type="text"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            className="
              w-full
              px-6 py-4
              text-xl
              font-semibold
              text-center
              border-2 border-gray-200
              rounded-2xl
              focus:border-blue-500 focus:outline-none
              mb-6
            "
            placeholder="Enter a name..."
            autoFocus
          />

          <div className="flex gap-3">
            <button
              onClick={() => setStep('preview')}
              className="
                flex-1
                min-h-[56px]
                px-6
                rounded-2xl
                bg-gray-100 hover:bg-gray-200
                text-gray-700
                font-semibold
                transition-colors
              "
            >
              Back
            </button>
            <button
              onClick={handleCreateVoice}
              disabled={!voiceName.trim()}
              className="
                flex-1
                min-h-[56px]
                px-6
                rounded-2xl
                bg-green-500 hover:bg-green-600
                disabled:bg-gray-300 disabled:cursor-not-allowed
                text-white
                font-semibold
                transition-colors
                flex items-center justify-center gap-2
              "
            >
              <span className="text-xl">✨</span>
              Create Voice
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step: Preview voice
  if (step === 'preview' && preview) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="text-6xl mb-4">🎧</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Listen to Your Voice!
          </h1>
          <p className="text-gray-600 mb-8">
            Tap play to hear how your voice sounds
          </p>

          {/* Preview card */}
          <div className="bg-white rounded-3xl p-6 shadow-xl mb-8">
            <p className="text-lg text-gray-600 mb-4 italic">
              "{preview.config.sampleText}"
            </p>

            <Waveform isActive={isPlaying} />

            {/* Play button */}
            <motion.button
              onClick={handlePlayPreview}
              className={`
                w-20 h-20
                mx-auto
                rounded-full
                flex items-center justify-center
                shadow-lg
                text-white
                ${
                  isPlaying
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }
              `}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {isPlaying ? (
                <StopIcon />
              ) : (
                <PlayIcon />
              )}
            </motion.button>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setStep('name')}
              className="
                w-full
                min-h-[56px]
                px-6
                rounded-2xl
                bg-green-500 hover:bg-green-600
                text-white
                font-semibold
                transition-colors
                flex items-center justify-center gap-2
              "
            >
              <span className="text-xl">👍</span>
              I Like This Voice!
            </button>
            <button
              onClick={handleTryDifferent}
              className="
                w-full
                min-h-[56px]
                px-6
                rounded-2xl
                bg-gray-100 hover:bg-gray-200
                text-gray-700
                font-semibold
                transition-colors
              "
            >
              Try a Different Voice
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step: Select voice preset
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-8 pt-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Choose Your Voice! 🎤
        </h1>
        <p className="text-gray-600">
          Pick a voice that sounds like you
        </p>
      </div>

      {/* Generating indicator */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 left-4 right-4 bg-blue-500 text-white p-4 rounded-2xl shadow-lg z-50 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            Creating preview...
          </div>
        </motion.div>
      )}

      {/* Voice presets grid */}
      <div className="max-w-md mx-auto space-y-4 mb-8">
        <AnimatePresence>
          {presets.map((preset, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <VoicePresetCard
                preset={preset}
                isSelected={preview?.config === preset}
                isGenerating={isGenerating}
                onSelect={() => handleSelectPreset(preset)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Skip button */}
      {onSkip && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 p-4">
          <div className="max-w-md mx-auto">
            <button
              onClick={onSkip}
              className="
                w-full
                min-h-[48px]
                px-6
                rounded-xl
                bg-gray-100 hover:bg-gray-200
                text-gray-600
                font-medium
                transition-colors
              "
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceCreator;
