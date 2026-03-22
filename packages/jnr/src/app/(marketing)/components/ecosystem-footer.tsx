const ecosystemLinks = [
  { label: '8gent.world', href: 'https://8gent.world' },
  { label: '8gentos.com', href: 'https://8gentos.com' },
  { label: '8gent.dev', href: 'https://8gent.dev' },
  { label: '8gentjr.com', href: 'https://8gentjr.com', current: true },
  { label: '8gent.games', href: 'https://8gent.games' },
];

export function EcosystemFooter() {
  return (
    <footer className="px-5 py-8 border-t" style={{ borderColor: 'var(--warm-border, #E8E0D6)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-4">
          <span
            className="text-[10px] font-mono uppercase tracking-[0.15em]"
            style={{ color: 'var(--warm-text-muted, #9A9088)' }}
          >
            The 8gent Ecosystem
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-4">
          {ecosystemLinks.map((link, i) => (
            <span key={link.href} className="flex items-center gap-5">
              <a
                href={link.href}
                target={link.current ? undefined : '_blank'}
                rel={link.current ? undefined : 'noopener noreferrer'}
                className="text-sm hover:underline transition-colors"
                style={{
                  color: link.current
                    ? 'var(--brand-accent, #E8610A)'
                    : 'var(--warm-text-muted, #9A9088)',
                  fontWeight: link.current ? 600 : 500,
                }}
              >
                {link.label}
              </a>
              {i < ecosystemLinks.length - 1 && (
                <span
                  className="w-1 h-1 rounded-full hidden sm:block"
                  style={{ backgroundColor: 'var(--warm-text-placeholder, #B5ADA4)' }}
                />
              )}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs" style={{ color: 'var(--warm-text-muted, #9A9088)' }}>
          <a href="https://x.com/8gentapp" className="hover:underline">
            @8gentapp
          </a>
          <span
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: 'var(--warm-text-muted, #9A9088)' }}
          />
          <a
            href="https://github.com/PodJamz/8gent-code"
            className="hover:underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
