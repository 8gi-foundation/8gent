import Link from 'next/link';
import { EcosystemFooter } from '../components/ecosystem-footer';

/* ─── SVG Icon Components ─── */

function VoiceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CreativityIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function LearnIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

/* ─── Feature Data ─── */

const capabilities = [
  {
    icon: VoiceIcon,
    title: 'Give Them Their Voice',
    description:
      'A proactive AAC system that helps your child communicate by learning about them and learning from them. Child-led, parent and therapist guided. It meets them where they are and moves with them as they grow.',
  },
  {
    icon: CreativityIcon,
    title: 'Channel Their Creativity',
    description:
      'Your child creates their own music, games, and experiences through interaction and play, with very little effort. The AI understands what they need and the limits of what should be created. Safe, playful, theirs.',
  },
  {
    icon: LearnIcon,
    title: 'Learn How They Learn',
    description:
      'Interactive experiences designed for neurodivergent engagement that gauge your child\'s interests and learning style. Personalized learning that fits how their mind works. No kid is left behind.',
  },
  {
    icon: ReportIcon,
    title: 'Reports Your Therapist Will Love',
    description:
      'Communication analytics that speech-language therapists can actually use. Vocabulary growth, stage progression, and usage patterns tracked automatically. No more manual data collection.',
  },
  {
    icon: HeartIcon,
    title: 'Software That Knows Your Child',
    description:
      'Personal software designed to fill the gaps the system left behind. Your child can thrive in their own way, be respected for their differences, and truly have a voice in this world.',
  },
];

const featureGrid = [
  { label: 'Core Words', detail: '50 Supercore', color: '#2D8A56' },
  { label: 'Neural Voice', detail: 'Kiki TTS', color: '#E8610A' },
  { label: 'GLP Stages', detail: '1-6 adaptive', color: '#C47F17' },
  { label: 'SchoolTube', detail: 'Learning games', color: '#2D8A56' },
];

/* ─── Page ─── */

export default function JrHomePage() {
  return (
    <main className="min-h-screen bg-[#FFFDF9] text-[#1A1612]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#E8610A]/10 border border-[#E8610A]/30 flex items-center justify-center">
            <span
              className="text-[#E8610A] font-bold text-sm"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
            >
              8
            </span>
          </div>
          <span
            className="text-sm font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
          >
            8gent Jr<span className="text-[#E8610A]">.</span>
          </span>
        </div>
        <Link
          href="/sign-in"
          className="text-sm text-[#5C544A] hover:text-[#1A1612] transition-colors"
        >
          Sign In
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-5">
        {/* ─── Hero ─── */}
        <section className="pt-12 pb-12 sm:pt-20 sm:pb-16">
          <h1
            className="text-3xl sm:text-4xl md:text-[48px] leading-[1.15] tracking-tight mb-5"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 800, letterSpacing: '-0.02em' }}
          >
            No more <span className="text-[#E8610A]">gatekeeping.</span>
            <br />
            A voice for every kid.
          </h1>

          <p className="text-base sm:text-lg text-[#5C544A] max-w-xl leading-relaxed mb-8 font-light">
            A super-powered AI assistant that learns with your child.
            Communication, education, creativity, play. All in one place.
            Accessibility first. Free forever.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E8610A] text-white text-sm font-medium
                       hover:bg-[#D15709] active:scale-[0.97] transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-[#E8E0D6] text-[#5C544A] text-sm
                       hover:border-[#1A1612]/24 hover:text-[#1A1612] transition-all"
            >
              Privacy & Safety
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5 text-[10px] font-mono text-[#9A9088]">
            <span>Free forever</span>
            <span className="w-1 h-1 rounded-full bg-[#9A9088]" />
            <span>GDPR compliant</span>
            <span className="w-1 h-1 rounded-full bg-[#9A9088]" />
            <span>No ads, no tracking</span>
          </div>
        </section>

        {/* ─── The Problem ─── */}
        <section className="pb-12 sm:pb-16">
          <div className="bg-[#FFF8F0] border border-[#E8E0D6] rounded-xl p-6 sm:p-7">
            <h2
              className="text-lg mb-3"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 700 }}
            >
              The problem we&apos;re solving
            </h2>
            <ul className="grid gap-2">
              {[
                'AAC devices cost thousands and lock you into one vendor',
                'Assistive software is years behind modern AI capabilities',
                'Tools are designed for therapists, not for kids to actually enjoy',
                'Personalization means picking from 6 preset profiles',
                'If your kid outgrows the tool, you start over with a new one',
              ].map((item) => (
                <li
                  key={item}
                  className="text-sm text-[#5C544A] pl-5 relative before:content-[''] before:absolute before:left-0 before:top-[10px] before:w-2 before:h-0.5 before:bg-[#E8610A] before:rounded-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── What 8gent Jr Actually Is ─── */}
        <section className="pb-12 sm:pb-16">
          <h2
            className="text-xl sm:text-2xl tracking-tight mb-2"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 700 }}
          >
            What 8gent Jr actually is
          </h2>
          <p className="text-[15px] text-[#5C544A] leading-relaxed mb-6">
            A safe, hyper-personalized AI assistant that&apos;s wired to help your child
            in everything they do. It learns from them, grows with them, and is
            designed to fill the gaps the system has left behind.
          </p>

          <div className="grid gap-3">
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                className="grid grid-cols-[44px_1fr] gap-3.5 items-start p-5 bg-[#FFF8F0] rounded-xl border border-[#E8E0D6]"
              >
                <div className="w-11 h-11 rounded-[11px] flex items-center justify-center bg-[#E8610A]/7 text-[#E8610A] shrink-0">
                  <cap.icon />
                </div>
                <div>
                  <h3
                    className="text-[15px] mb-1"
                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 700 }}
                  >
                    {cap.title}
                  </h3>
                  <p className="text-[13px] text-[#5C544A] leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Feature Grid ─── */}
        <section className="pb-12 sm:pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {featureGrid.map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-xl bg-white border border-[#E8E0D6] text-center"
              >
                <div
                  className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
                <div className="text-sm font-medium mb-0.5">{item.label}</div>
                <div className="text-[11px] text-[#9A9088]">{item.detail}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Built With ─── */}
        <section className="pb-12 sm:pb-16">
          <div className="py-7 border-t border-b border-[#E8E0D6] grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1">
                Built With
              </h4>
              <p className="text-xs text-[#9A9088] leading-relaxed">
                A father and his non-verbal autistic son
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1">
                Developed With
              </h4>
              <p className="text-xs text-[#9A9088] leading-relaxed">
                Speech-language therapists from day one
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1">
                Growing With
              </h4>
              <p className="text-xs text-[#9A9088] leading-relaxed">
                A community feedback loop that shapes the core
              </p>
            </div>
          </div>
        </section>

        {/* ─── Origin Story ─── */}
        <section className="pb-12 sm:pb-16">
          <div className="bg-[#FFF8F0] rounded-xl border border-[#E8E0D6] border-l-[3px] border-l-[#E8610A] p-6 sm:p-7">
            <p className="text-[15px] text-[#5C544A] leading-relaxed italic">
              &ldquo;8gent Jr started because my son Nick is autistic and non-verbal.
              The tools that exist cost thousands, lock you in, and haven&apos;t
              caught up with what AI can do. So I built what I wished existed.
              Everything good in 8gent Jr comes from watching Nick use it.&rdquo;
            </p>
          </div>
        </section>

        {/* ─── Privacy ─── */}
        <section className="pb-12 sm:pb-16">
          <div className="flex items-start gap-3.5 p-5 bg-white rounded-xl border border-[#E8E0D6]">
            <div className="w-11 h-11 rounded-[11px] flex items-center justify-center bg-[#2D8A56]/10 text-[#2D8A56] shrink-0">
              <ShieldIcon />
            </div>
            <div>
              <h3
                className="text-[15px] mb-1"
                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 700 }}
              >
                Privacy-first. Always.
              </h3>
              <p className="text-[13px] text-[#5C544A] leading-relaxed mb-2">
                No ads. No tracking. No selling data. GDPR compliant. Your child&apos;s
                data is encrypted and belongs to you. Free forever means free forever
                &mdash; not &ldquo;free until we find a business model.&rdquo;
              </p>
              <Link
                href="/privacy"
                className="text-[13px] font-medium text-[#E8610A] hover:underline"
              >
                Read our privacy policy
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ─── Ecosystem Footer ─── */}
      <EcosystemFooter />
    </main>
  );
}
