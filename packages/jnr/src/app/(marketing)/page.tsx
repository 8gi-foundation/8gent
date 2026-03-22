'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] text-[#1A1614] overflow-y-auto fixed inset-0 z-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#E8610A]/10 border border-[#E8610A]/30 flex items-center justify-center">
            <span className="text-[#E8610A] font-bold text-sm" style={{ fontFamily: 'Georgia, serif' }}>8</span>
          </div>
          <span className="text-sm font-medium tracking-tight">8gent</span>
        </div>
        <Link
          href="/sign-in"
          className="text-sm text-[#6B6560] hover:text-[#1A1614] transition-colors"
        >
          Sign In
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-5">
        {/* Hero */}
        <section className="pt-16 pb-16 sm:pt-24 sm:pb-20">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-[#E8610A]/20 bg-[#E8610A]/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8610A]" />
            <span className="text-[10px] font-mono text-[#E8610A] tracking-wide uppercase">Open Source · 3 Products · 1 Intelligence</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl leading-[1.1] tracking-tight mb-4"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 500 }}
          >
            One AI that learns you.
            <br />
            <span className="bg-gradient-to-r from-[#E8610A] to-[#C47F17] bg-clip-text text-transparent">
              Three interfaces to use it.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#6B6560] max-w-xl leading-relaxed mb-8">
            8gent is a personal AI operating system. It codes, it communicates, it grows with your family.
            Free, local-first, self-improving.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E8610A] text-white text-sm font-medium
                       hover:bg-[#CC5508] active:scale-[0.97] transition-all"
            >
              Get Started Free
            </Link>
            <a
              href="https://github.com/PodJamz/8gent-code"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-[#1A1614]/12 text-[#6B6560] text-sm
                       hover:border-[#1A1614]/24 hover:text-[#1A1614] transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              Clone &amp; Run
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 text-[10px] font-mono text-[#6B6560]">
            <span>MIT License</span>
            <span className="w-1 h-1 rounded-full bg-[#6B6560]" />
            <span>$0 to start</span>
            <span className="w-1 h-1 rounded-full bg-[#6B6560]" />
            <span>Local-first</span>
          </div>
        </section>

        {/* Three Product Cards */}
        <section className="pb-16 sm:pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Code */}
            <div className="p-6 rounded-xl border border-[#E8610A]/20 bg-white flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-[#E8610A]/10 border border-[#E8610A]/20 flex items-center justify-center text-[#E8610A] font-mono text-sm font-bold mb-3">
                &lt;/&gt;
              </div>
              <span className="text-[10px] font-mono text-[#E8610A] uppercase tracking-wider mb-1">For Developers</span>
              <h3 className="text-base font-medium mb-2">Your coding agent. $0. Local.</h3>
              <p className="text-sm text-[#6B6560] leading-relaxed mb-4 flex-1">
                Plans every change. Validates with tests. Runs on Ollama with 14 local models. Open source.
              </p>
              <a href="https://github.com/PodJamz/8gent-code" className="text-sm font-medium text-[#E8610A] hover:opacity-80">
                Clone &amp; Run &rarr;
              </a>
            </div>

            {/* OS */}
            <div className="p-6 rounded-xl border border-[#C47F17]/20 bg-white flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-[#C47F17]/10 border border-[#C47F17]/20 flex items-center justify-center text-[#C47F17] font-mono text-sm font-bold mb-3">
                ~
              </div>
              <span className="text-[10px] font-mono text-[#C47F17] uppercase tracking-wider mb-1">For Everyone</span>
              <h3 className="text-base font-medium mb-2">Your personal AI OS.</h3>
              <p className="text-sm text-[#6B6560] leading-relaxed mb-4 flex-1">
                An always-on system that manages projects, automates workflows, and handles communication. Your data stays yours.
              </p>
              <Link href="/sign-up" className="text-sm font-medium text-[#C47F17] hover:opacity-80">
                Join Waitlist &rarr;
              </Link>
            </div>

            {/* Jr */}
            <div className="p-6 rounded-xl border border-[#4C9AFF]/20 bg-white flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-[#4C9AFF]/10 border border-[#4C9AFF]/20 flex items-center justify-center text-[#4C9AFF] text-lg mb-3">
                &#9829;
              </div>
              <span className="text-[10px] font-mono text-[#4C9AFF] uppercase tracking-wider mb-1">For Families</span>
              <h3 className="text-base font-medium mb-2">Every child deserves a voice.</h3>
              <p className="text-sm text-[#6B6560] leading-relaxed mb-4 flex-1">
                AAC communication for autistic and non-verbal children. GLP-stage adaptive. Kiki neural voice. Free forever.
              </p>
              <Link href="/sign-up" className="text-sm font-medium text-[#4C9AFF] hover:opacity-80">
                Get Started &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Jr Spotlight — kid-friendly sub-section */}
        <section className="pb-16 sm:pb-20">
          <div className="border-t border-[#1A1614]/8 pt-12">
            <div className="text-center mb-8">
              <span className="text-[10px] font-mono text-[#4C9AFF] uppercase tracking-[0.2em] block mb-3">8gent Jr</span>
              <h2
                className="text-2xl sm:text-3xl tracking-tight mb-3"
                style={{ fontFamily: 'Georgia, serif', fontWeight: 500 }}
              >
                Built for children who see<br />the world differently.
              </h2>
              <p className="text-sm text-[#6B6560] max-w-md mx-auto leading-relaxed">
                Designed with speech-language pathologists. ARASAAC symbols. Fitzgerald Key colors.
                GLP stages 1-6. Motor planning lock so buttons never move.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Core Words', detail: '50 Supercore', color: '#4CAF50' },
                { label: 'Neural Voice', detail: 'Kiki TTS', color: '#4C9AFF' },
                { label: 'GLP Stages', detail: '1-6 adaptive', color: '#E8610A' },
                { label: 'SchoolTube', detail: 'Learning games', color: '#C47F17' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-4 rounded-xl bg-white border border-[#1A1614]/8 text-center"
                >
                  <div
                    className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                  <div className="text-sm font-medium mb-0.5">{item.label}</div>
                  <div className="text-[11px] text-[#6B6560]">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="px-5 py-6 text-center text-sm text-[#6B6560] border-t border-[#1A1614]/8">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href="https://8gent.world" className="text-[#E8610A] hover:underline font-medium">8gent.world</a>
          <span className="w-1 h-1 rounded-full bg-[#6B6560]" />
          <a href="https://x.com/8gentapp" className="hover:underline">@8gentapp</a>
          <span className="w-1 h-1 rounded-full bg-[#6B6560]" />
          <a href="https://github.com/PodJamz/8gent-code" className="hover:underline">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
