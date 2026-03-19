'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Home, SkipForward, Play, Pause } from 'lucide-react';

// Auto-advance hook
function useAutoAdvance(delay: number, onAdvance: () => void, enabled: boolean = true) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasAdvancedRef = useRef(false);

  const skipDelay = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!hasAdvancedRef.current) {
      hasAdvancedRef.current = true;
      onAdvance();
    }
  }, [onAdvance]);

  useEffect(() => {
    if (!enabled) return;
    hasAdvancedRef.current = false;
    timeoutRef.current = setTimeout(() => {
      if (!hasAdvancedRef.current) {
        hasAdvancedRef.current = true;
        onAdvance();
      }
    }, delay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [delay, onAdvance, enabled]);

  return { skipDelay };
}

// Product journey: 35 days from concept to AI-native operating system
const SCREENS = [
  {
    id: 'hook',
    type: 'hook',
    line1: 'What if your workspace',
    line2: 'could think for itself?',
    delay: 4000,
  },
  {
    id: 'context',
    type: 'context',
    quote: '"Make the system better."',
    subtext: 'A simple request. An unusual approach. December 31, 2025.',
    delay: 4500,
  },
  {
    id: 'intro',
    type: 'intro',
    title: '8gent',
    stats: '1200+ commits · 600+ PRs · 35 days of development',
    tagline: 'Building an AI-native operating system, one conversation at a time.',
    delay: 4000,
  },
  {
    id: 'phase-0',
    type: 'phase',
    number: '00',
    title: 'First Light',
    date: 'Dec 31, 2025',
    description: 'Every system begins with a decision to build differently.',
    highlights: [
      'Project foundation and vision articulated',
      'Core dependencies and architecture planned',
      'Development environment configured',
      'First commit: the journey begins',
    ],
    commits: 8,
    delay: 5000,
  },
  {
    id: 'phase-1',
    type: 'phase',
    number: '01',
    title: 'Narrative Structure',
    date: 'Jan 6-7, 2026',
    description: 'Before features, story. The interactive timeline takes shape.',
    highlights: [
      'Story-first approach to portfolio presentation',
      'Timeline component for chronological narrative',
      'Foundation for human-centered design',
      'First pull request merged',
    ],
    commits: 3,
    delay: 4500,
  },
  {
    id: 'phase-2',
    type: 'phase',
    number: '02',
    title: 'Visual Language',
    date: 'Jan 8, 2026',
    description: 'Fifty themes. One design system. Infinite possibility.',
    highlights: [
      '50+ carefully crafted design themes',
      'Sophisticated theme inheritance system',
      'iPod-inspired music player interface',
      'Audio storage and streaming infrastructure',
      'Dark mode throughout the system',
    ],
    commits: 28,
    delay: 5500,
  },
  {
    id: 'phase-3',
    type: 'phase',
    number: '03',
    title: 'Operating System',
    date: 'Jan 9-10, 2026',
    description: 'iOS excellence meets web capability. The portfolio becomes a platform.',
    highlights: [
      'Full iOS-inspired interface with lock screen',
      'Drag-and-drop home screen with app folders',
      'Glass morphism dock with persistent music player',
      'Motion design system for fluid interactions',
      'AI mini-apps embedded throughout',
      'DALL-E integration for generative visuals',
    ],
    commits: 87,
    delay: 6000,
  },
  {
    id: 'phase-4',
    type: 'phase',
    number: '04',
    title: 'Conversational Core',
    date: 'Jan 10-11, 2026',
    description: '8gent awakens. Chat becomes the control plane.',
    highlights: [
      'Liquid glass chat overlay with personality',
      'Voice input with speech recognition',
      'Dynamic Island music integration',
      'Context-aware conversation management',
      'Rich UI generation from chat',
      'Chat as universal interface pattern',
    ],
    commits: 45,
    delay: 5500,
  },
  {
    id: 'phase-5',
    type: 'phase',
    number: '05',
    title: 'App Ecosystem',
    date: 'Jan 11-12, 2026',
    description: 'The OS needs apps. Build them all at once.',
    highlights: [
      '3D photo gallery with infinite scroll',
      'Kanban board for project management',
      'Music studio with Web Audio API',
      'People search with AI-powered insights',
      'Code editor with real-time collaboration',
      'Skills library with 67 specialized capabilities',
      'Browser automation for power users',
    ],
    commits: 124,
    delay: 6500,
  },
  {
    id: 'phase-6',
    type: 'phase',
    number: '06',
    title: 'Productivity Layer',
    date: 'Jan 12-13, 2026',
    description: 'Command palette. Notes. Weather. All the tools that make a system feel complete.',
    highlights: [
      'Command palette for keyboard-first navigation',
      'Markdown notes with folder organization',
      'Location-aware weather with personality',
      'Contact management with vCard support',
      'Full keyboard accessibility throughout',
      'Thread-based engineering methodology',
      'Public roadmap for transparent development',
    ],
    commits: 98,
    delay: 6500,
  },
  {
    id: 'phase-7',
    type: 'phase',
    number: '07',
    title: 'Time & Creation',
    date: 'Jan 13-14, 2026',
    description: 'Scheduling meets creativity. The system learns to manage time and generate media.',
    highlights: [
      'Calendar booking with intelligent scheduling',
      'Google Calendar integration for availability',
      'Email notifications for all booking events',
      'Mockup generator for rapid prototyping',
      'Collaborative lyrics studio for musicians',
      'Video reel player for content showcase',
      'Proactive AI notifications based on context',
    ],
    commits: 76,
    delay: 6000,
  },
  {
    id: 'phase-8',
    type: 'phase',
    number: '08',
    title: 'Intelligence Layer',
    date: 'Jan 14-15, 2026',
    description: 'Skills accumulate. Performance monitors. The system becomes self-aware.',
    highlights: [
      'Comprehensive AI skills library',
      'Private music sharing with collaborators',
      'Real-time performance monitoring',
      'Database migration for scalability',
      'Code quality audits and improvements',
      'Multi-agent chat orchestration',
      'Design system refinements',
    ],
    commits: 89,
    delay: 6000,
  },
  {
    id: 'phase-9',
    type: 'phase',
    number: '09',
    title: 'Product Thinking',
    date: 'Jan 15-17, 2026',
    description: 'The system learns to think like a product team. BMAD arrives.',
    highlights: [
      'Complete product lifecycle management',
      'Rich UI generation with 40+ components',
      'Watch app with generative watch faces',
      'Wiki system for knowledge management',
      'Vinyl carousel for music visualization',
      'BMAD Framework integration',
      'Comprehensive test infrastructure',
    ],
    commits: 112,
    delay: 6500,
  },
  {
    id: 'phase-10',
    type: 'phase',
    number: '10',
    title: 'Memory & Security',
    date: 'Jan 18-22, 2026',
    description: 'The AI learns to remember. The system learns to protect.',
    highlights: [
      'iMessage-style voice messaging',
      'Recursive Memory Layer for context retention',
      'Enterprise-grade security monitoring',
      'Adaptive UI based on time and location',
      'Automated AI summaries and insights',
      'Comprehensive documentation standards',
      'Data visualization throughout themes',
    ],
    commits: 87,
    delay: 6000,
  },
  {
    id: 'phase-11',
    type: 'phase',
    number: '11',
    title: 'First Impressions',
    date: 'Jan 23-24, 2026',
    description: 'iPhone-inspired onboarding. 3D avatars. The canvas becomes infinite.',
    highlights: [
      'Delightful onboarding experience',
      'Interactive 3D avatar with theme awareness',
      'Infinite design canvas for creative work',
      'Mobile-first responsive canvas',
      'Brand theme system (Nike, Adidas)',
      'High-fidelity 3D model rendering',
      'Contextual navigation patterns',
    ],
    commits: 124,
    delay: 6000,
  },
  {
    id: 'phase-12',
    type: 'phase',
    number: '12',
    title: 'Data Architecture',
    date: 'Jan 25, 2026',
    description: 'Everything is an entity. Everything is a relationship. The graph emerges.',
    highlights: [
      'Entity-Relationship-Visualization system',
      'Research tools for web content collection',
      'Full-duplex voice interaction',
      'Context reference system for memory',
      'Enhanced authentication patterns',
      'AI-generated blog posts and reflections',
    ],
    commits: 89,
    delay: 6000,
  },
  {
    id: 'phase-13',
    type: 'phase',
    number: '13',
    title: 'Dimensional Thinking',
    date: 'Jan 26, 2026',
    description: 'The same data, infinite views. Dimension rendering goes live.',
    highlights: [
      'Seven distinct data arrangement patterns',
      'Cinematic transitions between dimensions',
      'Mobile-optimized swipe navigation',
      'Bidirectional navigation through data space',
      'AI context awareness of current dimension',
      'Dynamic routing for dimensional exploration',
    ],
    commits: 12,
    delay: 5000,
  },
  {
    id: 'phase-14',
    type: 'phase',
    number: '14',
    title: 'The Coding Agent',
    date: 'Jan 27, 2026',
    description: '8gent gets hands. The sandbox opens. Three agents collaborate flawlessly.',
    highlights: [
      'Open8gent with sandbox execution',
      'Working memory and task management',
      'Multi-agent parallel development',
      'Natural language booking flow',
      'Sophisticated role-based permissions',
      'Real-time agent collaboration',
    ],
    commits: 20,
    delay: 5000,
  },
  {
    id: 'phase-15',
    type: 'phase',
    number: '15',
    title: 'Access Control',
    date: 'Jan 27, 2026',
    description: 'Who gets to see what. Graceful denials. Security with personality.',
    highlights: [
      'Three-tier access model deployed',
      'Intelligent feature gating',
      'User management infrastructure',
      'AI-powered access denial messaging',
      'Memory-aware conversation compression',
      'Cross-platform messaging integration',
    ],
    commits: 18,
    delay: 5500,
  },
  {
    id: 'phase-16',
    type: 'phase',
    number: '16',
    title: 'Omnichannel',
    date: 'Jan 28, 2026',
    description: 'WhatsApp. Telegram. iMessage. Discord. One unified conversation layer.',
    highlights: [
      'Universal messaging integration',
      'Unified inbox with iOS styling',
      'Intelligent webhook routing',
      'Automatic conversation summarization',
      'Memory extraction from all channels',
      'Consistent AI experience everywhere',
    ],
    commits: 25,
    delay: 5000,
  },
  {
    id: 'phase-17',
    type: 'phase',
    number: '17',
    title: 'Refinement',
    date: 'Jan 28, 2026',
    description: 'The details that make it feel finished. Animations, transitions, polish.',
    highlights: [
      'Expandable music player with fluid motion',
      'Presentation mode coordination',
      'Build pipeline optimization',
      'Animation timing refinements',
      'Cross-component state management',
      'Context-aware interface hiding',
    ],
    commits: 12,
    delay: 5000,
  },
  {
    id: 'phase-18',
    type: 'phase',
    number: '18',
    title: 'Guardian',
    date: 'Jan 30, 2026',
    description: 'Some features need protection. 8gent learns to say no gracefully.',
    highlights: [
      'Owner-only feature protection',
      'Voice-enabled access denial messages',
      'Elegant typewriter effect for messaging',
      'GitHub OAuth integration',
      'Social platform connection framework',
      'Settings infrastructure for integrations',
    ],
    commits: 8,
    delay: 5000,
  },
  {
    id: 'phase-19',
    type: 'phase',
    number: '19',
    title: 'Code Hands',
    date: 'Jan 31, 2026',
    description: 'The moment 8gent could write, run, and deploy code.',
    highlights: [
      'Full sandbox integration operational',
      'Authenticated repository cloning',
      'Secure OAuth token handling',
      'Private repository access',
      'Distraction-free coding interface',
      'Self-documenting development process',
    ],
    commits: 6,
    delay: 5000,
  },
  {
    id: 'phase-20',
    type: 'phase',
    number: '20',
    title: 'Hardening',
    date: 'Jan 31, 2026',
    description: 'Building in public requires building secure. Defense in depth.',
    highlights: [
      'Multi-layer API access control',
      'Dynamic session-based authentication',
      'Path traversal protection',
      'Phishing pattern detection',
      'Command injection prevention',
      'Security audit completion',
    ],
    commits: 3,
    delay: 5000,
  },
  {
    id: 'phase-21',
    type: 'phase',
    number: '21',
    title: 'Reflection',
    date: 'Jan 31, 2026',
    description: 'The system begins to think about itself. Introspection becomes infrastructure.',
    highlights: [
      'Daily AI self-reflection system',
      'Values and memory tracking',
      'Canvas grid and mindmap capabilities',
      'Collaborative writing with full history',
      'Task management AI integration',
      'Authenticated memory management',
      'Bidirectional webhook system',
    ],
    commits: 15,
    delay: 5000,
  },
  {
    id: 'phase-22',
    type: 'phase',
    number: '22',
    title: 'Local Intelligence',
    date: 'Feb 1, 2026',
    description: 'Break free from cloud APIs. Run AI locally. Access globally.',
    highlights: [
      'Universal LLM proxy architecture',
      'Secure tunnel to local models',
      'Local Mac GPU inference',
      'Intelligent provider routing',
      'Automatic cloud fallback',
      'Chain-of-thought reasoning',
      'Zero marginal cost at scale',
    ],
    commits: 8,
    delay: 5000,
  },
  {
    id: 'phase-23',
    type: 'phase',
    number: '23',
    title: 'Ambient Voice',
    date: 'Feb 3, 2026',
    description: 'Claude-inspired voice mode. Data import. Autonomous execution patterns.',
    highlights: [
      'Ambient voice interface with visual feedback',
      'Full-screen immersive voice experience',
      'AI-assisted data classification',
      'Universal data import pipeline',
      'Autonomous task spawning',
      'Code iteration capabilities',
      'Background job infrastructure',
      'Security vulnerability remediation',
    ],
    commits: 8,
    delay: 6000,
  },
  {
    id: 'phase-24',
    type: 'phase',
    number: '24',
    title: '8gent Code v0.7.0 — Personalization',
    date: 'Mar 18, 2026',
    description: 'Authenticate once, never configure again. The agent learns who you are.',
    highlights: [
      'Smart onboarding: auto-detects git, Ollama, GitHub in 3 questions',
      'Preferences cloud sync across devices via Convex',
      'Adaptive system prompt with user context injection',
      'Session history & resume: /continue, /history, /resume, /compact',
      'Personal LoRA training pipeline from session traces',
      'ESC-to-interrupt: abort generation instantly',
      'User-scoped memory with 1.5x relevance boost',
      'HistoryScreen TUI for browsing past sessions',
    ],
    commits: 22,
    delay: 6000,
  },
  {
    id: 'stats',
    type: 'stats',
    title: 'Impact',
    stats: [
      { label: 'Commits', value: '1250+' },
      { label: 'Pull Requests', value: '600+' },
      { label: 'Design Themes', value: '50+' },
      { label: 'AI Capabilities', value: '130+' },
      { label: 'Applications', value: '38+' },
      { label: 'Development Days', value: '35' },
    ],
    delay: 5500,
  },
  {
    id: 'reflection',
    type: 'reflection',
    lines: [
      'Started with a specific use-case.',
      'Built an operating system.',
      '',
      'Started with static pages.',
      'Built conversational intelligence.',
      '',
      'Started with a vision.',
      'Built a platform.',
    ],
    delay: 6000,
  },
  {
    id: 'outro',
    type: 'outro',
    title: 'AI-Native Development',
    subtitle: 'Built with AI, for humans',
    description: 'This system was developed through collaboration between human vision and AI execution. A glimpse of how software will be built.',
    stack: [
      { name: 'Cursor', role: 'AI pair programming' },
      { name: 'Claude Code', role: 'Autonomous development' },
      { name: 'Claude Mobile', role: 'Mobile development' },
      { name: 'ChatGPT Agents', role: 'Multi-agent orchestration' },
      { name: 'Convex', role: 'Real-time backend' },
      { name: 'Clerk', role: 'Authentication' },
      { name: 'Vercel', role: 'Edge deployment' },
      { name: 'Next.js', role: 'React framework' },
      { name: 'Framer Motion', role: 'Motion design' },
      { name: 'TailwindCSS', role: 'Design system' },
    ],
    delay: 8000,
  },
];

// Screen components
function HookScreen({ screen, onAdvance, autoPlay }: { screen: typeof SCREENS[0]; onAdvance: () => void; autoPlay: boolean }) {
  const { skipDelay } = useAutoAdvance(screen.delay || 4000, onAdvance, autoPlay);
  if (screen.type !== 'hook') return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center cursor-pointer px-8"
      onClick={skipDelay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.p
        className="text-2xl sm:text-4xl md:text-5xl text-white/80 font-light italic text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {screen.line1}
      </motion.p>
      <motion.p
        className="text-2xl sm:text-4xl md:text-5xl text-amber-400 font-light italic text-center mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        {screen.line2}
      </motion.p>
    </motion.div>
  );
}

function ContextScreen({ screen, onAdvance, autoPlay }: { screen: typeof SCREENS[0]; onAdvance: () => void; autoPlay: boolean }) {
  const { skipDelay } = useAutoAdvance(screen.delay || 4500, onAdvance, autoPlay);
  if (screen.type !== 'context') return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center cursor-pointer px-8"
      onClick={skipDelay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.p
        className="text-xl sm:text-2xl md:text-3xl text-white/60 font-light text-center max-w-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {screen.quote}
      </motion.p>
      <motion.p
        className="text-sm text-white/30 mt-8 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      >
        {screen.subtext}
      </motion.p>
    </motion.div>
  );
}

function IntroScreen({ screen, onAdvance, autoPlay }: { screen: typeof SCREENS[0]; onAdvance: () => void; autoPlay: boolean }) {
  const { skipDelay } = useAutoAdvance(screen.delay || 4000, onAdvance, autoPlay);
  if (screen.type !== 'intro') return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center cursor-pointer"
      onClick={skipDelay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-5xl sm:text-7xl md:text-8xl font-light text-white tracking-tight"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        {screen.title}
      </motion.h1>
      <motion.p
        className="mt-6 text-sm text-white/40 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        {typeof screen.stats === 'string' ? screen.stats : ''}
      </motion.p>
      <motion.p
        className="mt-8 text-lg sm:text-xl text-white/60 font-light text-center max-w-lg px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      >
        {screen.tagline}
      </motion.p>
    </motion.div>
  );
}

function PhaseScreen({ screen, onAdvance, autoPlay }: { screen: typeof SCREENS[0]; onAdvance: () => void; autoPlay: boolean }) {
  const { skipDelay } = useAutoAdvance(screen.delay || 5000, onAdvance, autoPlay);
  if (screen.type !== 'phase') return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center px-6 sm:px-8 cursor-pointer overflow-hidden"
      onClick={skipDelay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute top-6 sm:top-8 left-6 sm:left-8 text-white/20 font-mono text-xs sm:text-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        PHASE {screen.number}
      </motion.div>

      <motion.div
        className="absolute top-6 sm:top-8 right-6 sm:right-8 text-white/40 font-mono text-xs sm:text-sm"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        {screen.date}
      </motion.div>

      <motion.h2
        className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {screen.title}
      </motion.h2>

      <motion.p
        className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-white/60 font-light text-center max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        {screen.description}
      </motion.p>

      {screen.highlights && (
        <motion.div
          className="mt-8 sm:mt-10 max-w-xl w-full px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <ul className="space-y-1.5 sm:space-y-2">
            {screen.highlights.map((highlight: string, i: number) => (
              <motion.li
                key={i}
                className="text-white/50 text-xs sm:text-sm md:text-base font-light flex items-start gap-2 sm:gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.08 }}
              >
                <span className="text-amber-500/70 mt-0.5">›</span>
                {highlight}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {screen.commits && (
        <motion.div
          className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 text-white/30 font-mono text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {screen.commits} commits
        </motion.div>
      )}
    </motion.div>
  );
}

function StatsScreen({ screen, onAdvance, autoPlay }: { screen: typeof SCREENS[0]; onAdvance: () => void; autoPlay: boolean }) {
  const { skipDelay } = useAutoAdvance(screen.delay || 5000, onAdvance, autoPlay);
  if (screen.type !== 'stats') return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center px-8 cursor-pointer"
      onClick={skipDelay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-2xl sm:text-4xl md:text-5xl font-light text-white tracking-tight mb-10 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {screen.title}
      </motion.h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
        {Array.isArray(screen.stats) && screen.stats.map((stat: { label: string; value: string }, i: number) => (
          <motion.div
            key={i}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.12 }}
          >
            <div className="text-3xl sm:text-5xl md:text-6xl font-light text-amber-500">{stat.value}</div>
            <div className="text-white/40 text-xs sm:text-sm mt-2">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ReflectionScreen({ screen, onAdvance, autoPlay }: { screen: typeof SCREENS[0]; onAdvance: () => void; autoPlay: boolean }) {
  const { skipDelay } = useAutoAdvance(screen.delay || 6000, onAdvance, autoPlay);
  if (screen.type !== 'reflection') return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center px-8 cursor-pointer"
      onClick={skipDelay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center space-y-1">
        {screen.lines?.map((line: string, i: number) => (
          <motion.p
            key={i}
            className={`text-lg sm:text-xl md:text-2xl font-light ${line === '' ? 'h-4' : i % 2 === 1 ? 'text-amber-400' : 'text-white/70'
              }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.25 }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}

function OutroScreen({ screen, onAdvance, autoPlay }: { screen: typeof SCREENS[0]; onAdvance: () => void; autoPlay: boolean }) {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  useAutoAdvance(screen.delay || 8000, onAdvance, autoPlay);
  if (screen.type !== 'outro') return null;

  const handleEnter = () => {
    setIsExiting(true);
    // Signal to dock to animate in after navigation (same as onboarding)
    sessionStorage.setItem('openclaw_onboarding_just_completed', 'true');
    // Wait for exit animation then navigate
    setTimeout(() => {
      router.push('/');
    }, 600);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center px-6 sm:px-8 overflow-y-auto py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-3xl sm:text-5xl md:text-6xl font-light text-white tracking-tight text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -20 : 0 }}
        transition={{ delay: isExiting ? 0 : 0.2, duration: 0.5 }}
      >
        {screen.title}
      </motion.h2>
      <motion.p
        className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-white/60 font-light text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ delay: isExiting ? 0.05 : 0.6, duration: 0.5 }}
      >
        {screen.subtitle}
      </motion.p>
      <motion.p
        className="mt-4 sm:mt-6 text-sm sm:text-base text-white/40 text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ delay: isExiting ? 0.1 : 1.0, duration: 0.5 }}
      >
        {screen.description}
      </motion.p>

      {/* Tech Stack */}
      {screen.stack && (
        <motion.div
          className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 max-w-4xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          transition={{ delay: isExiting ? 0.15 : 1.4, duration: 0.4 }}
        >
          {(screen.stack as Array<{ name: string; role: string }>).map((tool, i) => (
            <motion.div
              key={tool.name}
              className="text-center px-3 py-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? 10 : 0 }}
              transition={{ delay: isExiting ? 0.02 * i : 1.5 + i * 0.08, duration: 0.3 }}
            >
              <div className="text-white/80 text-xs sm:text-sm font-medium">{tool.name}</div>
              <div className="text-white/30 text-[10px] sm:text-xs mt-0.5">{tool.role}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.button
        onClick={handleEnter}
        disabled={isExiting}
        className="mt-8 sm:mt-10 px-5 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base rounded-full flex items-center gap-2 transition-colors disabled:opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1, scale: isExiting ? 0.9 : 1 }}
        transition={{ delay: isExiting ? 0 : 2.5, duration: 0.4 }}
      >
        <Home className="w-4 h-4" />
        Enter 8gent
      </motion.button>
    </motion.div>
  );
}

export default function UpdatesPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const advance = useCallback(() => {
    if (currentIndex < SCREENS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        advance();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
      } else if (e.key === 'Escape') {
        router.push('/');
      } else if (e.key === 'p') {
        setAutoPlay(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [advance, goBack, router]);

  const currentScreen = SCREENS[currentIndex];

  return (
    <div className="fixed inset-0 bg-black">
      <AnimatePresence mode="wait">
        {currentScreen.type === 'hook' && (
          <HookScreen key={currentScreen.id} screen={currentScreen} onAdvance={advance} autoPlay={autoPlay} />
        )}
        {currentScreen.type === 'context' && (
          <ContextScreen key={currentScreen.id} screen={currentScreen} onAdvance={advance} autoPlay={autoPlay} />
        )}
        {currentScreen.type === 'intro' && (
          <IntroScreen key={currentScreen.id} screen={currentScreen} onAdvance={advance} autoPlay={autoPlay} />
        )}
        {currentScreen.type === 'phase' && (
          <PhaseScreen key={currentScreen.id} screen={currentScreen} onAdvance={advance} autoPlay={autoPlay} />
        )}
        {currentScreen.type === 'stats' && (
          <StatsScreen key={currentScreen.id} screen={currentScreen} onAdvance={advance} autoPlay={autoPlay} />
        )}
        {currentScreen.type === 'reflection' && (
          <ReflectionScreen key={currentScreen.id} screen={currentScreen} onAdvance={advance} autoPlay={autoPlay} />
        )}
        {currentScreen.type === 'outro' && (
          <OutroScreen key={currentScreen.id} screen={currentScreen} onAdvance={advance} autoPlay={autoPlay} />
        )}
      </AnimatePresence>

      {/* Navigation controls */}
      <div className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 flex items-center gap-2 sm:gap-4 z-50">
        {/* Progress indicator */}
        <div className="hidden sm:flex items-center gap-1">
          {SCREENS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-white w-4' : 'bg-white/30 hover:bg-white/50'
                }`}
            />
          ))}
        </div>

        {/* Mobile progress */}
        <div className="sm:hidden text-white/40 text-xs font-mono">
          {currentIndex + 1}/{SCREENS.length}
        </div>

        {/* Play/Pause */}
        <button
          onClick={() => setAutoPlay(prev => !prev)}
          className="p-2 text-white/50 hover:text-white transition-colors"
          title={autoPlay ? 'Pause (P)' : 'Play (P)'}
        >
          {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Nav buttons */}
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className="p-2 text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={advance}
          disabled={currentIndex === SCREENS.length - 1}
          className="p-2 text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => router.push('/')}
          className="p-2 text-white/50 hover:text-white transition-colors"
          title="Exit (Esc)"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Skip all */}
      <button
        onClick={() => setCurrentIndex(SCREENS.length - 1)}
        className="fixed top-4 sm:top-8 right-4 sm:right-8 text-white/30 hover:text-white/60 text-xs sm:text-sm flex items-center gap-1 transition-colors z-50"
      >
        Skip
        <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
}
