'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Heart, Sparkles, Youtube, Instagram, Linkedin } from 'lucide-react';

// Custom X (formerly Twitter) icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ============================================================================
// Types
// ============================================================================

interface Inspiration {
  id: string;
  name: string;
  handle: string;
  xUsername: string; // X username for avatar fetching
  contribution: string;
  description: string;
  links: {
    twitter?: string;
    github?: string;
    website?: string;
    youtube?: string;
    instagram?: string;
    linkedin?: string;
  };
  gradient: string;
  accentColor: string;
}

// ============================================================================
// Data
// ============================================================================

const inspirations: Inspiration[] = [
  {
    id: 'james-spalding',
    name: '8gent',
    handle: '@james__spalding',
    xUsername: 'james__spalding',
    contribution: 'System Architect',
    description: 'The primary architect of 8gent. Transformed the vision of an AI-native operating system into a working reality through agentic orchestration and design-led engineering.',
    links: {
      github: 'https://github.com/openclaw',
      website: 'https://8gent.app',
    },
    gradient: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
    accentColor: 'text-violet-400',
  },
  {
    id: 'openclaw-team',
    name: 'The OpenClaw Team',
    handle: '@OpenClaw',
    xUsername: 'OpenClaw',
    contribution: 'The Agentic Backend Foundation',
    description: 'The brilliant team behind OpenClaw, the agentic backend that powers this entire operating system. Their WebSocket-based gateway, device management, and agent orchestration architecture made this AI-native OS possible.',
    links: {
      github: 'https://github.com/openclaw',
      website: 'https://openclaw.dev',
    },
    gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
    accentColor: 'text-emerald-400',
  },
  {
    id: 'ryo-lu',
    name: 'Ryo Lu',
    handle: '@ryolu_',
    xUsername: 'ryolu_',
    contribution: 'The Original OS Inspiration',
    description: 'Head of Design at Cursor. His ryOS retro portfolio was the spark that lit the fire. Proof that a designer could build an entire operating system with AI and pure vibe.',
    links: {
      twitter: 'https://x.com/ryolu_',
      website: 'https://ryo.lu',
      github: 'https://github.com/ryolu-',
    },
    gradient: 'from-fuchsia-500/20 via-pink-500/10 to-transparent',
    accentColor: 'text-fuchsia-400',
  },
  {
    id: 'chris-tate',
    name: 'Chris Tate',
    handle: '@ctatedev',
    xUsername: 'ctatedev',
    contribution: 'Browser Automation',
    description: 'Inspired the agent-browser CLI tool that powers 8gent browser automation capabilities. Clean, elegant approach to headless browser control.',
    links: {
      twitter: 'https://x.com/ctatedev',
      github: 'https://github.com/ctate',
      website: 'https://ctate.dev/',
    },
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    accentColor: 'text-cyan-400',
  },
  {
    id: 'shiri',
    name: 'Shiri',
    handle: '@shiri_shh',
    xUsername: 'shiri_shh',
    contribution: 'Control Panel Design',
    description: 'The stunning control deck with tactile buttons, rotary knobs, and LED displays was inspired by their exceptional hardware UI concepts.',
    links: {
      twitter: 'https://x.com/shiri_shh',
    },
    gradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
    accentColor: 'text-orange-400',
  },
  {
    id: 'joel',
    name: 'Joel',
    handle: '@joelbqz',
    xUsername: 'joelbqz',
    contribution: '3D Photo Gallery & Music Studio',
    description: 'The infinite 3D photo gallery with depth-based navigation and the Jamz music studio landing page draw inspiration from their creative approach to immersive web experiences.',
    links: {
      twitter: 'https://x.com/joelbqz',
    },
    gradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
    accentColor: 'text-purple-400',
  },
  {
    id: 'antonio',
    name: 'Code With Antonio',
    handle: '@codewithantonio',
    xUsername: 'codewithantonio',
    contribution: 'Cursor-like AI Elements',
    description: 'The Polaris project provided excellent patterns for AI UI elements like tool execution, reasoning displays, and the shimmer effects.',
    links: {
      twitter: 'https://x.com/codewithantonio',
      github: 'https://github.com/code-with-antonio',
      website: 'https://codewithantonio.com',
    },
    gradient: 'from-green-500/20 via-emerald-500/10 to-transparent',
    accentColor: 'text-emerald-400',
  },
  {
    id: 'kyle',
    name: 'Kyle',
    handle: '@kyleanthony',
    xUsername: 'kyleanthony',
    contribution: 'Utilitarian Design Theme',
    description: 'The clean, utilitarian design philosophy that shapes the core aesthetic of 8gent. Claude Code powered design excellence.',
    links: {
      twitter: 'https://x.com/kyleanthony',
      website: 'https://brasshands.com/contact',
    },
    gradient: 'from-slate-500/20 via-zinc-500/10 to-transparent',
    accentColor: 'text-zinc-400',
  },
  {
    id: 'bugged-dev',
    name: 'The Bugged Dev',
    handle: '@thebuggeddev',
    xUsername: 'thebuggeddev',
    contribution: '3D Lock Screen Effect',
    description: 'The stunning 3D visual effect on the 8gent lock screen was inspired by their creative approach to immersive web experiences.',
    links: {
      twitter: 'https://x.com/thebuggeddev',
      github: 'https://github.com/thebuggeddev',
    },
    gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    accentColor: 'text-pink-400',
  },
  {
    id: 'jason',
    name: 'Jason Zhou',
    handle: '@jasonzhou1993',
    xUsername: 'jasonzhou1993',
    contribution: 'Super Design & Community',
    description: 'Creator of Super Design with an amazing community and YouTube channel. A constant source of inspiration and creative energy.',
    links: {
      twitter: 'https://x.com/jasonzhou1993',
      youtube: 'https://youtube.com/@aijasonz',
    },
    gradient: 'from-red-500/20 via-orange-500/10 to-transparent',
    accentColor: 'text-red-400',
  },
  {
    id: 'kevin-mccove',
    name: 'Kevin McCove',
    handle: '@KevinMcCove',
    xUsername: 'KevinMcCove',
    contribution: 'Music Studio & CoWrite App',
    description: 'The Jamz music studio and the new CoWrite lyrics app were heavily inspired by conversations with Kevin. A true creative catalyst.',
    links: {
      twitter: 'https://x.com/KevinMcCove',
      website: 'https://kevinmccove.com',
      youtube: 'https://www.youtube.com/@KevinMcCove',
      instagram: 'https://www.instagram.com/kevinmccove/',
    },
    gradient: 'from-indigo-500/20 via-blue-500/10 to-transparent',
    accentColor: 'text-indigo-400',
  },
  {
    id: 'wael-esmair',
    name: 'Wael Esmair',
    handle: '@webisticsdawg',
    xUsername: 'webisticsdawg',
    contribution: 'Mockit & Marketing Mastery',
    description: 'The GOAT of web design, SEO, and marketing. Inspired Mockit and transformed my entire understanding of marketing. A genius who sees things from perspectives others miss.',
    links: {
      twitter: 'https://x.com/webisticsdawg',
      linkedin: 'https://www.linkedin.com/in/waelesmair/',
      website: 'https://www.nimbusmedia.io',
    },
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    accentColor: 'text-amber-400',
  },
  {
    id: 'bmad-method',
    name: 'BMAD Method',
    handle: '@bmad-code-org',
    xUsername: 'bmadcodeorg',
    contribution: 'PRD & Agentic Workflow',
    description: 'The BMAD Method provides the structured approach to PRDs, epics, and stories that powers the agentic product lifecycle. A comprehensive framework for AI-assisted development.',
    links: {
      github: 'https://github.com/bmad-code-org/BMAD-METHOD',
      website: 'https://bmad.dev',
    },
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    accentColor: 'text-emerald-400',
  },
  {
    id: 'ccpm',
    name: 'CCPM',
    handle: '@PodJamz',
    xUsername: 'podjamz',
    contribution: 'Git Workflow & Parallel Execution',
    description: 'Claude Code Project Manager provides the git-centric workflow with issues, branches, and worktrees for parallel execution. The backbone of the agentic kanban system.',
    links: {
      twitter: 'https://x.com/podjamz',
      github: 'https://github.com/8gi-foundation/ccpm',
    },
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    accentColor: 'text-violet-400',
  },
  {
    id: 'geoffrey-huntley',
    name: 'Geoffrey Huntley',
    handle: '@GeoffreyHuntley',
    xUsername: 'GeoffreyHuntley',
    contribution: 'Ralph Loop Concept',
    description: 'The Ralph Loop (the iterative AI development cycle of write, review, refine) was directly inspired by Geoffrey\'s pioneering work on agentic development patterns.',
    links: {
      twitter: 'https://x.com/GeoffreyHuntley',
      website: 'https://ghuntley.com',
      github: 'https://github.com/ghuntley',
    },
    gradient: 'from-cyan-500/20 via-teal-500/10 to-transparent',
    accentColor: 'text-cyan-400',
  },
  {
    id: 'federico-villa',
    name: 'Federico Villa',
    handle: '@federicovilla',
    xUsername: 'villafederico',
    contribution: 'Field Guide Theme',
    description: 'The Field Guide theme with its editorial design journal aesthetic was inspired by Federico\'s exceptional AI Design Field Guide publication.',
    links: {
      twitter: 'https://x.com/villafederico',
      website: 'https://federico.vision',
    },
    gradient: 'from-stone-500/20 via-neutral-500/10 to-transparent',
    accentColor: 'text-stone-400',
  },
  {
    id: 'rauno-freiberg',
    name: 'Rauno Freiberg',
    handle: '@raunofreiberg',
    xUsername: 'raunofreiberg',
    contribution: 'Web Interface Guidelines',
    description: 'The Web Interface Guidelines provided essential patterns for building exceptional web interfaces. A masterclass in thoughtful UI design.',
    links: {
      twitter: 'https://x.com/raunofreiberg',
      website: 'https://rauno.me',
      github: 'https://github.com/raunofreiberg',
    },
    gradient: 'from-neutral-500/20 via-zinc-500/10 to-transparent',
    accentColor: 'text-neutral-400',
  },
  {
    id: 'obra-skills',
    name: 'Obra',
    handle: '@obra',
    xUsername: 'obra',
    contribution: 'Claude Code Skills',
    description: 'The foundational claude-code-skills repository that inspired the entire skills library architecture. Essential patterns for extending Claude Code.',
    links: {
      twitter: 'https://x.com/obra',
      github: 'https://github.com/obra/claude-code-skills',
    },
    gradient: 'from-sky-500/20 via-blue-500/10 to-transparent',
    accentColor: 'text-sky-400',
  },
  {
    id: 'bas-milius',
    name: 'Bas Milius',
    handle: '@basmilius',
    xUsername: 'basmilius',
    contribution: 'Meteocons Weather Icons',
    description: 'The beautiful animated weather icons (Meteocons) that bring the Weather app to life. Handcrafted SVG animations with stunning attention to detail.',
    links: {
      twitter: 'https://x.com/basmilius',
      github: 'https://github.com/basmilius/weather-icons',
      website: 'https://meteocons.com',
    },
    gradient: 'from-blue-500/20 via-sky-500/10 to-transparent',
    accentColor: 'text-blue-400',
  },
  {
    id: 'wes-bos',
    name: 'Wes Bos',
    handle: '@wesbos',
    xUsername: 'wesbos',
    contribution: '3D Avatar Generator',
    description: 'The interactive 3D avatar generator with cursor-tracking rotation was inspired by the avatar-3d project. AI-powered photo-to-avatar transformation with stunning visual effects.',
    links: {
      twitter: 'https://x.com/wesbos',
      github: 'https://github.com/0xGF/avatar-3d',
      website: 'https://wesbos.com',
    },
    gradient: 'from-cyan-500/20 via-teal-500/10 to-transparent',
    accentColor: 'text-cyan-400',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    handle: '@vercel',
    xUsername: 'vercel',
    contribution: 'The Foundation of Everything',
    description: 'Next.js powers the entire stack. AI SDK enables streaming chat. AI Elements provide the beautiful task execution UI. Vercel Sandbox runs the OpenClaw coding environment. Deployed on Vercel. The list goes on.',
    links: {
      twitter: 'https://x.com/vercel',
      github: 'https://github.com/vercel',
      website: 'https://vercel.com',
    },
    gradient: 'from-white/20 via-neutral-500/10 to-transparent',
    accentColor: 'text-white',
  },
  {
    id: 'indydevdan',
    name: 'IndyDevDan',
    handle: '@IndyDevDan',
    xUsername: 'IndyDevDan',
    contribution: 'Claude Code Hooks Mastery',
    description: 'The definitive guide to Claude Code hooks, subagents, and team-based validation. His work on deterministic agent control and the meta-agent pattern transformed how we orchestrate AI workflows.',
    links: {
      twitter: 'https://x.com/IndyDevDan',
      github: 'https://github.com/disler/claude-code-hooks-mastery',
      youtube: 'https://youtube.com/@indydevdan',
    },
    gradient: 'from-yellow-500/20 via-amber-500/10 to-transparent',
    accentColor: 'text-yellow-400',
  },
  {
    id: 'node-banana',
    name: 'Node Banana',
    handle: '@nodebanana',
    xUsername: 'nodebanana',
    contribution: 'Multi-Provider AI Generation',
    description: 'The multi-provider AI generation architecture (Gemini, Replicate, fal.ai) that powers the enhanced canvas AI Generator was directly inspired by Node Banana\'s elegant abstraction layer. Their node-based workflow system and provider integration patterns transformed how we approach multi-model AI generation.',
    links: {
      github: 'https://github.com/node-banana/node-banana',
      website: 'https://node-banana-docs.vercel.app',
    },
    gradient: 'from-orange-500/20 via-yellow-500/10 to-transparent',
    accentColor: 'text-orange-400',
  },
];

// ============================================================================
// Business Card Component
// ============================================================================

function InspirationCard({ inspiration, index }: { inspiration: Inspiration; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Get avatar URL from unavatar.io (fetches X profile pictures)
  const avatarUrl = `https://unavatar.io/x/${inspiration.xUsername}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Business Card */}
      <div
        className={`
          relative overflow-hidden rounded-xl
          bg-gradient-to-br from-neutral-900 to-neutral-950
          border border-white/10
          transition-all duration-500 ease-out
          aspect-[1.75/1]
          ${isHovered ? 'border-white/25 shadow-2xl shadow-white/10 scale-[1.02]' : ''}
        `}
      >
        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradient accent on left edge */}
        <div
          className={`
            absolute left-0 top-0 bottom-0 w-1
            bg-gradient-to-b ${inspiration.gradient.replace('to-transparent', 'to-transparent')}
            opacity-60 group-hover:opacity-100 transition-opacity duration-500
          `}
        />

        {/* Content */}
        <div className="relative h-full p-5 sm:p-6 flex flex-col justify-between">
          {/* Top section */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className={`
                  w-16 h-16 sm:w-20 sm:h-20 rounded-full
                  bg-gradient-to-br from-white/10 to-white/5
                  border-2 border-white/20
                  overflow-hidden
                  group-hover:border-white/40 transition-all duration-300
                  ${isHovered ? 'shadow-lg shadow-white/10' : ''}
                `}
              >
                {!imgError ? (
                  <Image
                    src={avatarUrl}
                    alt={`${inspiration.name}'s avatar`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white/60">
                    {inspiration.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              {/* X badge */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black border border-white/20 flex items-center justify-center">
                <XIcon className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Name and handle */}
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="text-lg sm:text-xl font-semibold text-white truncate">
                {inspiration.name}
              </h3>
              <p className="text-sm text-white/40 font-mono truncate">
                {inspiration.handle}
              </p>
              {/* Contribution badge */}
              <div className="mt-2">
                <span
                  className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                    bg-white/5 border border-white/10
                    text-xs font-medium ${inspiration.accentColor}
                  `}
                >
                  <Sparkles className="w-3 h-3" />
                  {inspiration.contribution}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="flex items-end justify-between gap-4">
            {/* Description */}
            <p className="text-xs sm:text-sm text-white/40 leading-relaxed line-clamp-2 flex-1">
              {inspiration.description}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {inspiration.links.twitter && (
                <a
                  href={inspiration.links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-all duration-200"
                  aria-label={`${inspiration.name}'s X`}
                >
                  <XIcon className="w-4 h-4" />
                </a>
              )}
              {inspiration.links.github && (
                <a
                  href={inspiration.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-all duration-200"
                  aria-label={`${inspiration.name}'s GitHub`}
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {inspiration.links.youtube && (
                <a
                  href={inspiration.links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/50 hover:text-red-500 transition-all duration-200"
                  aria-label={`${inspiration.name}'s YouTube`}
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {inspiration.links.instagram && (
                <a
                  href={inspiration.links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/50 hover:text-pink-500 transition-all duration-200"
                  aria-label={`${inspiration.name}'s Instagram`}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {inspiration.links.linkedin && (
                <a
                  href={inspiration.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/50 hover:text-blue-500 transition-all duration-200"
                  aria-label={`${inspiration.name}'s LinkedIn`}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {inspiration.links.website && (
                <a
                  href={inspiration.links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-all duration-200"
                  aria-label={`${inspiration.name}'s Website`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Corner accent */}
        <div
          className={`
            absolute top-0 right-0 w-24 h-24
            bg-gradient-to-bl ${inspiration.gradient}
            opacity-0 group-hover:opacity-50 transition-opacity duration-500
          `}
        />
      </div>
    </motion.div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function InspirationsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-black to-neutral-950" />

      {/* Subtle grid pattern */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 sm:mb-8">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm text-white/60">With gratitude</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  Inspirations
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed">
                Standing on the shoulders of giants. These incredible creators inspired different aspects of 8gent.
              </p>
            </motion.div>
          </div>
        </header>

        {/* Cards grid */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {inspirations.map((inspiration, index) => (
                <InspirationCard
                  key={inspiration.id}
                  inspiration={inspiration}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Footer message */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5">
              <p className="text-sm sm:text-base text-white/30 leading-relaxed">
                Every project is a collaboration with the broader creative community.
                If your work has inspired something here and I missed crediting you,
                please reach out. I&apos;d love to add you to this page.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Back button */}
        <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/10 text-white text-sm sm:text-base hover:bg-white/20 transition-colors backdrop-blur-xl border border-white/10"
          >
            ← Back to 8gent
          </Link>
        </div>
      </div>
    </main>
  );
}
