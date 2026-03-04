/**
 * SafeArea Component for 8gent Jr
 *
 * Handles device notches, home indicators, and system UI overlays.
 * Essential for mobile-first AAC applications.
 */

'use client';

import { forwardRef, useMemo, type HTMLAttributes } from 'react';
import type { SafeAreaProps } from '@/types/ui';

/**
 * SafeArea wrapper component
 *
 * Uses CSS environment variables for safe area insets:
 * - env(safe-area-inset-top)
 * - env(safe-area-inset-bottom)
 * - env(safe-area-inset-left)
 * - env(safe-area-inset-right)
 */
export const SafeArea = forwardRef<HTMLDivElement, SafeAreaProps>(
  (
    {
      top = true,
      bottom = true,
      left = true,
      right = true,
      backgroundColor = 'transparent',
      children,
      className = '',
      style,
      testId,
    },
    ref
  ) => {
    const safeAreaStyle = useMemo(
      () => ({
        ...style,
        paddingTop: top ? 'env(safe-area-inset-top, 0px)' : undefined,
        paddingBottom: bottom ? 'env(safe-area-inset-bottom, 0px)' : undefined,
        paddingLeft: left ? 'env(safe-area-inset-left, 0px)' : undefined,
        paddingRight: right ? 'env(safe-area-inset-right, 0px)' : undefined,
        backgroundColor,
      }),
      [style, top, bottom, left, right, backgroundColor]
    );

    return (
      <div
        ref={ref}
        className={`safe-area-container ${className}`}
        style={safeAreaStyle}
        data-testid={testId}
      >
        {children}
      </div>
    );
  }
);

SafeArea.displayName = 'SafeArea';

/**
 * SafeAreaView - Full screen container with safe area insets
 * Use this as the root container for screens
 */
export interface SafeAreaViewProps extends SafeAreaProps {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const SafeAreaView = forwardRef<HTMLDivElement, SafeAreaViewProps>(
  (
    {
      edges = ['top', 'bottom', 'left', 'right'],
      children,
      className = '',
      style,
      backgroundColor,
      testId,
    },
    ref
  ) => {
    const safeAreaStyle = useMemo(() => {
      const insets: Record<string, string | undefined> = {
        paddingTop: edges.includes('top')
          ? 'env(safe-area-inset-top, 0px)'
          : undefined,
        paddingBottom: edges.includes('bottom')
          ? 'env(safe-area-inset-bottom, 0px)'
          : undefined,
        paddingLeft: edges.includes('left')
          ? 'env(safe-area-inset-left, 0px)'
          : undefined,
        paddingRight: edges.includes('right')
          ? 'env(safe-area-inset-right, 0px)'
          : undefined,
      };

      return {
        ...style,
        ...insets,
        backgroundColor,
        minHeight: '100dvh', // Dynamic viewport height
        display: 'flex',
        flexDirection: 'column' as const,
      };
    }, [style, edges, backgroundColor]);

    return (
      <div
        ref={ref}
        className={`safe-area-view ${className}`}
        style={safeAreaStyle}
        data-testid={testId}
      >
        {children}
      </div>
    );
  }
);

SafeAreaView.displayName = 'SafeAreaView';

/**
 * Fixed bottom bar with safe area padding
 * Perfect for the AAC speak button bar
 */
export interface FixedBottomBarProps {
  children: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  withShadow?: boolean;
}

export const FixedBottomBar = forwardRef<HTMLDivElement, FixedBottomBarProps>(
  (
    {
      children,
      className = '',
      backgroundColor = '#FFFFFF',
      withShadow = true,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          fixed bottom-0 left-0 right-0
          z-40
          ${withShadow ? 'shadow-lg shadow-gray-200/50' : ''}
          ${className}
        `}
        style={{
          backgroundColor,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        {children}
      </div>
    );
  }
);

FixedBottomBar.displayName = 'FixedBottomBar';

/**
 * Fixed header with safe area padding
 * For top navigation in AAC boards
 */
export interface FixedHeaderProps {
  children: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  withShadow?: boolean;
  transparent?: boolean;
}

export const FixedHeader = forwardRef<HTMLDivElement, FixedHeaderProps>(
  (
    {
      children,
      className = '',
      backgroundColor = '#FFFFFF',
      withShadow = false,
      transparent = false,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          fixed top-0 left-0 right-0
          z-40
          ${withShadow ? 'shadow-sm' : ''}
          ${className}
        `}
        style={{
          backgroundColor: transparent ? 'transparent' : backgroundColor,
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        {children}
      </div>
    );
  }
);

FixedHeader.displayName = 'FixedHeader';

/**
 * Content area that accounts for fixed header and bottom bar
 */
export interface ScrollContentProps {
  children: React.ReactNode;
  className?: string;
  headerHeight?: number;
  bottomBarHeight?: number;
}

export const ScrollContent = forwardRef<HTMLDivElement, ScrollContentProps>(
  (
    {
      children,
      className = '',
      headerHeight = 64,
      bottomBarHeight = 80,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          overflow-y-auto
          ${className}
        `}
        style={{
          marginTop: `calc(${headerHeight}px + env(safe-area-inset-top, 0px))`,
          marginBottom: `calc(${bottomBarHeight}px + env(safe-area-inset-bottom, 0px))`,
          height: `calc(100dvh - ${headerHeight}px - ${bottomBarHeight}px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))`,
        }}
      >
        {children}
      </div>
    );
  }
);

ScrollContent.displayName = 'ScrollContent';

/**
 * Hook to get safe area insets as CSS values
 */
export function useSafeAreaInsets() {
  return {
    top: 'env(safe-area-inset-top, 0px)',
    bottom: 'env(safe-area-inset-bottom, 0px)',
    left: 'env(safe-area-inset-left, 0px)',
    right: 'env(safe-area-inset-right, 0px)',
  };
}

/**
 * Global styles for safe area support
 * Include this in your root layout
 */
export const SafeAreaStyles = () => (
  <style jsx global>{`
    @supports (padding: env(safe-area-inset-top)) {
      .safe-area-container {
        /* Uses CSS env() variables directly */
      }
    }

    /* Ensure full viewport coverage */
    html,
    body {
      height: 100%;
      overscroll-behavior: none;
    }

    /* Support for dynamic viewport units */
    @supports (height: 100dvh) {
      .safe-area-view {
        min-height: 100dvh;
      }
    }

    /* Fallback for older browsers */
    @supports not (height: 100dvh) {
      .safe-area-view {
        min-height: 100vh;
      }
    }

    /* Prevent content from being hidden by notch */
    .notch-aware {
      padding-left: max(16px, env(safe-area-inset-left));
      padding-right: max(16px, env(safe-area-inset-right));
    }
  `}</style>
);

export default SafeArea;
