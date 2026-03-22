'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-[#E0F7FA] via-[#E8F5E9] to-[#F1F8E9]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:py-16">
        <div className="text-center space-y-5 max-w-lg w-full">
          {/* Animated Logo */}
          <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32 mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4CAF50] to-[#00ACC1] rounded-[32px] shadow-lg shadow-green-200/50 animate-[gentle-bob_3s_ease-in-out_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 18.5C15.5 18.5 18.5 15.5 18.5 12C18.5 8.5 15.5 5.5 12 5.5C8.5 5.5 5.5 8.5 5.5 12" />
                <circle cx="9" cy="11" r="1.2" fill="white" />
                <circle cx="15" cy="11" r="1.2" fill="white" />
                <path d="M9.5 15C10.2 16 11 16.5 12 16.5C13 16.5 13.8 16 14.5 15" />
                <path d="M3 12C2 13.5 2.5 16 4 17" />
                <path d="M1.5 10C1 11.5 1 13 1.5 14.5" />
              </svg>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-[2.25rem] sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Your Voice,
            <br />
            <span className="bg-gradient-to-r from-[#4CAF50] to-[#00ACC1] bg-clip-text text-transparent">
              Your Way
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-gray-600 max-w-sm mx-auto leading-relaxed">
            An AI-powered AAC app that learns how your child communicates and grows with them.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-3 w-full max-w-xs mx-auto">
            <Link
              href="/sign-up"
              className="w-full py-4 bg-gradient-to-r from-[#4CAF50] to-[#43A047] text-white text-lg font-bold rounded-2xl
                       hover:from-[#43A047] hover:to-[#388E3C] active:scale-[0.97] transition-all
                       shadow-lg shadow-green-300/40 text-center"
            >
              Get Started Free
            </Link>
            <Link
              href="/sign-in"
              className="w-full py-4 bg-white/80 text-gray-700 text-lg font-semibold rounded-2xl
                       hover:bg-white active:scale-[0.97] transition-all
                       border border-gray-200/80 shadow-sm text-center"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-lg sm:max-w-3xl w-full px-1">
          <FeatureCard
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="2" />
                <rect x="14" y="3" width="7" height="7" rx="2" />
                <rect x="3" y="14" width="7" height="7" rx="2" />
                <rect x="14" y="14" width="7" height="7" rx="2" />
              </svg>
            }
            title="Core Words"
            description="50 Supercore words with symbols your child already knows"
            color="#4CAF50"
          />
          <FeatureCard
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00ACC1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            }
            title="Neural Voice"
            description="Kiki — a warm, natural-sounding voice made for kids"
            color="#00ACC1"
          />
          <FeatureCard
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            }
            title="AI That Adapts"
            description="Learns your child's GLP stage and grows with them"
            color="#FF9800"
          />
        </div>

        {/* Trust Signal */}
        <div className="mt-10 text-center">
          <p className="text-xs text-gray-400 tracking-wide uppercase font-medium">
            Built with speech-language pathologists
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-gray-300">
            <span className="text-sm font-medium">ARASAAC Symbols</span>
            <span>·</span>
            <span className="text-sm font-medium">Fitzgerald Key</span>
            <span>·</span>
            <span className="text-sm font-medium">GLP Stages 1-6</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-6 text-center text-sm text-gray-400 border-t border-white/60">
        <p>
          <a href="https://8gent.world" className="text-[#4CAF50] hover:underline font-medium">
            8gent
          </a>
          {' · '}
          <a href="https://x.com/8gentapp" className="text-gray-500 hover:underline">
            @8gentapp
          </a>
        </p>
      </footer>

      <style>{`
        @keyframes gentle-bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(2deg); }
        }
      `}</style>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="p-5 bg-white/70 backdrop-blur-sm rounded-[20px] border border-white/80 shadow-sm
                    hover:shadow-md hover:bg-white/90 transition-all">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}15` }}
      >
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
