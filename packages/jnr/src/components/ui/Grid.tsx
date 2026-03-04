/**
 * Grid Component for 8gent Jr
 *
 * Responsive grid that adapts to mobile, tablet, and desktop screens.
 * Optimized for AAC card layouts with proper spacing.
 */

'use client';

import { forwardRef, type HTMLAttributes, useMemo } from 'react';
import type { GridProps } from '@/types/ui';

// Default column configurations for different screens
const DEFAULT_COLUMNS = {
  mobile: 3,
  tablet: 4,
  desktop: 6,
};

// Gap sizes in tailwind classes
const gapStyles = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
};

// Alignment styles
const alignStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyStyles = {
  start: 'justify-items-start',
  center: 'justify-items-center',
  end: 'justify-items-end',
  stretch: 'justify-items-stretch',
};

/**
 * Responsive Grid component
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      columns = DEFAULT_COLUMNS,
      gap = 'md',
      alignItems = 'stretch',
      justifyItems = 'center',
      children,
      className = '',
      style,
      testId,
      ...props
    },
    ref
  ) => {
    // Merge provided columns with defaults
    const mergedColumns = useMemo(
      () => ({
        mobile: columns?.mobile ?? DEFAULT_COLUMNS.mobile,
        tablet: columns?.tablet ?? DEFAULT_COLUMNS.tablet,
        desktop: columns?.desktop ?? DEFAULT_COLUMNS.desktop,
      }),
      [columns]
    );

    // Generate responsive grid-template-columns CSS
    const gridStyle = useMemo(
      () => ({
        ...style,
        display: 'grid',
        gridTemplateColumns: `repeat(var(--grid-cols), minmax(0, 1fr))`,
        '--grid-cols': mergedColumns.mobile,
      }),
      [style, mergedColumns]
    );

    const baseClasses = [
      gapStyles[gap],
      alignStyles[alignItems],
      justifyStyles[justifyItems],
      // Responsive column classes using CSS custom properties
      'grid-responsive',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <>
        {/* Inject responsive styles */}
        <style jsx global>{`
          .grid-responsive {
            --grid-cols: ${mergedColumns.mobile};
          }
          @media (min-width: 768px) {
            .grid-responsive {
              --grid-cols: ${mergedColumns.tablet};
            }
          }
          @media (min-width: 1024px) {
            .grid-responsive {
              --grid-cols: ${mergedColumns.desktop};
            }
          }
        `}</style>
        <div
          ref={ref}
          className={baseClasses}
          style={gridStyle}
          data-testid={testId}
          {...(props as HTMLAttributes<HTMLDivElement>)}
        >
          {children}
        </div>
      </>
    );
  }
);

Grid.displayName = 'Grid';

/**
 * Grid Item component for explicit grid positioning
 */
export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  colSpan?: number;
  rowSpan?: number;
  className?: string;
}

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ colSpan = 1, rowSpan = 1, children, className = '', style, ...props }, ref) => {
    const itemStyle = useMemo(
      () => ({
        ...style,
        gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined,
        gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
      }),
      [style, colSpan, rowSpan]
    );

    return (
      <div ref={ref} className={className} style={itemStyle} {...props}>
        {children}
      </div>
    );
  }
);

GridItem.displayName = 'GridItem';

/**
 * AAC Grid - Pre-configured grid for AAC boards
 * Uses optimal columns for AAC card layouts
 */
export interface AACGridProps {
  children: React.ReactNode;
  className?: string;
  testId?: string;
}

export const AACGrid = forwardRef<HTMLDivElement, AACGridProps>(
  ({ children, className = '', testId }, ref) => (
    <Grid
      ref={ref}
      columns={{
        mobile: 3,
        tablet: 4,
        desktop: 6,
      }}
      gap="md"
      alignItems="stretch"
      justifyItems="center"
      className={className}
      testId={testId}
    >
      {children}
    </Grid>
  )
);

AACGrid.displayName = 'AACGrid';

/**
 * Horizontal scroll container for category tabs
 */
export interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  showScrollHint?: boolean;
}

export const HorizontalScroll = forwardRef<HTMLDivElement, HorizontalScrollProps>(
  ({ children, className = '', showScrollHint = true }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          flex overflow-x-auto
          scrollbar-hide
          snap-x snap-mandatory
          -mx-4 px-4
          ${showScrollHint ? 'scroll-hint' : ''}
          ${className}
        `}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scroll-hint::after {
            content: '';
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 48px;
            background: linear-gradient(
              to right,
              transparent,
              rgba(255, 255, 255, 0.9)
            );
            pointer-events: none;
          }
        `}</style>
        {children}
      </div>
    );
  }
);

HorizontalScroll.displayName = 'HorizontalScroll';

/**
 * Flex container for simple layouts
 */
export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
  className?: string;
}

const flexDirections = {
  row: 'flex-row',
  column: 'flex-col',
};

const flexAlignments = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const flexJustify = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      direction = 'row',
      align = 'center',
      justify = 'start',
      gap = 'md',
      wrap = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const classes = [
      'flex',
      flexDirections[direction],
      flexAlignments[align],
      flexJustify[justify],
      gapStyles[gap],
      wrap ? 'flex-wrap' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';

export default Grid;
