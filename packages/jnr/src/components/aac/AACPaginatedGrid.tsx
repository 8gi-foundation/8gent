'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, type PanInfo, useReducedMotion } from 'framer-motion';

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// Spring config for page transitions
const springConfig = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

export interface AACPaginatedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  /** Number of columns (default: 3, drops to 3 on narrow screens) */
  columns?: number;
  /** Rows per page override (default: auto-fit from container height) */
  rowsPerPage?: number;
  /** Gap between items in px (default: 10) */
  gap?: number;
  /** Padding inside grid in px (default: 12) */
  padding?: number;
  /** Show page dot indicators (default: true) */
  showIndicators?: boolean;
  /** Optional className on outer container */
  className?: string;
  /** Called when page changes */
  onPageChange?: (page: number, totalPages: number) => void;
}

export function AACPaginatedGrid<T>({
  items,
  renderItem,
  keyExtractor,
  columns = 3,
  rowsPerPage: customRowsPerPage,
  gap = 10,
  padding = 12,
  showIndicators = true,
  className,
  onPageChange,
}: AACPaginatedGridProps<T>) {
  const [currentPage, setCurrentPage] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [effectiveColumns, setEffectiveColumns] = useState(columns);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Responsive columns: 3 on narrow, prop value on wider
  useEffect(() => {
    const update = () => {
      setEffectiveColumns(window.innerWidth <= 480 ? 3 : columns);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [columns]);

  // Track container height for auto row calculation
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    update();
    const observer = new ResizeObserver(update);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Items per page based on available space
  const itemsPerPage = useMemo(() => {
    if (customRowsPerPage) return effectiveColumns * customRowsPerPage;

    const containerWidth = containerRef.current?.clientWidth || 320;
    const availableWidth = containerWidth - padding * 2 - gap * (effectiveColumns - 1);
    const cardWidth = availableWidth / effectiveColumns;
    const cardHeight = cardWidth * 1.1;
    const availableHeight = containerHeight - padding * 2;
    const rows = Math.max(1, Math.floor((availableHeight + gap) / (cardHeight + gap)));
    return effectiveColumns * rows;
  }, [containerHeight, effectiveColumns, customRowsPerPage, gap, padding]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const pageItems = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  // Keep page in bounds when items or page size changes
  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      setCurrentPage(totalPages - 1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    onPageChange?.(currentPage, totalPages);
  }, [currentPage, totalPages, onPageChange]);

  const goToPage = useCallback(
    (page: number) => setCurrentPage(Math.max(0, Math.min(page, totalPages - 1))),
    [totalPages]
  );
  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1) setCurrentPage((p) => p + 1);
  }, [currentPage, totalPages]);
  const prevPage = useCallback(() => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  }, [currentPage]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x < -50 || info.velocity.x < -0.5) nextPage();
      else if (info.offset.x > 50 || info.velocity.x > 0.5) prevPage();
    },
    [nextPage, prevPage]
  );

  return (
    <div className={`flex flex-col h-full${className ? ` ${className}` : ''}`}>
      {/* Swipeable grid area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <motion.div
          className="absolute inset-0"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ touchAction: 'pan-y' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPage}
              initial={prefersReducedMotion ? undefined : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, x: -40 }}
              transition={springConfig}
              className="h-full"
              style={{ padding }}
            >
              <div
                className="grid h-full"
                style={{
                  gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`,
                  gap,
                }}
              >
                {pageItems.map((item, index) => (
                  <div key={keyExtractor(item)}>
                    {renderItem(item, currentPage * itemsPerPage + index)}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Arrow buttons - desktop only */}
        {totalPages > 1 && (
          <>
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className={[
                'hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10',
                'w-10 h-10 items-center justify-center rounded-full shadow-md',
                'backdrop-blur-sm transition-opacity',
                currentPage === 0
                  ? 'opacity-30 cursor-not-allowed'
                  : 'opacity-100',
              ].join(' ')}
              style={{ backgroundColor: 'rgba(253,252,250,0.85)', color: 'var(--warm-text-secondary, #5C544A)' }}
              aria-label="Previous page"
            >
              <ChevronLeftIcon />
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className={[
                'hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10',
                'w-10 h-10 items-center justify-center rounded-full shadow-md',
                'backdrop-blur-sm transition-opacity',
                currentPage === totalPages - 1
                  ? 'opacity-30 cursor-not-allowed'
                  : 'opacity-100',
              ].join(' ')}
              style={{ backgroundColor: 'rgba(253,252,250,0.85)', color: 'var(--warm-text-secondary, #5C544A)' }}
              aria-label="Next page"
            >
              <ChevronRightIcon />
            </button>
          </>
        )}
      </div>

      {/* Page dot indicators */}
      {showIndicators && totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 py-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className="rounded-full transition-all"
              style={{
                width: i === currentPage ? 16 : 8,
                height: 8,
                backgroundColor:
                  i === currentPage
                    ? 'var(--warm-text, #1A1614)'
                    : 'var(--warm-border, #E8E0D6)',
              }}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AACPaginatedGrid;
