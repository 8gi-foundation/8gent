# 8gent Jr

> AAC Communication System for Autistic Children

8gent Jr is an Augmentative and Alternative Communication (AAC) application designed specifically for autistic children and their families. It provides a mobile-first, accessible interface for communication using visual symbols and high-quality speech synthesis.

## Vision

Every child deserves a voice. 8gent Jr gives non-verbal and minimally-verbal children a powerful tool to express their needs, feelings, and thoughts through:

- **Visual Communication Cards** - Clear, consistent symbols following ARASAAC standards
- **AI-Generated Custom Cards** - Create personalized cards with AI image generation
- **Natural Voice Output** - ElevenLabs Voice Designer integration for age-appropriate voices
- **Mobile-First Design** - Built for tablets and phones, where kids actually use apps

## Features

### AAC Communication Board

The core of 8gent Jr is a configurable AAC board with:

- **18 Fitzgerald Key Categories** - Standard color-coded categories (people, actions, feelings, etc.)
- **Sentence Builder** - Combine cards to create multi-word phrases
- **Pre-built Card Library** - 100+ starter cards covering essential vocabulary
- **GLP Stage Support** - Cards tagged by Gestalt Language Processing developmental stages

### Card Generation System

8gent Jr supports two types of cards:

#### Pre-built Library
- ARASAAC-style symbols
- Professionally designed for consistency
- Organized by Fitzgerald Key categories
- Tagged with GLP stages for developmental appropriateness

#### AI-Generated Cards
Parents and therapists can create custom cards on-demand:

```typescript
const result = await generateCardImage({
  prompt: 'a child eating pizza happily',
  label: 'eat pizza',
  categoryId: 'actions',
  style: 'arasaac'
});
```

The AI generates images in a consistent ARASAAC-like style, matching the pre-built library aesthetic.

### Voice System

#### ElevenLabs Integration
High-quality, natural-sounding speech using ElevenLabs TTS:
- Ultra-low latency with Turbo v2.5 model
- Audio caching for common phrases
- Multiple voice options

#### Voice Designer
Create custom voices that match the child's identity:

```typescript
const preview = await createVoicePreview({
  age: 'young',
  gender: 'female',
  accent: 'american',
  description: 'A warm, friendly voice for a young girl',
  sampleText: 'I want apple please',
});
```

Parents can design a voice that:
- Matches their child's age and gender
- Has regional accent preferences
- Feels personal and unique

#### Web Speech Fallback
Automatic fallback to browser TTS when offline or if ElevenLabs is unavailable.

### Additional Features (Coming Soon)

- **Bubble Timer** - Visual countdown timer with popping bubbles
- **Music Instruments** - Drums, xylophone for sensory exploration
- **Educational Games** - Matching, sequencing, cause-and-effect

## Mobile-First Design Philosophy

8gent Jr is designed tablets and phones first, following these principles:

1. **Large Touch Targets** - Minimum 44x44pt touch areas per iOS HIG
2. **High Contrast** - Clear visual distinction for low vision users
3. **Haptic Feedback** - Tactile confirmation for every interaction
4. **No Overwhelm** - Clean, focused interfaces without visual clutter
5. **Gesture Support** - Swipe navigation between categories
6. **Offline-First** - Core functionality works without internet

## Technical Architecture

```
packages/jnr/
├── src/
│   ├── components/
│   │   ├── aac/          # AAC board components
│   │   ├── games/        # Educational games
│   │   ├── music/        # Music instruments
│   │   ├── timer/        # Bubble timer
│   │   └── ui/           # Shared UI components
│   ├── lib/
│   │   ├── aac/          # Card library and generation
│   │   ├── speech/       # TTS integration
│   │   └── voice/        # Voice Designer
│   ├── hooks/            # React hooks
│   └── types/            # TypeScript definitions
├── public/
│   └── cards/            # Pre-generated card images
└── package.json
```

## Usage

```tsx
import {
  AACBoard,
  SpeechEngine,
  useAAC,
  useSpeech,
  AAC_CATEGORIES,
} from '@8gent/jnr';

function App() {
  const { cards, categories, activeCategoryId, addToSentence } = useAAC();
  const { speak } = useSpeech({ elevenLabsApiKey: process.env.ELEVENLABS_KEY });

  return (
    <SpeechEngine>
      <AACBoard
        cards={cards}
        categories={categories}
        activeCategoryId={activeCategoryId}
        onCardTap={(card) => {
          addToSentence(card);
          speak(card.speechText);
        }}
        // ...
      />
    </SpeechEngine>
  );
}
```

## Environment Variables

```env
# ElevenLabs TTS (optional, falls back to Web Speech)
ELEVENLABS_API_KEY=your_api_key

# Fal.ai for card generation (optional)
FAL_API_KEY=your_api_key
```

## Fitzgerald Key Categories

| Category | Color | Description |
|----------|-------|-------------|
| People | Yellow | Pronouns, family, people |
| Actions | Green | Verbs, doing words |
| Feelings | Blue | Emotions, states |
| Questions | Purple | Question words |
| Greetings | Orange | Social phrases |
| Places | Brown | Locations |
| Food | Red | Food items |
| Drinks | Red | Beverages |
| Animals | Green | Animals |
| Colors | Various | Color words |
| Numbers | White | Numerals, quantity |
| Body | Pink | Body parts |
| Clothes | Pink | Clothing items |
| Toys | Yellow | Play items |
| Time | White | Time concepts |
| Weather | Blue | Weather conditions |
| Safety | Red | STOP, HELP, NO |
| Custom | Gray | User-created cards |

## GLP (Gestalt Language Processing) Stages

Cards are tagged with appropriate GLP stages to support echolalic and gestalt language learners:

- **Stage 1**: Echolalia - Full scripts and delayed echoes
- **Stage 2**: Mix & Match - Combining gestalts in new ways
- **Stage 3**: Single words + combinations
- **Stage 4**: Beginning grammar
- **Stage 5**: More advanced grammar
- **Stage 6**: Spontaneous, self-generated language

## Contributing

8gent Jr is part of the 8gent ecosystem. See the main [8gent repository](https://github.com/...) for contribution guidelines.

## License

MIT

---

*8gent Jr: Every child deserves a voice.*
