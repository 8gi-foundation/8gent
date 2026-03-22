'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Bottom Dock - iOS Style
 *
 * Navigation dock with inline SVG icons (no emojis in chrome).
 */

interface DockItem {
  id: string;
  label: string;
  icon: (props: { color: string }) => ReactNode;
  href: string;
}

// -- SVG Icon Components (20x20, stroke-based, currentColor) --

function IconSpeechBubble({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconMicrophone({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function IconPlay({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <polygon points="10 8 16 12 10 16" fill={color} stroke="none" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function IconPerson({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconGrid({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

const DOCK_ITEMS: DockItem[] = [
  { id: 'talk', label: 'Talk', icon: IconSpeechBubble, href: '/app' },
  { id: 'core', label: 'Core', icon: IconMicrophone, href: '/core' },
  { id: 'schooltube', label: 'SchoolTube', icon: IconPlay, href: '/schooltube' },
  { id: 'admin', label: 'Admin', icon: IconPerson, href: '/admin' },
  { id: 'more', label: 'More', icon: IconGrid, href: '/toolshed' },
];

interface DockProps {
  primaryColor?: string;
}

export function Dock({ primaryColor = '#E8610A' }: DockProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-[#E8E0D6]/50 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {DOCK_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const iconColor = isActive ? primaryColor : '#9A9088';
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center justify-center min-w-[72px] min-h-[48px] py-1.5 transition-transform active:scale-90"
            >
              <span
                className={`mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`}
              >
                <item.icon color={iconColor} />
              </span>
              <span
                className="text-[11px] font-medium"
                style={{ color: isActive ? primaryColor : '#9A9088' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
