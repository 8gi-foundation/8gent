/**
 * Card Component for 8gent Jr
 *
 * Versatile card component with glassmorphism support,
 * clear visual hierarchy, and accessible design.
 */

'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CardProps, CardVariant } from '@/types/ui';

// Variant styles
const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-xl shadow-gray-200/50 border border-gray-100',
  outlined: 'bg-white border-2 border-gray-300',
  glass:
    'bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg shadow-gray-200/30',
};

// Padding styles
const paddingStyles = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

// Touch feedback animation
const touchAnimation = {
  tap: { scale: 0.98 },
  hover: { scale: 1.01 },
};

// Selection animation
const selectionAnimation = {
  initial: { borderColor: 'transparent' },
  selected: { borderColor: '#3B82F6' },
};

/**
 * Card component with multiple variants
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      interactive = false,
      selected = false,
      onClick,
      padding = 'md',
      children,
      className = '',
      style,
      testId,
      ...props
    },
    ref
  ) => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const baseClasses = [
      'rounded-2xl',
      'overflow-hidden',
      variantStyles[variant],
      paddingStyles[padding],
      interactive
        ? 'cursor-pointer transition-all duration-200 hover:shadow-lg'
        : '',
      selected ? 'ring-2 ring-blue-500 ring-offset-2' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Use motion.div for interactive cards unless reduced motion
    if (interactive && !prefersReducedMotion) {
      return (
        <motion.div
          ref={ref}
          className={baseClasses}
          style={style}
          onClick={onClick}
          data-testid={testId}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          whileTap={touchAnimation.tap}
          whileHover={touchAnimation.hover}
          onKeyDown={(e) => {
            if (onClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onClick();
            }
          }}
          aria-pressed={selected}
          {...(props as any)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={baseClasses}
        style={style}
        onClick={onClick}
        data-testid={testId}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        aria-pressed={selected}
        {...(props as any)}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header component
 */
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ children, className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`px-4 py-3 border-b border-gray-100 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

/**
 * Card Body component
 */
export const CardBody = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={`p-4 ${className}`} {...props}>
    {children}
  </div>
));
CardBody.displayName = 'CardBody';

/**
 * Card Footer component
 */
export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { className?: string }
>(({ children, className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`px-4 py-3 border-t border-gray-100 bg-gray-50/50 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';

/**
 * AAC Card - Specialized card for AAC communication board
 */
export interface AACCardDisplayProps {
  emoji?: string;
  imageUrl?: string;
  label: string;
  backgroundColor: string;
  textColor: string;
  selected?: boolean;
  onSelect?: () => void;
  size?: 'sm' | 'md' | 'lg';
  isSafety?: boolean;
}

const aacSizes = {
  sm: 'w-20 h-20 text-2xl',
  md: 'w-24 h-24 text-3xl',
  lg: 'w-28 h-28 text-4xl',
};

const labelSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const AACCardDisplay = forwardRef<HTMLDivElement, AACCardDisplayProps>(
  (
    {
      emoji,
      imageUrl,
      label,
      backgroundColor,
      textColor,
      selected = false,
      onSelect,
      size = 'md',
      isSafety = false,
    },
    ref
  ) => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cardClasses = [
      'flex flex-col items-center justify-center',
      'rounded-2xl',
      'transition-all duration-200',
      'cursor-pointer',
      'select-none',
      'min-w-[44px] min-h-[44px]', // Minimum touch target
      aacSizes[size],
      selected ? 'ring-4 ring-blue-500 ring-offset-2 scale-105' : '',
      isSafety ? 'animate-pulse-subtle' : '',
    ].join(' ');

    const content = (
      <>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="w-12 h-12 object-contain"
          />
        ) : emoji ? (
          <span className="leading-none">{emoji}</span>
        ) : null}
        <span
          className={`font-semibold mt-1 text-center leading-tight ${labelSizes[size]}`}
          style={{ color: textColor }}
        >
          {label}
        </span>
      </>
    );

    if (!prefersReducedMotion) {
      return (
        <motion.div
          ref={ref}
          className={cardClasses}
          style={{ backgroundColor }}
          onClick={onSelect}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onSelect();
            }
          }}
          aria-pressed={selected}
          aria-label={`Select ${label}`}
        >
          {content}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cardClasses}
        style={{ backgroundColor }}
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onSelect();
          }
        }}
        aria-pressed={selected}
        aria-label={`Select ${label}`}
      >
        {content}
      </div>
    );
  }
);

AACCardDisplay.displayName = 'AACCardDisplay';

export default Card;
