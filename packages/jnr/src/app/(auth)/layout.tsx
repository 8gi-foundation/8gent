import type { ReactNode } from 'react';

/**
 * Auth layout for 8gent sign-in/sign-up pages
 *
 * Split layout with benefits panel on desktop,
 * simple centered layout on mobile.
 */
export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Benefits Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#E8610A] to-[#C47F17] p-12 flex-col justify-between">
        <div>
          <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            8gent Jr<span className="text-orange-200">.</span>
          </div>
          <h1 className="text-3xl font-bold text-white mt-8" style={{ fontFamily: 'var(--font-display)' }}>
            8gent Jr
          </h1>
          <p className="text-orange-100 mt-2">
            No more gatekeeping. A voice for every kid.
          </p>
        </div>

        <div className="space-y-8">
          <BenefitItem
            title="Familiar Communication"
            description="Upload your existing AAC layout and we'll match it"
          />
          <BenefitItem
            title="Your Own Voice"
            description="Create a unique voice that sounds like your child"
          />
          <BenefitItem
            title="Grows With Them"
            description="The system learns and adapts over time"
          />
          <BenefitItem
            title="Safe and Private"
            description="Your data stays yours, always"
          />
        </div>

        <p className="text-orange-200 text-sm">
          Part of the 8gent family
        </p>
      </div>

      {/* Auth Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-[#FFFDF9] via-[#FFF8F0] to-[#FFF3E8]">
        {children}
      </div>
    </div>
  );
}

function BenefitItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="w-2 h-2 mt-2 rounded-full bg-white/60 flex-shrink-0" />
      <div>
        <h3 className="text-white font-semibold">{title}</h3>
        <p className="text-orange-100 text-sm">{description}</p>
      </div>
    </div>
  );
}
