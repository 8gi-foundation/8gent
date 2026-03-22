/**
 * Ecosystem Footer
 *
 * Subtle footer linking all 8gent properties.
 * Highlights current site (8gentjr.com) with brand accent.
 * Works in both light and dark mode via CSS variables.
 */

const ECOSYSTEM_LINKS = [
  { label: '8gent.world', href: 'https://8gent.world' },
  { label: '8gentos.com', href: 'https://8gentos.com' },
  { label: '8gent.dev', href: 'https://8gent.dev' },
  { label: '8gentjr.com', href: 'https://8gentjr.com', current: true },
  { label: '8gent.games', href: 'https://8gent.games' },
];

export function EcosystemFooter() {
  return (
    <footer className="py-4 text-center">
      <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        {ECOSYSTEM_LINKS.map((link, i) => (
          <span key={link.label} className="flex items-center gap-1.5">
            {i > 0 && (
              <span
                className="text-[10px] select-none"
                style={{ color: 'var(--warm-text-placeholder, #B5ADA4)' }}
              >
                &middot;
              </span>
            )}
            <a
              href={link.href}
              target={link.current ? undefined : '_blank'}
              rel={link.current ? undefined : 'noopener noreferrer'}
              className="text-[12px] font-medium transition-colors hover:opacity-80"
              style={{
                color: link.current
                  ? 'var(--brand-accent, #E8610A)'
                  : 'var(--warm-text-muted, #9A9088)',
                fontWeight: link.current ? 600 : 400,
              }}
            >
              {link.label}
            </a>
          </span>
        ))}
      </div>
    </footer>
  );
}
