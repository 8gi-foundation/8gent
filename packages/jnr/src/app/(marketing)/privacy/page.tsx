import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How 8gent Jr protects your child\'s data. GDPR-compliant privacy policy for parents and guardians.',
};

const LAST_UPDATED = '22 March 2026';
const DPC_URL = 'https://www.dataprotection.ie';
const DPC_PHONE = '+353 (0)1 765 0100 / 1800 437 737';
const DPC_EMAIL = 'info@dataprotection.ie';
const DPC_ADDRESS =
  'Data Protection Commission, 21 Fitzwilliam Square South, Dublin 2, D02 RD28, Ireland';
const CONTROLLER_EMAIL = 'privacy@8gent.app';

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className="scroll-mt-24" />;
}

export default function PrivacyPolicyPage() {
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
          href="/privacy/kids"
          className="text-sm text-[#E8610A] hover:underline"
        >
          Kid-friendly version
        </Link>
      </nav>

      <article className="max-w-3xl mx-auto px-5 pt-12 pb-24">
        {/* Header */}
        <header className="mb-12">
          <h1
            className="text-3xl sm:text-4xl leading-tight tracking-tight mb-3"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 500 }}
          >
            Privacy Policy
          </h1>
          <p className="text-[#6B6560] text-sm">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="mt-4 text-[#6B6560] leading-relaxed max-w-2xl">
            8gent Jr is an AAC (Augmentative and Alternative Communication) app
            for children. We handle sensitive data, and we take that seriously.
            This policy explains exactly what we collect, why, and what control
            you have. No legal fog.
          </p>
        </header>

        {/* Table of Contents */}
        <nav className="mb-12 p-5 rounded-xl bg-white/60 border border-[#1A1614]/8">
          <p className="text-xs font-mono uppercase tracking-wider text-[#6B6560] mb-3">
            Contents
          </p>
          <ol className="space-y-1.5 text-sm text-[#3A3530]">
            {[
              ['data-controller', 'Who is responsible for your data'],
              ['what-we-collect', 'What data we collect'],
              ['why-we-collect', 'Why we collect it'],
              ['legal-basis', 'Legal basis under GDPR'],
              ['special-category', 'Health and disability data (Article 9)'],
              ['who-has-access', 'Who has access to the data'],
              ['retention', 'How long we keep it'],
              ['your-rights', 'Your rights (and your child\'s rights)'],
              ['delete-data', 'How to delete data'],
              ['withdraw-consent', 'How to withdraw consent'],
              ['cookies', 'Cookies'],
              ['changes', 'Changes to this policy'],
              ['complaints', 'How to complain'],
            ].map(([id, label], i) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="hover:text-[#E8610A] transition-colors"
                >
                  {i + 1}. {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10">
          {/* 1. Data Controller */}
          <section>
            <SectionAnchor id="data-controller" />
            <H2>1. Who is responsible for your data</H2>
            <P>
              The data controller is <strong>8gent</strong>, operated by James
              Spalding, based in Ireland.
            </P>
            <InfoBox>
              <Row label="Company" value="8gent" />
              <Row label="Contact" value={CONTROLLER_EMAIL} />
              <Row label="Jurisdiction" value="Ireland (EU/EEA)" />
              <Row
                label="Supervisory authority"
                value="Irish Data Protection Commission (DPC)"
              />
            </InfoBox>
          </section>

          {/* 2. What We Collect */}
          <section>
            <SectionAnchor id="what-we-collect" />
            <H2>2. What data we collect</H2>
            <P>
              We only collect data that is necessary for the app to work and
              improve. Here is the complete list:
            </P>

            <div className="space-y-4 mt-4">
              <DataCategory
                title="Communication data"
                items={[
                  'Which AAC cards your child taps and in what order',
                  'Sentences built from card sequences',
                  'Frequency of card usage (to surface favourites)',
                  'Custom cards or symbols you create',
                ]}
              />
              <DataCategory
                title="Voice preferences"
                items={[
                  'Selected voice type and speed',
                  'Volume and pitch settings',
                  'Language / locale preferences',
                ]}
              />
              <DataCategory
                title="Personalisation profile"
                items={[
                  'Display name and avatar choice',
                  'Board layout and colour preferences',
                  'Accessibility settings (e.g. switch access, dwell time)',
                  'Favourite categories and recently used cards',
                ]}
              />
              <DataCategory
                title="Game and activity data"
                items={[
                  'Scores and progress in learning games',
                  'Time spent in different activities',
                  'Skill level progression',
                ]}
              />
              <DataCategory
                title="Device and technical data"
                items={[
                  'Device type and screen size (for layout)',
                  'Browser or OS version',
                  'Crash reports and error logs',
                  'Session timestamps',
                ]}
              />
            </div>

            <Callout>
              We do <strong>not</strong> collect: real names (unless you choose
              to enter one), photos, location data, contacts, microphone
              recordings, or any biometric data.
            </Callout>
          </section>

          {/* 3. Why We Collect It */}
          <section>
            <SectionAnchor id="why-we-collect" />
            <H2>3. Why we collect it</H2>
            <div className="space-y-3 mt-3">
              <Purpose
                why="To make AAC communication work"
                detail="Card usage data powers the prediction engine that suggests the next likely card, reducing the number of taps your child needs to communicate."
              />
              <Purpose
                why="To personalise the experience"
                detail="Favourite cards, layout preferences, and voice settings are stored so the app feels familiar every time your child opens it."
              />
              <Purpose
                why="To track learning progress"
                detail="Game scores and activity data help you (the parent) and any therapists see how your child is progressing."
              />
              <Purpose
                why="To fix bugs and improve the app"
                detail="Crash reports and session data help us find and fix problems. We use aggregated, anonymised data to improve features."
              />
            </div>
          </section>

          {/* 4. Legal Basis */}
          <section>
            <SectionAnchor id="legal-basis" />
            <H2>4. Legal basis under GDPR</H2>
            <P>
              Under Irish and EU law, we need a legal reason to process personal
              data. Here are ours:
            </P>
            <div className="mt-4 space-y-3">
              <LegalBasis
                basis="Parental consent (Article 6(1)(a) + Article 8)"
                scope="All data relating to your child. In Ireland, the digital age of consent is 16, so we require verifiable parental or guardian consent before any child under 16 can use the app."
              />
              <LegalBasis
                basis="Explicit consent for special category data (Article 9(2)(a))"
                scope="Health and disability-related data. See Section 5 below."
              />
              <LegalBasis
                basis="Legitimate interest (Article 6(1)(f))"
                scope="Crash reports and anonymised usage analytics, where needed to keep the app stable and secure. We have conducted a Legitimate Interest Assessment (LIA) and concluded that these interests do not override the rights of the child."
              />
              <LegalBasis
                basis="Legal obligation (Article 6(1)(c))"
                scope="We retain consent records for 7 years as required for regulatory compliance."
              />
            </div>
          </section>

          {/* 5. Special Category Data */}
          <section>
            <SectionAnchor id="special-category" />
            <H2>5. Health and disability data (Article 9)</H2>
            <P>
              Because 8gent Jr is an AAC app designed for children with
              communication disabilities (including autism, apraxia, and other
              conditions), some of the data we process qualifies as{' '}
              <strong>special category data</strong> under Article 9 of the
              GDPR. This includes:
            </P>
            <ul className="mt-3 space-y-1.5 text-[#3A3530] text-[15px] leading-relaxed pl-5 list-disc">
              <li>
                The fact that your child uses an AAC app (which implies a
                communication disability)
              </li>
              <li>
                Accessibility settings that indicate specific needs (e.g. switch
                access for motor difficulties)
              </li>
              <li>
                Communication patterns that may relate to specific conditions
              </li>
            </ul>
            <Callout>
              We process this data <strong>only</strong> with your{' '}
              <strong>explicit consent</strong>, given during the parental
              consent flow when you set up the app. You can withdraw this
              consent at any time (see Section 9).
            </Callout>
          </section>

          {/* 6. Who Has Access */}
          <section>
            <SectionAnchor id="who-has-access" />
            <H2>6. Who has access to the data</H2>
            <InfoBox>
              <Row label="You (parent/guardian)" value="Full access. You can view, export, and delete all data at any time." />
              <Row label="Your child" value="Uses the app. Cannot access raw data or admin settings." />
              <Row label="8gent team" value="Access only for technical support, bug fixing, or legal obligation. Access is logged." />
              <Row label="Third-party advertisers" value="None. Zero. We do not sell, share, or trade data with advertisers." />
              <Row label="Third-party analytics" value="None. We do not use Google Analytics, Facebook Pixel, or any third-party tracking." />
              <Row label="Sub-processors" value="Hosting infrastructure only (Vercel for web hosting, Convex for database). Both are GDPR-compliant with DPAs in place." />
            </InfoBox>
            <P className="mt-3">
              We will never sell your child&apos;s data. We will never use it
              for advertising. We will never share it with anyone who does not
              strictly need it to keep the app running.
            </P>
          </section>

          {/* 7. Retention */}
          <section>
            <SectionAnchor id="retention" />
            <H2>7. How long we keep it</H2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left border-b border-[#1A1614]/10">
                    <th className="py-2 pr-4 text-[#6B6560] font-medium">
                      Data type
                    </th>
                    <th className="py-2 pr-4 text-[#6B6560] font-medium">
                      Retention period
                    </th>
                    <th className="py-2 text-[#6B6560] font-medium">
                      Why
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#3A3530]">
                  <RetentionRow
                    type="Session data (timestamps, device info)"
                    period="90 days"
                    why="Bug fixing and stability monitoring"
                  />
                  <RetentionRow
                    type="Communication patterns"
                    period="Until you request deletion"
                    why="Powers the prediction engine your child relies on"
                  />
                  <RetentionRow
                    type="Personalisation profile"
                    period="Until you request deletion"
                    why="Keeps the app familiar for your child"
                  />
                  <RetentionRow
                    type="Game progress"
                    period="Until you request deletion"
                    why="Tracks learning over time"
                  />
                  <RetentionRow
                    type="Consent records"
                    period="7 years after consent given"
                    why="Legal/regulatory requirement"
                  />
                  <RetentionRow
                    type="Crash reports"
                    period="30 days"
                    why="Debugging only"
                  />
                </tbody>
              </table>
            </div>
            <P className="mt-3">
              When you delete your account, all data except consent records is
              permanently deleted within 30 days. Consent records are retained
              for the legally required period, then deleted.
            </P>
          </section>

          {/* 8. Your Rights */}
          <section>
            <SectionAnchor id="your-rights" />
            <H2>8. Your rights (and your child&apos;s rights)</H2>
            <P>
              Under GDPR, you and your child have the following rights. As
              parent or guardian, you exercise these rights on your child&apos;s
              behalf until they reach 16:
            </P>
            <div className="mt-4 space-y-2">
              {[
                [
                  'Right of access',
                  'Request a copy of all data we hold about your child.',
                ],
                [
                  'Right to rectification',
                  'Correct any inaccurate data.',
                ],
                [
                  'Right to erasure',
                  'Request we delete all data. We will do so within 30 days.',
                ],
                [
                  'Right to data portability',
                  'Receive your child\'s data in a standard, machine-readable format.',
                ],
                [
                  'Right to restrict processing',
                  'Ask us to stop processing while a complaint is being resolved.',
                ],
                [
                  'Right to object',
                  'Object to processing based on legitimate interest.',
                ],
                [
                  'Right to withdraw consent',
                  'Withdraw consent at any time without affecting the lawfulness of prior processing.',
                ],
              ].map(([right, detail]) => (
                <div
                  key={right}
                  className="flex gap-3 p-3 rounded-lg bg-white/40"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E8610A] mt-2 shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-[#1A1614]">
                      {right}
                    </span>
                    <span className="text-sm text-[#6B6560] ml-1.5">
                      &mdash; {detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <P className="mt-3">
              To exercise any of these rights, email{' '}
              <a
                href={`mailto:${CONTROLLER_EMAIL}`}
                className="text-[#E8610A] underline"
              >
                {CONTROLLER_EMAIL}
              </a>{' '}
              or use the Parent Admin panel in the app. We will respond within
              30 days.
            </P>
          </section>

          {/* 9. How to Delete Data */}
          <section>
            <SectionAnchor id="delete-data" />
            <H2>9. How to delete data</H2>
            <P>You have two options:</P>
            <div className="mt-3 space-y-3">
              <div className="p-4 rounded-xl bg-white/60 border border-[#1A1614]/8">
                <p className="text-sm font-medium text-[#1A1614] mb-1">
                  Option A: In the app
                </p>
                <p className="text-sm text-[#6B6560]">
                  Open the Parent Admin panel (requires your parental PIN) and
                  select &quot;Delete all data&quot;. This is immediate and
                  irreversible.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/60 border border-[#1A1614]/8">
                <p className="text-sm font-medium text-[#1A1614] mb-1">
                  Option B: Email us
                </p>
                <p className="text-sm text-[#6B6560]">
                  Send a request to{' '}
                  <a
                    href={`mailto:${CONTROLLER_EMAIL}`}
                    className="text-[#E8610A] underline"
                  >
                    {CONTROLLER_EMAIL}
                  </a>
                  . We will verify your identity and delete data within 30 days.
                </p>
              </div>
            </div>
          </section>

          {/* 10. Withdraw Consent */}
          <section>
            <SectionAnchor id="withdraw-consent" />
            <H2>10. How to withdraw consent</H2>
            <P>
              You can withdraw consent at any time. This will not affect the
              lawfulness of any processing that happened before you withdrew.
            </P>
            <P>
              To withdraw consent, use the Parent Admin panel in the app, or
              email{' '}
              <a
                href={`mailto:${CONTROLLER_EMAIL}`}
                className="text-[#E8610A] underline"
              >
                {CONTROLLER_EMAIL}
              </a>
              . When you withdraw consent for special category data (health /
              disability data), we will stop processing that data immediately
              and delete it within 30 days.
            </P>
            <P>
              Note: withdrawing consent may mean some personalisation features
              stop working, as they rely on the data you consented to us
              processing.
            </P>
          </section>

          {/* 11. Cookies */}
          <section>
            <SectionAnchor id="cookies" />
            <H2>11. Cookies</H2>
            <P>
              We use <strong>only essential cookies</strong>. These are required
              for the app to function (e.g. keeping you logged in, remembering
              your parental session). We do not use:
            </P>
            <ul className="mt-2 space-y-1 text-sm text-[#3A3530] pl-5 list-disc">
              <li>Advertising cookies</li>
              <li>Third-party tracking cookies</li>
              <li>Analytics cookies</li>
              <li>Social media cookies</li>
            </ul>
            <P className="mt-2">
              Because we only use strictly necessary cookies, no cookie consent
              banner is required under the ePrivacy Directive. However, we list
              them here for transparency.
            </P>
          </section>

          {/* 12. Changes */}
          <section>
            <SectionAnchor id="changes" />
            <H2>12. Changes to this policy</H2>
            <P>
              If we make material changes to this policy, we will notify you via
              the app and email (if you have provided one) at least 30 days
              before the changes take effect. We will ask for fresh consent if
              any changes affect how we process your child&apos;s data.
            </P>
          </section>

          {/* 13. Complaints */}
          <section>
            <SectionAnchor id="complaints" />
            <H2>13. How to complain</H2>
            <P>
              If you are unhappy with how we handle your child&apos;s data, please
              contact us first at{' '}
              <a
                href={`mailto:${CONTROLLER_EMAIL}`}
                className="text-[#E8610A] underline"
              >
                {CONTROLLER_EMAIL}
              </a>
              . We will do our best to resolve the issue.
            </P>
            <P>
              If you are not satisfied with our response, you have the right to
              lodge a complaint with the Irish Data Protection Commission:
            </P>
            <InfoBox>
              <Row label="Name" value="Data Protection Commission (DPC)" />
              <Row label="Address" value={DPC_ADDRESS} />
              <Row label="Phone" value={DPC_PHONE} />
              <Row label="Email" value={DPC_EMAIL} />
              <Row
                label="Website"
                value={
                  <a
                    href={DPC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E8610A] underline"
                  >
                    {DPC_URL}
                  </a>
                }
              />
            </InfoBox>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[#1A1614]/8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-[#6B6560]">
            <p>
              8gent Jr &middot; Privacy Policy &middot; Last updated{' '}
              {LAST_UPDATED}
            </p>
            <div className="flex gap-4">
              <Link href="/privacy/kids" className="hover:text-[#E8610A] transition-colors">
                Kid-friendly version
              </Link>
              <Link href="/" className="hover:text-[#E8610A] transition-colors">
                Home
              </Link>
            </div>
          </div>
        </footer>
      </article>
    </main>
  );
}

/* ─── Reusable components ─── */

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xl sm:text-2xl leading-tight tracking-tight mb-3"
      style={{ fontFamily: 'Georgia, serif', fontWeight: 500 }}
    >
      {children}
    </h2>
  );
}

function P({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[15px] leading-relaxed text-[#3A3530] ${className}`}
    >
      {children}
    </p>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 p-4 rounded-xl bg-[#E8610A]/5 border border-[#E8610A]/15 text-sm text-[#3A3530] leading-relaxed">
      {children}
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 p-4 rounded-xl bg-white/60 border border-[#1A1614]/8 space-y-2">
      {children}
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-3 text-sm">
      <span className="text-[#6B6560] sm:w-44 shrink-0 font-medium">
        {label}
      </span>
      <span className="text-[#3A3530]">{value}</span>
    </div>
  );
}

function DataCategory({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="p-4 rounded-xl bg-white/60 border border-[#1A1614]/8">
      <p className="text-sm font-medium text-[#1A1614] mb-2">{title}</p>
      <ul className="space-y-1 text-sm text-[#6B6560] pl-4 list-disc">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Purpose({ why, detail }: { why: string; detail: string }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-white/40">
      <div className="w-1.5 h-1.5 rounded-full bg-[#2D8A56] mt-2 shrink-0" />
      <div>
        <span className="text-sm font-medium text-[#1A1614]">{why}</span>
        <p className="text-sm text-[#6B6560] mt-0.5">{detail}</p>
      </div>
    </div>
  );
}

function LegalBasis({ basis, scope }: { basis: string; scope: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/60 border border-[#1A1614]/8">
      <p className="text-sm font-medium text-[#1A1614] mb-1">{basis}</p>
      <p className="text-sm text-[#6B6560]">{scope}</p>
    </div>
  );
}

function RetentionRow({
  type,
  period,
  why,
}: {
  type: string;
  period: string;
  why: string;
}) {
  return (
    <tr className="border-b border-[#1A1614]/5">
      <td className="py-2.5 pr-4">{type}</td>
      <td className="py-2.5 pr-4 font-medium">{period}</td>
      <td className="py-2.5">{why}</td>
    </tr>
  );
}
