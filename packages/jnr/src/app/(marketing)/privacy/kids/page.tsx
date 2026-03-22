import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy - For Kids',
  description:
    'A kid-friendly explanation of how 8gent Jr looks after your information.',
};

export default function KidsPrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] text-[#1A1614]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#E8610A]/10 border border-[#E8610A]/30 flex items-center justify-center">
            <span
              className="text-[#E8610A] font-bold text-sm"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              8
            </span>
          </div>
          <span className="text-sm font-medium tracking-tight">8gent Jr</span>
        </Link>
        <Link
          href="/privacy"
          className="text-sm text-[#6B6560] hover:text-[#1A1614] transition-colors"
        >
          Grown-up version
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-5 pt-10 pb-24">
        {/* Hero */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#E8610A]/10 border-2 border-[#E8610A]/20 mb-5">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M20 4C11.16 4 4 11.16 4 20s7.16 16 16 16 16-7.16 16-16S28.84 4 20 4zm0 6a4 4 0 110 8 4 4 0 010-8zm0 20c-4 0-7.54-2.04-9.6-5.14C12.76 22.58 18.66 21.5 20 21.5s7.24 1.08 9.6 3.36C27.54 27.96 24 30 20 30z"
                fill="#E8610A"
                opacity="0.8"
              />
            </svg>
          </div>
          <h1
            className="text-2xl sm:text-3xl leading-tight tracking-tight mb-3"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 500 }}
          >
            Your privacy, explained simply
          </h1>
          <p className="text-lg text-[#6B6560] leading-relaxed max-w-md mx-auto">
            This page tells you how 8gent Jr looks after your information. It is
            written for you, not for grown-ups.
          </p>
        </header>

        <div className="space-y-5">
          {/* Card 1: What we know */}
          <Card
            color="#E8610A"
            icon={
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect x="4" y="6" width="20" height="16" rx="3" stroke="#E8610A" strokeWidth="2" fill="none" />
                <circle cx="14" cy="14" r="3" fill="#E8610A" />
                <path d="M8 19c1.5-2 3.5-3 6-3s4.5 1 6 3" stroke="#E8610A" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            }
            title="What does 8gent Jr know about me?"
          >
            <ul className="space-y-2.5">
              <ListItem>Which cards you tap when you talk</ListItem>
              <ListItem>Your favourite cards and colours</ListItem>
              <ListItem>What voice you picked</ListItem>
              <ListItem>How you are doing in games</ListItem>
              <ListItem>What kind of phone or tablet you use</ListItem>
            </ul>
            <Highlight>
              We do NOT know your real name, where you live, or what you look
              like. We never turn on your camera or microphone.
            </Highlight>
          </Card>

          {/* Card 2: Why */}
          <Card
            color="#2D8A56"
            icon={
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M14 4l2.5 6.5H24l-5.5 4 2 6.5L14 17l-6.5 4 2-6.5L4 10.5h7.5L14 4z" fill="#2D8A56" />
              </svg>
            }
            title="Why does it need to know?"
          >
            <ul className="space-y-2.5">
              <ListItem>
                <strong>To help you talk faster.</strong> When the app knows
                which cards you use the most, it can put them closer so you
                don&apos;t have to search.
              </ListItem>
              <ListItem>
                <strong>To remember your settings.</strong> So every time you
                open the app, it looks and sounds the way you like.
              </ListItem>
              <ListItem>
                <strong>To fix things that break.</strong> If something goes
                wrong, we need to know so we can make it better.
              </ListItem>
            </ul>
          </Card>

          {/* Card 3: Sharing */}
          <Card
            color="#6366F1"
            icon={
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M7 14h14M14 7v14" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
                <circle cx="14" cy="14" r="10" stroke="#6366F1" strokeWidth="2" fill="none" />
              </svg>
            }
            title="We never share your stuff with strangers"
          >
            <p className="text-base text-[#3A3530] leading-relaxed">
              Your information stays between you, your grown-up, and 8gent Jr.
              Nobody else gets to see it.
            </p>
            <Highlight>
              We don&apos;t give your information to other companies. Not ever.
            </Highlight>
          </Card>

          {/* Card 4: No adverts */}
          <Card
            color="#EAB308"
            icon={
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <circle cx="14" cy="14" r="10" stroke="#EAB308" strokeWidth="2" fill="none" />
                <path d="M9 9l10 10M19 9L9 19" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            }
            title="We don't show you any adverts"
          >
            <p className="text-base text-[#3A3530] leading-relaxed">
              No pop-ups. No banners. No &quot;buy this&quot; buttons. 8gent Jr
              is here to help you talk, not to sell you things.
            </p>
          </Card>

          {/* Card 5: Forgetting */}
          <Card
            color="#EC4899"
            icon={
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M8 8h12v14a2 2 0 01-2 2H10a2 2 0 01-2-2V8z" stroke="#EC4899" strokeWidth="2" fill="none" />
                <path d="M6 8h16" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
                <path d="M11 5h6" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 12v6M16 12v6" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            title="Your grown-up can ask us to forget everything"
          >
            <p className="text-base text-[#3A3530] leading-relaxed">
              If your parent or guardian wants us to delete all your
              information, we will. They can do it right from the app, or they
              can send us a message.
            </p>
            <Highlight>
              Once it is deleted, it is gone. We can&apos;t get it back, and
              neither can anyone else.
            </Highlight>
          </Card>

          {/* Card 6: Safety */}
          <Card
            color="#0EA5E9"
            icon={
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path
                  d="M14 3L4 8v6c0 6.63 4.27 12.84 10 14.36C19.73 26.84 24 20.63 24 14V8L14 3z"
                  fill="#0EA5E9"
                  opacity="0.15"
                  stroke="#0EA5E9"
                  strokeWidth="2"
                />
                <path d="M10 14l3 3 5-5" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="We keep your information safe"
          >
            <p className="text-base text-[#3A3530] leading-relaxed">
              We use strong locks (called encryption) to keep your information
              safe. Only you and your grown-up can see it.
            </p>
          </Card>

          {/* Card 7: Questions */}
          <Card
            color="#8B5CF6"
            icon={
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <circle cx="14" cy="14" r="10" stroke="#8B5CF6" strokeWidth="2" fill="none" />
                <path d="M11 11a3 3 0 015.2 2c0 2-3 2-3 4" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" fill="none" />
                <circle cx="14" cy="20" r="1" fill="#8B5CF6" />
              </svg>
            }
            title="Got questions?"
          >
            <p className="text-base text-[#3A3530] leading-relaxed">
              Ask your parent or guardian. They can read the{' '}
              <Link
                href="/privacy"
                className="text-[#E8610A] underline font-medium"
              >
                full privacy page
              </Link>{' '}
              that has all the details. Or they can email us at{' '}
              <span className="font-medium text-[#1A1614]">
                privacy@8gent.app
              </span>
              .
            </p>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-14 pt-6 border-t border-[#1A1614]/8 text-center">
          <p className="text-sm text-[#6B6560]">
            8gent Jr looks after your information.{' '}
            <Link
              href="/privacy"
              className="text-[#E8610A] hover:underline"
            >
              Read the full privacy policy
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}

/* ─── Reusable components ─── */

function Card({
  color,
  icon,
  title,
  children,
}: {
  color: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="p-6 sm:p-7 rounded-2xl bg-white/70 border-2 transition-colors"
      style={{ borderColor: `${color}20` }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}10` }}
        >
          {icon}
        </div>
        <h2
          className="text-lg sm:text-xl leading-snug tracking-tight pt-2"
          style={{ fontFamily: 'Georgia, serif', fontWeight: 500 }}
        >
          {title}
        </h2>
      </div>
      <div className="pl-0 sm:pl-16">{children}</div>
    </section>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-base text-[#3A3530] leading-relaxed">
      <span className="w-2 h-2 rounded-full bg-[#E8610A]/40 mt-2 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 p-4 rounded-xl bg-[#F5F0EB] border border-[#1A1614]/8 text-sm text-[#3A3530] leading-relaxed font-medium">
      {children}
    </div>
  );
}
