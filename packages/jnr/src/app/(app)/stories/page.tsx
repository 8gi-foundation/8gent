'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';

// ---- Story data ----

interface Slide {
  text: string;
  scene: string; // illustration description / placeholder label
}

interface Story {
  id: string;
  title: string;
  emoji: string;
  gradient: string;
  slides: Slide[];
}

const STORIES: Story[] = [
  {
    id: 'shop',
    title: 'Going to the Shop',
    emoji: '🛒',
    gradient: 'from-sky-400 to-cyan-500',
    slides: [
      { text: 'Today we are going to the shop.', scene: 'A child and a parent walking towards a bright, friendly shop front' },
      { text: 'We get a basket or a trolley at the door.', scene: 'A smiling child holding a small shopping basket near the entrance' },
      { text: 'We walk around and put things in the basket.', scene: 'A child gently placing fruit into a basket in a colourful aisle' },
      { text: 'Sometimes there is noise and lots of people. That is okay.', scene: 'A busy but calm shop aisle with warm lighting and friendly faces' },
      { text: 'We pay for our things at the till.', scene: 'A child watching a cashier scan items, both smiling' },
      { text: 'Then we go home. We did it!', scene: 'A child and parent walking home with bags, looking happy and proud' },
    ],
  },
  {
    id: 'doctor',
    title: 'Visiting the Doctor',
    emoji: '🩺',
    gradient: 'from-teal-400 to-emerald-500',
    slides: [
      { text: 'Today I am going to see the doctor.', scene: 'A child in a sunny waiting room with toys and books' },
      { text: 'The waiting room has chairs and magazines. I wait for my name.', scene: 'A child sitting calmly, reading a picture book in a cosy waiting area' },
      { text: 'The doctor says hello. They want to help me feel better.', scene: 'A kind doctor kneeling to meet a child at eye level, smiling warmly' },
      { text: 'The doctor might listen to my heart or look in my ears.', scene: 'A doctor gently using a stethoscope while a child sits on an exam table' },
      { text: 'It is okay to feel nervous. The doctor is gentle.', scene: 'A parent holding a child\'s hand while the doctor explains something calmly' },
      { text: 'When it is over, we go home. I was so brave!', scene: 'A child leaving the clinic holding a sticker, smiling at their parent' },
    ],
  },
  {
    id: 'friend',
    title: 'Making a Friend',
    emoji: '👋',
    gradient: 'from-violet-400 to-purple-500',
    slides: [
      { text: 'I see someone I would like to play with.', scene: 'Two children at a playground, one looking curious and friendly' },
      { text: 'I can walk up and say "Hi, my name is ___."', scene: 'A child smiling and waving at another child on the playground' },
      { text: 'I can ask "Do you want to play?"', scene: 'Two children facing each other, both smiling, near a climbing frame' },
      { text: 'We take turns and share. That is how friends play.', scene: 'Two children taking turns on a slide, both laughing' },
      { text: 'If they say no, that is okay. I can try again another day.', scene: 'A child looking thoughtful but calm, a gentle supportive sky behind them' },
      { text: 'New friends are wonderful!', scene: 'Two children sitting side by side, smiling and looking at a picture book together' },
    ],
  },
  {
    id: 'waiting',
    title: 'Waiting My Turn',
    emoji: '⏳',
    gradient: 'from-amber-400 to-orange-500',
    slides: [
      { text: 'Sometimes I have to wait in a queue.', scene: 'A short, friendly queue of children and adults outside an ice cream van' },
      { text: 'Waiting can feel hard. That is normal.', scene: 'A child standing in line, looking a little impatient but calm' },
      { text: 'I can count slowly or take deep breaths.', scene: 'A child closing their eyes gently, taking a big breath, surrounded by soft colour' },
      { text: 'I can look around or think of something nice.', scene: 'A child gazing at clouds, imagining a favourite place' },
      { text: 'The queue moves. Soon it will be my turn.', scene: 'The queue getting shorter, a child near the front looking pleased' },
      { text: 'My turn! Waiting helped me get here.', scene: 'A happy child at the front receiving an ice cream, glowing with pride' },
    ],
  },
  {
    id: 'angry',
    title: 'Feeling Angry',
    emoji: '🌊',
    gradient: 'from-rose-400 to-red-500',
    slides: [
      { text: 'Sometimes I feel a big angry feeling inside.', scene: 'A child with a slightly furrowed brow, surrounded by warm orange swirls' },
      { text: 'That is okay. Feelings are not bad.', scene: 'A child with their hands on their chest, a soft glowing heart in the air' },
      { text: 'I can breathe in slowly... and breathe out slowly.', scene: 'A child with eyes closed, cheeks puffed, breathing out, blue calm waves around them' },
      { text: 'I can squeeze a pillow or stomp my feet.', scene: 'A child stomping gently on soft grass, looking relieved' },
      { text: 'I can tell someone "I feel angry right now."', scene: 'A child pointing to themselves, a parent listening kindly beside them' },
      { text: 'The big feeling gets smaller. I am okay.', scene: 'A calm, smiling child sitting on a beanbag, soft light around them' },
    ],
  },
  {
    id: 'bedtime',
    title: 'Bedtime Routine',
    emoji: '🌙',
    gradient: 'from-indigo-400 to-blue-600',
    slides: [
      { text: 'When it starts to get dark, it is nearly bedtime.', scene: 'A window with a purple twilight sky and a glowing moon' },
      { text: 'First I have a bath or shower and get clean.', scene: 'A child in a bubbly bath, rubber duck on the side, warm yellow light' },
      { text: 'Then I put on my pyjamas.', scene: 'A child in cosy star-patterned pyjamas, yawning happily' },
      { text: 'I brush my teeth for two whole minutes.', scene: 'A child brushing their teeth, looking in a mirror with a big foamy smile' },
      { text: 'Then we read a story or have a cuddle.', scene: 'A child snuggled in bed with a parent reading a picture book by lamplight' },
      { text: 'I close my eyes. Sleep will come. Goodnight!', scene: 'A child peacefully asleep, soft moonlight through the curtains, stars above' },
    ],
  },
  {
    id: 'new-food',
    title: 'Trying New Food',
    emoji: '🍓',
    gradient: 'from-green-400 to-lime-500',
    slides: [
      { text: 'Sometimes there is new food I have not tried before.', scene: 'A colourful plate of small bites on a cheerful table setting' },
      { text: 'It is okay to feel unsure about new food.', scene: 'A child looking at a plate with a curious, cautious expression' },
      { text: 'I can smell it first. I can look at it.', scene: 'A child leaning forward, sniffing a piece of food with a tiny smile' },
      { text: 'I can take a tiny bite - just a lick or a taste.', scene: 'A child taking a very small bite, eyes wide with curiosity' },
      { text: 'If I like it, great! If not, that is okay too.', scene: 'Two panels: one child smiling, one child politely shaking their head, both happy' },
      { text: 'Trying is the brave part. Well done for trying!', scene: 'A child giving a thumbs up, a warm glow around them and a star floating nearby' },
    ],
  },
  {
    id: 'school',
    title: 'Going to School',
    emoji: '🏫',
    gradient: 'from-sky-400 to-blue-500',
    slides: [
      { text: 'In the morning I get ready for school.', scene: 'A child eating breakfast in a bright kitchen, backpack on the chair' },
      { text: 'I put on my uniform and pack my bag.', scene: 'A child zipping up a colourful backpack next to their shoes by the door' },
      { text: 'I say goodbye at the gate or at the door.', scene: 'A child waving to a parent at the school gate, a teacher waving hello nearby' },
      { text: 'At school we learn things, play, and be with friends.', scene: 'A bright classroom with children drawing and building together' },
      { text: 'If I feel worried, I can tell my teacher.', scene: 'A child raising their hand, a kind teacher bending down to listen' },
      { text: 'At the end of the day, I go home. School is done!', scene: 'A child running out of school gates towards a waiting parent, smiling wide' },
    ],
  },
];

// ---- Sub-components ----

function IllustrationPlaceholder({ scene, gradient }: { scene: string; gradient: string }) {
  return (
    <div
      className={`w-full rounded-2xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-5 gap-3`}
      style={{ minHeight: '180px' }}
      role="img"
      aria-label={scene}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <p className="text-white/80 text-xs text-center leading-snug max-w-[200px]">{scene}</p>
    </div>
  );
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2 justify-center py-3">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 8,
            height: 8,
            backgroundColor: i === current ? 'var(--dot-active, #4CAF50)' : '#D1C7BD',
          }}
        />
      ))}
    </div>
  );
}

// ---- StoryReader: fullscreen slide-by-slide view ----

function StoryReader({ story, onClose, primaryColor }: { story: Story; onClose: () => void; primaryColor: string }) {
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = story.slides.length;

  function goNext() {
    if (slide < total - 1) { setDirection(1); setSlide(slide + 1); }
  }
  function goPrev() {
    if (slide > 0) { setDirection(-1); setSlide(slide - 1); }
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#fdfcfa] safe-top">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: '#E8E0D6' }}
      >
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90 transition-transform"
          style={{ backgroundColor: `${primaryColor}20` }}
          aria-label="Back to stories"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="text-[17px] font-semibold flex-1 truncate" style={{ color: '#2C2825' }}>
          {story.title}
        </span>
        <span className="text-[13px] font-medium" style={{ color: '#9A9088' }}>
          {slide + 1} / {total}
        </span>
      </div>

      {/* Slide area */}
      <div className="flex-1 relative overflow-hidden px-5 pt-6 pb-2">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={slide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="absolute inset-0 flex flex-col gap-5 px-5 pt-6 pb-2"
          >
            <IllustrationPlaceholder scene={story.slides[slide].scene} gradient={story.gradient} />
            <p
              className="text-center font-semibold leading-relaxed"
              style={{ fontSize: 'clamp(18px, 5vw, 24px)', color: '#2C2825' }}
            >
              {story.slides[slide].text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress + nav */}
      <div className="px-5 pb-6 flex flex-col gap-3">
        <ProgressDots total={total} current={slide} />
        <div className="flex gap-3">
          <button
            onClick={goPrev}
            disabled={slide === 0}
            className="flex-1 py-4 rounded-2xl font-bold text-[16px] transition-all active:scale-95 disabled:opacity-30"
            style={{ backgroundColor: '#F0EDE8', color: '#5A524A' }}
          >
            Back
          </button>
          {slide < total - 1 ? (
            <button
              onClick={goNext}
              className="flex-1 py-4 rounded-2xl font-bold text-[16px] transition-all active:scale-95 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-[16px] transition-all active:scale-95 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              All done!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Main Stories Page ----

export default function StoriesPage() {
  const { settings, isLoaded } = useApp();
  const primaryColor = settings.primaryColor || '#4CAF50';
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center">
        <div
          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <>
      {activeStory && (
        <StoryReader
          story={activeStory}
          onClose={() => setActiveStory(null)}
          primaryColor={primaryColor}
        />
      )}

      <div className="min-h-screen bg-[#f2f2f7] flex flex-col">
        {/* Header */}
        <header
          className="sticky top-0 z-40 backdrop-blur-xl safe-top"
          style={{ backgroundColor: `${primaryColor}F2` }}
        >
          <div className="px-4 py-3">
            <h1 className="text-[18px] font-semibold text-white">Social Stories</h1>
            <p className="text-[13px] text-white/80">Choose a story to read</p>
          </div>
        </header>

        {/* Story grid */}
        <div className="flex-1 px-4 py-4 pb-28">
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {STORIES.map((story, i) => (
              <motion.button
                key={story.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 28 }}
                onClick={() => setActiveStory(story)}
                className={`bg-gradient-to-br ${story.gradient} rounded-2xl p-4 min-h-[110px] flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform text-left`}
              >
                <span style={{ fontSize: 'clamp(28px, 8vw, 36px)' }} aria-hidden="true">
                  {story.emoji}
                </span>
                <span className="text-[14px] font-bold text-white text-center leading-tight drop-shadow-sm">
                  {story.title}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <Dock primaryColor={primaryColor} />
      </div>
    </>
  );
}
