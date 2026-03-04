/**
 * @fileoverview 8gent Jr Package Entry Point
 *
 * 8gent Jr is an AAC (Augmentative and Alternative Communication) system
 * designed for autistic children. It provides a mobile-first, accessible
 * interface for communication using visual symbols and speech synthesis.
 *
 * @module @8gent/jnr
 */

// Types
export type * from './types/aac';

// Components - AAC
export { AACBoard } from './components/aac/AACBoard';
export { AACCard } from './components/aac/AACCard';
export { CardGenerator } from './components/aac/CardGenerator';
export { CategoryNav } from './components/aac/CategoryNav';
export { SpeechEngine, SpeechEngineContext } from './components/aac/SpeechEngine';

// Lib - AAC
export { CARD_LIBRARY, getAllCards, getCardsByCategory, searchCards } from './lib/aac/cardLibrary';
export { AAC_CATEGORIES, getCategoryById, getCategoryColors } from './lib/aac/categories';
export { generateCardImage, optimizePrompt, validatePrompt } from './lib/aac/cardGenerator';

// Lib - Speech
export { speak, speakWithElevenLabs, speakWithWebSpeech, stopSpeech } from './lib/speech/tts';

// Lib - Voice
export {
  createVoicePreview,
  createVoiceFromPreview,
  getChildVoicePresets,
} from './lib/voice/voiceDesigner';

// Hooks
export { useAAC } from './hooks/useAAC';
export { useSpeech } from './hooks/useSpeech';
export { useVoiceDesigner } from './hooks/useVoiceDesigner';

// Voice Components
export { VoiceCreator } from './components/voice/VoiceCreator';

// UI Components
export { Button, PrimaryButton, SecondaryButton, DangerButton, SuccessButton, ActionButton } from './components/ui/Button';
export { Card, CardHeader, CardBody, CardFooter, AACCardDisplay } from './components/ui/Card';
export { Grid, GridItem, AACGrid, HorizontalScroll, Flex } from './components/ui/Grid';
export { Modal, ModalHeader, ModalBody, ModalFooter, ConfirmModal } from './components/ui/Modal';
export { SafeArea, SafeAreaView, FixedBottomBar, FixedHeader, ScrollContent, SafeAreaStyles, useSafeAreaInsets } from './components/ui/SafeArea';

// UI Types
export type * from './types/ui';
export type * from './types/voice';
