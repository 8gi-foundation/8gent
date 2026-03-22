'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Bottom Dock - iOS Style
 *
 * Navigation dock with app icons.
 */

interface DockItem {
  id: string;
  label: string;
  emoji: string;
  href: string;
}

const DOCK_ITEMS: DockItem[] = [
  { id: 'talk', label: 'Talk', emoji: '💬', href: '/app' },
  { id: 'core', label: 'Core', emoji: '🗣️', href: '/core' },
  { id: 'schooltube', label: 'SchoolTube', emoji: '📺', href: '/schooltube' },
  { id: 'more', label: 'More', emoji: '➕', href: '/toolshed' },
];

interface DockProps {
  primaryColor?: string;
}

export function Dock({ primaryColor = '#4CAF50' }: DockProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {DOCK_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center justify-center min-w-[72px] min-h-[48px] py-1.5 transition-transform active:scale-90"
            >
              <span
                className={`text-[32px] leading-none mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`}
              >
                {item.emoji}
              </span>
              <span
                className="text-[11px] font-medium"
                style={{ color: isActive ? primaryColor : '#8E8E93' }}
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
