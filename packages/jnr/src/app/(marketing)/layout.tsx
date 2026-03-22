import type { ReactNode } from 'react';

/**
 * Marketing layout for 8gent public pages
 *
 * Overrides body overflow:hidden (set globally for AAC boards)
 * so marketing pages can scroll normally.
 */
export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <style>{`html, body { overflow: auto !important; height: auto !important; }`}</style>
      <div className="min-h-screen">
        {children}
      </div>
    </>
  );
}
