/**
 * Modal Component for 8gent Jr
 *
 * Accessible modal with full-screen support on mobile,
 * centered dialog on desktop, and proper focus management.
 */

'use client';

import {
  forwardRef,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ModalProps } from '@/types/ui';

// Size styles for different modal sizes
const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full h-full',
};

// Position styles
const positionStyles = {
  center: 'items-center justify-center',
  bottom: 'items-end justify-center',
};

// Animation variants for modal
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  center: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
  },
  bottom: {
    hidden: { opacity: 0, y: '100%' },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' },
  },
};

// Close icon SVG
const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * Modal component with responsive design
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      size = 'md',
      position = 'center',
      children,
      className = '',
      style,
      testId,
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Handle escape key
    const handleEscape = useCallback(
      (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape') {
          onClose();
        }
      },
      [closeOnEscape, onClose]
    );

    // Handle overlay click
    const handleOverlayClick = useCallback(
      (event: React.MouseEvent) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose]
    );

    // Focus management
    useEffect(() => {
      if (isOpen) {
        // Store current active element
        previousActiveElement.current = document.activeElement as HTMLElement;

        // Focus the modal
        modalRef.current?.focus();

        // Add escape key listener
        document.addEventListener('keydown', handleEscape);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';

        // Restore focus to previous element
        if (!isOpen && previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }, [isOpen, handleEscape]);

    // Focus trap - trap focus within modal
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    }, []);

    const modalClasses = [
      'relative',
      'w-full',
      'bg-white',
      'rounded-2xl',
      'shadow-2xl',
      'overflow-hidden',
      // Full screen on mobile, constrained on larger screens
      'md:rounded-2xl',
      size === 'full' ? 'h-full rounded-none md:h-auto' : sizeStyles[size],
      // Bottom sheet style on mobile for 'bottom' position
      position === 'bottom' ? 'rounded-t-3xl rounded-b-none md:rounded-2xl' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <div
        ref={modalRef}
        className={modalClasses}
        style={style}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        data-testid={testId}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-bold text-gray-900"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  p-2 -m-2
                  rounded-full
                  text-gray-500 hover:text-gray-700
                  hover:bg-gray-100
                  transition-colors
                  min-w-[44px] min-h-[44px]
                  flex items-center justify-center
                "
                aria-label="Close modal"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {children}
        </div>
      </div>
    );

    return (
      <AnimatePresence>
        {isOpen && (
          <div
            ref={ref}
            className="fixed inset-0 z-50 flex"
          >
            {/* Overlay */}
            <motion.div
              className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex ${positionStyles[position]} p-4`}
              initial={prefersReducedMotion ? false : 'hidden'}
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              transition={{ duration: 0.2 }}
              onClick={handleOverlayClick}
            >
              {/* Modal Content */}
              <motion.div
                initial={prefersReducedMotion ? false : 'hidden'}
                animate="visible"
                exit="exit"
                variants={modalVariants[position]}
                transition={{
                  type: 'spring',
                  damping: 25,
                  stiffness: 300,
                }}
              >
                {content}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }
);

Modal.displayName = 'Modal';

/**
 * Modal Header component for custom headers
 */
export interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

export const ModalHeader = ({ children, className = '' }: ModalHeaderProps) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

/**
 * Modal Body component for custom content areas
 */
export interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export const ModalBody = ({ children, className = '' }: ModalBodyProps) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

/**
 * Modal Footer component for action buttons
 */
export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export const ModalFooter = ({ children, className = '' }: ModalFooterProps) => (
  <div
    className={`
      px-6 py-4
      border-t border-gray-100
      bg-gray-50/50
      flex items-center justify-end gap-3
      ${className}
    `}
  >
    {children}
  </div>
);

/**
 * Confirmation Modal - Pre-built confirmation dialog
 */
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="
            flex-1
            min-h-[44px]
            px-4
            rounded-xl
            bg-gray-100 hover:bg-gray-200
            text-gray-700
            font-semibold
            transition-colors
          "
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={`
            flex-1
            min-h-[44px]
            px-4
            rounded-xl
            font-semibold
            transition-colors
            ${
              variant === 'danger'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
          `}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default Modal;
