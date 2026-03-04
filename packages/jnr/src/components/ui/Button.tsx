/**
 * Button Component for 8gent Jr
 *
 * Mobile-first button with 44pt+ touch targets, child-friendly colors,
 * and accessible design.
 */

'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ButtonProps, ButtonVariant, ButtonSize } from '@/types/ui';

// Variant styles
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30',
  secondary:
    'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30',
  success:
    'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30',
};

// Size styles - minimum 44px touch target
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-[44px] px-4 text-sm rounded-xl',
  md: 'min-h-[48px] px-6 text-base rounded-2xl',
  lg: 'min-h-[56px] px-8 text-lg rounded-2xl',
  xl: 'min-h-[64px] px-10 text-xl rounded-3xl',
};

// Icon size mapping
const iconSizes: Record<ButtonSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
};

// Touch feedback animation
const touchAnimation = {
  tap: { scale: 0.97 },
  hover: { scale: 1.02 },
};

// Spinner component for loading state
const Spinner = ({ size }: { size: ButtonSize }) => (
  <svg
    className={`animate-spin ${iconSizes[size]}`}
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Button component with mobile-first design
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      onClick,
      children,
      className = '',
      style,
      type = 'button',
      ariaLabel,
      testId,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-semibold',
      'transition-colors duration-200',
      'focus:outline-none focus:ring-4 focus:ring-blue-500/50',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'select-none',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {loading && (
          <span className="mr-2">
            <Spinner size={size} />
          </span>
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className={`mr-2 ${iconSizes[size]}`}>{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className={`ml-2 ${iconSizes[size]}`}>{icon}</span>
        )}
      </>
    );

    // Use motion.button for touch feedback unless reduced motion
    if (!prefersReducedMotion && !isDisabled) {
      return (
        <motion.button
          ref={ref}
          type={type}
          className={baseClasses}
          style={style}
          disabled={isDisabled}
          onClick={onClick}
          aria-label={ariaLabel}
          data-testid={testId}
          whileTap={touchAnimation.tap}
          whileHover={touchAnimation.hover}
          {...(props as any)}
        >
          {content}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={baseClasses}
        style={style}
        disabled={isDisabled}
        onClick={onClick}
        aria-label={ariaLabel}
        data-testid={testId}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Preset button variants for common use cases
export const PrimaryButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'variant'>
>((props, ref) => <Button ref={ref} variant="primary" {...props} />);
PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'variant'>
>((props, ref) => <Button ref={ref} variant="secondary" {...props} />);
SecondaryButton.displayName = 'SecondaryButton';

export const DangerButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'variant'>
>((props, ref) => <Button ref={ref} variant="danger" {...props} />);
DangerButton.displayName = 'DangerButton';

export const SuccessButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'variant'>
>((props, ref) => <Button ref={ref} variant="success" {...props} />);
SuccessButton.displayName = 'SuccessButton';

// Large action button (for AAC speak button, etc.)
export const ActionButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'size'>
>((props, ref) => <Button ref={ref} size="xl" {...props} />);
ActionButton.displayName = 'ActionButton';

export default Button;
