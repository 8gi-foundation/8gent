'use client';

import React, { useState, useMemo } from 'react';
import { type GLPStage, GLP_STAGES, getStageConfig } from './stages';
import {
  type VocabEntry,
  getVocabularyForStage,
  getArasaacUrl,
} from './vocabulary';
import { FITZGERALD_COLORS } from '../fitzgerald-key';
import type { WordCategory } from '../fitzgerald-key';

// =============================================================================
// Types
// =============================================================================

export interface StageLayoutProps {
  /** Current GLP stage (1-6) */
  currentStage: GLPStage;
  /** Called when a word/phrase card is selected */
  onSelectWord?: (entry: VocabEntry) => void;
  /** Called when a mitigable template slot is filled */
  onSelectSlot?: (template: string, fill: string) => void;
  /** Called when stage is changed via the stage indicator */
  onStageChange?: (stage: GLPStage) => void;
  /** Optional CSS class name */
  className?: string;
}

// =============================================================================
// Fitzgerald Color Mapping
// =============================================================================

/** Map vocabulary category to Fitzgerald Key color style */
function getCategoryStyle(category: string): Record<string, string> {
  // Special colors for gestalt/mitigable (not in Fitzgerald)
  if (category === 'gestalt') {
    return { backgroundColor: '#C39BD3', color: '#FFFFFF', borderColor: '#9B59B6' };
  }
  if (category === 'mitigable') {
    return { backgroundColor: '#D7BDE2', color: '#000000', borderColor: '#9B59B6' };
  }

  const fitzKey = category as WordCategory;
  if (FITZGERALD_COLORS[fitzKey]) {
    const c = FITZGERALD_COLORS[fitzKey];
    return { backgroundColor: c.bg, color: c.text, borderColor: c.border };
  }

  return { backgroundColor: '#E0E0E0', color: '#000000', borderColor: '#BDBDBD' };
}

// =============================================================================
// Word Card Component
// =============================================================================

function WordCard({
  entry,
  onSelect,
  size = 'normal',
}: {
  entry: VocabEntry;
  onSelect?: (entry: VocabEntry) => void;
  size?: 'small' | 'normal' | 'large';
}) {
  const style = getCategoryStyle(entry.category);
  const sizeClasses: Record<string, string> = {
    small: 'p-2 text-sm min-h-[48px]',
    normal: 'p-3 text-base min-h-[64px]',
    large: 'p-4 text-lg min-h-[80px]',
  };

  return (
    <button
      onClick={() => onSelect?.(entry)}
      className={[
        'rounded-xl font-semibold shadow-sm border-2',
        'flex flex-col items-center justify-center gap-1',
        'transition-shadow hover:shadow-md active:shadow-inner active:scale-95',
        'select-none cursor-pointer',
        sizeClasses[size],
      ].join(' ')}
      style={{
        ...style,
        borderWidth: '2px',
        borderStyle: 'solid',
      }}
    >
      {entry.symbolId && (
        <img
          src={getArasaacUrl(entry.symbolId)}
          alt={entry.text}
          className="w-8 h-8 object-contain"
          loading="lazy"
        />
      )}
      <span className="text-center leading-tight">{entry.text}</span>
    </button>
  );
}

// =============================================================================
// Visual Scene Layout (Stage 1-2)
// =============================================================================

function VisualSceneLayout({
  gestalts,
  onSelect,
}: {
  gestalts: VocabEntry[];
  onSelect?: (entry: VocabEntry) => void;
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tagGroups = useMemo(() => {
    const groups: Record<string, VocabEntry[]> = {};
    for (const g of gestalts) {
      const tag = g.tags?.[0] ?? 'other';
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(g);
    }
    return groups;
  }, [gestalts]);

  const tags = Object.keys(tagGroups);
  const displayed = activeTag ? (tagGroups[activeTag] ?? []) : gestalts;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
        <button
          onClick={() => setActiveTag(null)}
          className={[
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border-2 transition-colors',
            !activeTag ? 'bg-purple-600 text-white border-purple-700' : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400',
          ].join(' ')}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={[
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border-2 transition-colors capitalize',
              activeTag === tag ? 'bg-purple-600 text-white border-purple-700' : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400',
            ].join(' ')}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto flex-1">
        {displayed.map((entry) => (
          <WordCard key={entry.id} entry={entry} onSelect={onSelect} size="large" />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Mitigable Gestalt Builder (Stage 2)
// =============================================================================

function MitigableLayout({
  mitigables,
  onSelectSlot,
}: {
  mitigables: VocabEntry[];
  onSelectSlot?: (template: string, fill: string) => void;
}) {
  const [activeTemplate, setActiveTemplate] = useState<VocabEntry | null>(null);

  return (
    <div className="flex flex-col gap-4 h-full">
      {activeTemplate && (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4 shrink-0">
          <div className="text-lg font-bold text-purple-800 mb-3">
            {activeTemplate.text}
          </div>
          <div className="flex flex-wrap gap-2">
            {activeTemplate.slotOptions?.map((option) => (
              <button
                key={option}
                onClick={() => {
                  if (activeTemplate.template) {
                    onSelectSlot?.(activeTemplate.template, option);
                  }
                  setActiveTemplate(null);
                }}
                className="px-4 py-2 bg-white border-2 border-purple-400 rounded-lg text-purple-800 font-medium shadow-sm hover:bg-purple-100 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
          <button
            onClick={() => setActiveTemplate(null)}
            className="mt-3 text-sm text-purple-500 hover:text-purple-700"
          >
            Back to templates
          </button>
        </div>
      )}
      {!activeTemplate && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto flex-1">
          {mitigables.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setActiveTemplate(entry)}
              className="p-4 rounded-xl font-semibold shadow-sm border-2 flex flex-col items-center justify-center gap-1 min-h-[80px] transition-shadow hover:shadow-md active:scale-95"
              style={{
                backgroundColor: '#D7BDE2',
                color: '#000000',
                borderColor: '#9B59B6',
                borderWidth: '2px',
                borderStyle: 'solid',
              }}
            >
              <span className="text-center leading-tight">{entry.text}</span>
              <span className="text-xs text-purple-600 mt-1">Tap to fill in</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Core Word Grid (Stage 3-4)
// =============================================================================

function CoreWordLayout({
  words,
  gestalts,
  onSelect,
  showSentenceBuilder,
  sentence,
  onClearSentence,
  onSpeakSentence,
}: {
  words: VocabEntry[];
  gestalts: VocabEntry[];
  onSelect?: (entry: VocabEntry) => void;
  showSentenceBuilder: boolean;
  sentence: VocabEntry[];
  onClearSentence?: () => void;
  onSpeakSentence?: () => void;
}) {
  const [showGestaltSidebar, setShowGestaltSidebar] = useState(false);

  return (
    <div className="flex flex-col gap-3 h-full">
      {showSentenceBuilder && (
        <SentenceStrip
          sentence={sentence}
          onClear={onClearSentence}
          onSpeak={onSpeakSentence}
        />
      )}
      <div className="flex gap-3 flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {words.map((entry) => (
              <WordCard key={entry.id} entry={entry} onSelect={onSelect} size="normal" />
            ))}
          </div>
        </div>
        {gestalts.length > 0 && (
          <div className="shrink-0 flex flex-col">
            <button
              onClick={() => setShowGestaltSidebar(!showGestaltSidebar)}
              className={[
                'px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors mb-2',
                showGestaltSidebar ? 'bg-purple-600 text-white border-purple-700' : 'bg-purple-100 text-purple-700 border-purple-300',
              ].join(' ')}
            >
              Gestalts
            </button>
            {showGestaltSidebar && (
              <div className="w-48 overflow-y-auto flex flex-col gap-2">
                {gestalts.slice(0, 20).map((entry) => (
                  <WordCard key={entry.id} entry={entry} onSelect={onSelect} size="small" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Full Grammar Layout (Stage 5-6)
// =============================================================================

function FullGrammarLayout({
  words,
  onSelect,
  sentence,
  onClearSentence,
  onSpeakSentence,
}: {
  words: VocabEntry[];
  onSelect?: (entry: VocabEntry) => void;
  sentence: VocabEntry[];
  onClearSentence?: () => void;
  onSpeakSentence?: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const wordsByCategory = useMemo(() => {
    const groups: Record<string, VocabEntry[]> = {};
    for (const w of words) {
      if (!groups[w.category]) groups[w.category] = [];
      groups[w.category].push(w);
    }
    return groups;
  }, [words]);

  const categories = Object.keys(wordsByCategory);
  const displayed = activeCategory ? (wordsByCategory[activeCategory] ?? []) : words;

  return (
    <div className="flex flex-col gap-3 h-full">
      <SentenceStrip sentence={sentence} onClear={onClearSentence} onSpeak={onSpeakSentence} />
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
        <button
          onClick={() => setActiveCategory(null)}
          className={[
            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border-2 transition-colors',
            !activeCategory ? 'bg-gray-800 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300',
          ].join(' ')}
        >
          All
        </button>
        {categories.map((cat) => {
          const style = getCategoryStyle(cat);
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border-2 transition-colors capitalize',
                activeCategory === cat ? 'ring-2 ring-offset-1 ring-gray-800' : '',
              ].join(' ')}
              style={{ ...style, borderWidth: '2px', borderStyle: 'solid' }}
            >
              {cat}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 overflow-y-auto flex-1">
        {displayed.map((entry) => (
          <WordCard key={entry.id} entry={entry} onSelect={onSelect} size="small" />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Sentence Strip (shared by Core Word and Full Grammar layouts)
// =============================================================================

function SentenceStrip({
  sentence,
  onClear,
  onSpeak,
}: {
  sentence: VocabEntry[];
  onClear?: () => void;
  onSpeak?: () => void;
}) {
  return (
    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3 flex items-center gap-2 shrink-0 min-h-[56px]">
      <div className="flex-1 flex flex-wrap gap-1 min-h-[32px]">
        {sentence.length === 0 && (
          <span className="text-gray-400 italic text-sm">Tap words to build a sentence...</span>
        )}
        {sentence.map((word, i) => (
          <span
            key={`${word.id}-${i}`}
            className="px-2 py-1 rounded text-sm font-medium"
            style={getCategoryStyle(word.category)}
          >
            {word.text}
          </span>
        ))}
      </div>
      {sentence.length > 0 && (
        <div className="flex gap-1 shrink-0">
          <button
            onClick={onSpeak}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            aria-label="Speak sentence"
          >
            Speak
          </button>
          <button
            onClick={onClear}
            className="p-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
            aria-label="Clear sentence"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Stage Indicator
// =============================================================================

function StageIndicator({
  currentStage,
  onStageChange,
}: {
  currentStage: GLPStage;
  onStageChange?: (stage: GLPStage) => void;
}) {
  const config = getStageConfig(currentStage);

  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="flex gap-1">
        {([1, 2, 3, 4, 5, 6] as GLPStage[]).map((stage) => (
          <button
            key={stage}
            onClick={() => onStageChange?.(stage)}
            className={[
              'w-8 h-8 rounded-full text-xs font-bold transition-all border-2',
              stage === currentStage
                ? 'bg-purple-600 text-white border-purple-700 scale-110'
                : stage < currentStage
                  ? 'bg-purple-200 text-purple-700 border-purple-300'
                  : 'bg-gray-100 text-gray-400 border-gray-200',
            ].join(' ')}
          >
            {stage}
          </button>
        ))}
      </div>
      <div className="text-sm">
        <span className="font-semibold text-purple-700">Stage {config.stage}:</span>{' '}
        <span className="text-gray-600">{config.name}</span>
      </div>
    </div>
  );
}

// =============================================================================
// Main Stage Layout Component
// =============================================================================

export function StageLayout({
  currentStage,
  onSelectWord,
  onSelectSlot,
  onStageChange,
  className,
}: StageLayoutProps) {
  const [sentence, setSentence] = useState<VocabEntry[]>([]);
  const config = getStageConfig(currentStage);

  const stageVocabulary = useMemo(
    () => getVocabularyForStage(currentStage),
    [currentStage],
  );

  const gestalts = useMemo(
    () => stageVocabulary.filter((v) => v.category === 'gestalt'),
    [stageVocabulary],
  );

  const mitigables = useMemo(
    () => stageVocabulary.filter((v) => v.category === 'mitigable'),
    [stageVocabulary],
  );

  const coreWords = useMemo(
    () => stageVocabulary.filter((v) => v.category !== 'gestalt' && v.category !== 'mitigable'),
    [stageVocabulary],
  );

  const handleSelectWord = (entry: VocabEntry) => {
    onSelectWord?.(entry);
    if (config.showSentenceBuilder) {
      setSentence((prev) => [...prev, entry]);
    }
  };

  const handleClearSentence = () => setSentence([]);

  const handleSpeakSentence = () => {
    if (sentence.length === 0) return;
    const text = sentence.map((w) => w.text).join(' ');
    // Use browser speech synthesis as default
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const renderLayout = () => {
    switch (config.layoutType) {
      case 'vsd':
      case 'gestalt-grid':
        return <VisualSceneLayout gestalts={gestalts} onSelect={handleSelectWord} />;

      case 'mitigable':
        return (
          <div className="flex flex-col gap-4 h-full">
            <div className="flex-1">
              <MitigableLayout mitigables={mitigables} onSelectSlot={onSelectSlot} />
            </div>
            {gestalts.length > 0 && (
              <details className="shrink-0">
                <summary className="cursor-pointer text-sm font-medium text-purple-600 hover:text-purple-800 mb-2">
                  Gestalt phrases ({gestalts.length})
                </summary>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {gestalts.slice(0, 12).map((entry) => (
                    <WordCard key={entry.id} entry={entry} onSelect={handleSelectWord} size="small" />
                  ))}
                </div>
              </details>
            )}
          </div>
        );

      case 'core-words':
        return (
          <CoreWordLayout
            words={coreWords}
            gestalts={gestalts}
            onSelect={handleSelectWord}
            showSentenceBuilder={config.showSentenceBuilder}
            sentence={sentence}
            onClearSentence={handleClearSentence}
            onSpeakSentence={handleSpeakSentence}
          />
        );

      case 'full-grammar':
        return (
          <FullGrammarLayout
            words={coreWords}
            onSelect={handleSelectWord}
            sentence={sentence}
            onClearSentence={handleClearSentence}
            onSpeakSentence={handleSpeakSentence}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={['flex flex-col gap-4 h-full', className].filter(Boolean).join(' ')}>
      <StageIndicator currentStage={currentStage} onStageChange={onStageChange} />
      <p className="text-xs text-gray-500 -mt-2">{config.description}</p>
      <div className="flex-1 min-h-0">
        {renderLayout()}
      </div>
    </div>
  );
}

export default StageLayout;
