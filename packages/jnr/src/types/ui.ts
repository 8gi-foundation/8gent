/**
 * UI Component Types for 8gent Jr
 *
 * Types for mobile-first UI components
 */

import type { ReactNode, CSSProperties } from 'react';

// Base props shared by all components
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  testId?: string;
}

// Button variants and sizes
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends BaseComponentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

// Card variants
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass';

export interface CardProps extends BaseComponentProps {
  variant?: CardVariant;
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Grid configuration
export interface GridProps extends BaseComponentProps {
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
}

// Modal configuration
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  position?: 'center' | 'bottom';
}

// Safe area configuration
export interface SafeAreaProps extends BaseComponentProps {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  backgroundColor?: string;
}

// Animation variants
export interface AnimationConfig {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: object;
}

// Touch feedback
export interface TouchFeedbackConfig {
  scale?: number;
  opacity?: number;
  duration?: number;
}

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Touch target minimum sizes (in pixels)
export const TOUCH_TARGETS = {
  minimum: 44, // Apple HIG minimum
  comfortable: 48, // Comfortable touch
  large: 56, // Large touch targets
} as const;

// Color palette for children
export const CHILD_FRIENDLY_COLORS = {
  // Primary colors
  blue: '#60A5FA',
  green: '#34D399',
  yellow: '#FBBF24',
  orange: '#FB923C',
  red: '#EF4444',
  amber: '#F59E0B',
  coral: '#F97316',

  // Neutrals
  white: '#FFFFFF',
  lightGray: '#F3F4F6',
  gray: '#9CA3AF',
  darkGray: '#4B5563',
  black: '#1F2937',

  // Semantic
  success: '#34D399',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#60A5FA',
} as const;
