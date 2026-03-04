/**
 * @fileoverview Category Navigation Component
 *
 * The CategoryNav provides horizontal scrolling navigation between AAC card
 * categories. Categories are displayed as colored pills/buttons with icons.
 *
 * Features:
 * - Horizontal scroll with snap points
 * - Visual indication of active category
 * - Swipe gesture support
 * - Category reordering (in edit mode)
 * - Accessibility labels for screen readers
 *
 * @module components/aac/CategoryNav
 */

import React from 'react';
import type { AACCategory } from '@/types/aac';

/**
 * Props for the CategoryNav component
 */
export interface CategoryNavProps {
  /** Array of available categories */
  categories: AACCategory[];

  /** Currently active category ID */
  activeCategoryId: string;

  /** Callback when a category is selected */
  onCategoryChange: (categoryId: string) => void;

  /** Whether the navigation is in edit mode */
  isEditing?: boolean;

  /** Callback to reorder categories (edit mode) */
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

/**
 * Category Navigation Component
 *
 * @example
 * ```tsx
 * <CategoryNav
 *   categories={categories}
 *   activeCategoryId="emotions"
 *   onCategoryChange={handleCategoryChange}
 * />
 * ```
 */
export function CategoryNav({
  categories,
  activeCategoryId,
  onCategoryChange,
  isEditing = false,
  onReorder,
}: CategoryNavProps): React.ReactElement {
  // TODO: Implement horizontal scroll with CSS scroll-snap
  // TODO: Add swipe gesture handling
  // TODO: Implement drag-to-reorder in edit mode
  // TODO: Add keyboard navigation support

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <nav
      className="category-nav"
      role="tablist"
      aria-label="Card categories"
      style={{
        display: 'flex',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        gap: 8,
        padding: '8px 16px',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {sortedCategories.map((category) => {
        const isActive = category.id === activeCategoryId;

        return (
          <button
            key={category.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${category.id}`}
            onClick={() => onCategoryChange(category.id)}
            className={`category-pill ${isActive ? 'active' : ''}`}
            style={{
              scrollSnapAlign: 'start',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              backgroundColor: isActive ? category.color : '#f0f0f0',
              color: isActive ? '#ffffff' : '#333333',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span className="category-icon" aria-hidden="true">
              {category.icon}
            </span>
            <span className="category-name">{category.name}</span>

            {/* Edit handle for drag reordering */}
            {isEditing && (
              <span className="drag-handle" aria-hidden="true">
                ⋮⋮
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default CategoryNav;
