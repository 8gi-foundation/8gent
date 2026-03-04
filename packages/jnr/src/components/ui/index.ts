/**
 * @fileoverview Shared UI Components
 *
 * Reusable UI components for the 8gent Jr app:
 * - Large touch targets (minimum 44x44px)
 * - High contrast colors
 * - Consistent visual language
 * - Accessibility-first design
 *
 * All components follow iOS Human Interface Guidelines
 * and WCAG accessibility standards.
 *
 * @module components/ui
 */

// Button components
export {
  Button,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  SuccessButton,
  ActionButton,
} from './Button';

// Card components
export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  AACCardDisplay,
} from './Card';

// Grid components
export {
  Grid,
  GridItem,
  AACGrid,
  HorizontalScroll,
  Flex,
} from './Grid';

// Modal components
export {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ConfirmModal,
} from './Modal';

// SafeArea components
export {
  SafeArea,
  SafeAreaView,
  FixedBottomBar,
  FixedHeader,
  ScrollContent,
  SafeAreaStyles,
  useSafeAreaInsets,
} from './SafeArea';

// Re-export types
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  CardProps,
  CardVariant,
  GridProps,
  ModalProps,
  SafeAreaProps,
} from '@/types/ui';
