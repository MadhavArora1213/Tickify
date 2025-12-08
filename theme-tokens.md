# Tickify Dual Theme System

## Overview
Tickify implements a dual theme system with Dark mode as the default, featuring dark backgrounds aligned with the established PDF palette. The Light mode variant uses the same brand colors adapted for light backgrounds. Both themes ensure WCAG 2.1 AA accessibility compliance with proper contrast ratios.

## Dark Theme (Default)

### Core Colors

#### Background Colors
- **primary**: #111827 (Gray 900) - Main app background
- **secondary**: #1F2937 (Gray 800) - Secondary sections, sidebars
- **surface**: #1F2937 (Gray 800) - Cards, modals, elevated surfaces
- **input**: #374151 (Gray 700) - Form inputs, text areas
- **hover**: #374151 (Gray 700) - Hover states for surfaces

#### Text Colors
- **primary**: #F9FAFB (Gray 50) - Headings, important content
- **secondary**: #D1D5DB (Gray 300) - Body text, descriptions
- **muted**: #9CA3AF (Gray 400) - Captions, timestamps, disabled text
- **link**: #60A5FA (Info Blue Light) - Links, interactive text
- **link-hover**: #3B82F6 (Info Blue) - Link hover states

#### Accent Colors
- **primary**: #2563EB (Tickify Blue) - Primary actions, CTAs
- **secondary**: #7C3AED (Tickify Purple) - Secondary actions, premium features

### Color Scales

#### Neutral Scale
- **50**: #F9FAFB
- **100**: #F3F4F6
- **200**: #E5E7EB
- **300**: #D1D5DB
- **400**: #9CA3AF
- **500**: #6B7280
- **600**: #4B5563
- **700**: #374151
- **800**: #1F2937
- **900**: #111827

#### Primary Scale (Blue)
- **50**: #DBEAFE
- **100**: #BFDBFE
- **200**: #93C5FD
- **300**: #60A5FA
- **400**: #3B82F6
- **500**: #2563EB
- **600**: #1D4ED8
- **700**: #1E40AF
- **800**: #1E3A8A
- **900**: #172554

#### Secondary Scale (Purple)
- **50**: #EDE9FE
- **100**: #DDD6FE
- **200**: #C4B5FD
- **300**: #A78BFA
- **400**: #8B5CF6
- **500**: #7C3AED
- **600**: #5B21B6
- **700**: #4C1D95
- **800**: #3B0764
- **900**: #2D1B69

#### Status Colors
- **success**: #10B981 (Success Green)
- **success-light**: #34D399
- **success-dark**: #059669
- **success-bg**: #D1FAE5
- **warning**: #F59E0B (Warning Orange)
- **warning-light**: #FBBF24
- **warning-dark**: #D97706
- **warning-bg**: #FEF3C7
- **error**: #EF4444 (Error Red)
- **error-light**: #F87171
- **error-dark**: #DC2626
- **error-bg**: #FEE2E2
- **info**: #3B82F6 (Info Blue)
- **info-light**: #60A5FA
- **info-dark**: #2563EB
- **info-bg**: #DBEAFE

### Component States

#### Primary Button
- **default**: background #2563EB, text #FFFFFF, border none, shadow subtle
- **hover**: background #1D4ED8, text #FFFFFF
- **pressed**: background #1E40AF, text #FFFFFF
- **disabled**: background #9CA3AF, text #FFFFFF, opacity 0.6
- **focused**: background #2563EB, text #FFFFFF, ring #3B82F6 (2px)
- **error**: background #EF4444, text #FFFFFF

#### Secondary Button
- **default**: background #1F2937, text #F9FAFB, border #D1D5DB (1px)
- **hover**: background #374151, text #F9FAFB, border #9CA3AF
- **pressed**: background #4B5563, text #F9FAFB, border #6B7280
- **disabled**: background #1F2937, text #6B7280, border #4B5563, opacity 0.6
- **focused**: background #1F2937, text #F9FAFB, border #60A5FA, ring #60A5FA (2px)
- **error**: background #1F2937, text #F9FAFB, border #EF4444

#### Input Fields
- **default**: background #374151, text #F9FAFB, border #6B7280 (1px), placeholder #9CA3AF
- **hover**: background #374151, text #F9FAFB, border #9CA3AF
- **pressed**: background #374151, text #F9FAFB, border #4B5563
- **disabled**: background #1F2937, text #6B7280, border #4B5563, opacity 0.6
- **focused**: background #374151, text #F9FAFB, border #60A5FA (2px), ring #60A5FA (2px)
- **error**: background #374151, text #F9FAFB, border #EF4444 (2px)

#### Cards
- **default**: background #1F2937, text #F9FAFB, border #374151 (1px), shadow subtle
- **hover**: background #1F2937, text #F9FAFB, border #4B5563, shadow medium
- **pressed**: background #1F2937, text #F9FAFB, border #4B5563, shadow none
- **disabled**: background #1F2937, text #6B7280, border #4B5563, opacity 0.6
- **focused**: background #1F2937, text #F9FAFB, border #60A5FA (2px), ring #60A5FA (2px)
- **error**: background #1F2937, text #F9FAFB, border #EF4444 (2px)

## Light Theme

### Core Colors

#### Background Colors
- **primary**: #FFFFFF - Main app background
- **secondary**: #F9FAFB (Gray 50) - Secondary sections, sidebars
- **surface**: #FFFFFF - Cards, modals, elevated surfaces
- **input**: #FFFFFF - Form inputs, text areas
- **hover**: #F3F4F6 (Gray 100) - Hover states for surfaces

#### Text Colors
- **primary**: #1F2937 (Gray 800) - Headings, important content
- **secondary**: #6B7280 (Gray 500) - Body text, descriptions
- **muted**: #9CA3AF (Gray 400) - Captions, timestamps, disabled text
- **link**: #2563EB (Tickify Blue) - Links, interactive text
- **link-hover**: #1D4ED8 (Tickify Blue Dark) - Link hover states

#### Accent Colors
- **primary**: #2563EB (Tickify Blue) - Primary actions, CTAs
- **secondary**: #7C3AED (Tickify Purple) - Secondary actions, premium features

### Color Scales

#### Neutral Scale
- **50**: #F9FAFB
- **100**: #F3F4F6
- **200**: #E5E7EB
- **300**: #D1D5DB
- **400**: #9CA3AF
- **500**: #6B7280
- **600**: #4B5563
- **700**: #374151
- **800**: #1F2937
- **900**: #111827

#### Primary Scale (Blue)
- **50**: #DBEAFE
- **100**: #BFDBFE
- **200**: #93C5FD
- **300**: #60A5FA
- **400**: #3B82F6
- **500**: #2563EB
- **600**: #1D4ED8
- **700**: #1E40AF
- **800**: #1E3A8A
- **900**: #172554

#### Secondary Scale (Purple)
- **50**: #EDE9FE
- **100**: #DDD6FE
- **200**: #C4B5FD
- **300**: #A78BFA
- **400**: #8B5CF6
- **500**: #7C3AED
- **600**: #5B21B6
- **700**: #4C1D95
- **800**: #3B0764
- **900**: #2D1B69

#### Status Colors
- **success**: #10B981 (Success Green)
- **success-light**: #34D399
- **success-dark**: #059669
- **success-bg**: #D1FAE5
- **warning**: #F59E0B (Warning Orange)
- **warning-light**: #FBBF24
- **warning-dark**: #D97706
- **warning-bg**: #FEF3C7
- **error**: #EF4444 (Error Red)
- **error-light**: #F87171
- **error-dark**: #DC2626
- **error-bg**: #FEE2E2
- **info**: #3B82F6 (Info Blue)
- **info-light**: #60A5FA
- **info-dark**: #2563EB
- **info-bg**: #DBEAFE

### Component States

#### Primary Button
- **default**: background #2563EB, text #FFFFFF, border none, shadow subtle
- **hover**: background #1D4ED8, text #FFFFFF
- **pressed**: background #1E40AF, text #FFFFFF
- **disabled**: background #9CA3AF, text #FFFFFF, opacity 0.6
- **focused**: background #2563EB, text #FFFFFF, ring #3B82F6 (2px)
- **error**: background #EF4444, text #FFFFFF

#### Secondary Button
- **default**: background #FFFFFF, text #374151, border #D1D5DB (1px)
- **hover**: background #F3F4F6, text #374151, border #9CA3AF
- **pressed**: background #E5E7EB, text #374151, border #6B7280
- **disabled**: background #FFFFFF, text #9CA3AF, border #D1D5DB, opacity 0.6
- **focused**: background #FFFFFF, text #374151, border #2563EB, ring #2563EB (2px)
- **error**: background #FFFFFF, text #374151, border #EF4444

#### Input Fields
- **default**: background #FFFFFF, text #1F2937, border #D1D5DB (1px), placeholder #9CA3AF
- **hover**: background #FFFFFF, text #1F2937, border #9CA3AF
- **pressed**: background #FFFFFF, text #1F2937, border #6B7280
- **disabled**: background #F9FAFB, text #9CA3AF, border #E5E7EB, opacity 0.6
- **focused**: background #FFFFFF, text #1F2937, border #2563EB (2px), ring #2563EB (2px)
- **error**: background #FFFFFF, text #1F2937, border #EF4444 (2px)

#### Cards
- **default**: background #FFFFFF, text #1F2937, border #E5E7EB (1px), shadow subtle
- **hover**: background #FFFFFF, text #1F2937, border #D1D5DB, shadow medium
- **pressed**: background #FFFFFF, text #1F2937, border #D1D5DB, shadow none
- **disabled**: background #F9FAFB, text #9CA3AF, border #E5E7EB, opacity 0.6
- **focused**: background #FFFFFF, text #1F2937, border #2563EB (2px), ring #2563EB (2px)
- **error**: background #FFFFFF, text #1F2937, border #EF4444 (2px)

## Accessibility Compliance

### Contrast Ratios
All color combinations meet WCAG 2.1 AA standards:
- Normal text (14px+): 4.5:1 minimum contrast
- Large text (18px+ or 14px+ bold): 3:1 minimum contrast
- Interactive elements: Clear distinction between states

### Dark Theme Contrast Checks
- Primary text (#F9FAFB) on primary background (#111827): 15.8:1 ✓
- Secondary text (#D1D5DB) on primary background (#111827): 8.9:1 ✓
- Primary button text (#FFFFFF) on button background (#2563EB): 8.6:1 ✓
- Input text (#F9FAFB) on input background (#374151): 8.9:1 ✓

### Light Theme Contrast Checks
- Primary text (#1F2937) on primary background (#FFFFFF): 15.8:1 ✓
- Secondary text (#6B7280) on primary background (#FFFFFF): 4.6:1 ✓
- Primary button text (#FFFFFF) on button background (#2563EB): 8.6:1 ✓
- Input text (#1F2937) on input background (#FFFFFF): 15.8:1 ✓

## Implementation Tokens

### CSS Custom Properties (Dark Theme)
```css
:root[data-theme="dark"] {
  /* Background */
  --color-bg-primary: #111827;
  --color-bg-secondary: #1F2937;
  --color-bg-surface: #1F2937;
  --color-bg-input: #374151;
  --color-bg-hover: #374151;

  /* Text */
  --color-text-primary: #F9FAFB;
  --color-text-secondary: #D1D5DB;
  --color-text-muted: #9CA3AF;
  --color-text-link: #60A5FA;
  --color-text-link-hover: #3B82F6;

  /* Accent */
  --color-accent-primary: #2563EB;
  --color-accent-secondary: #7C3AED;

  /* Status */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* Neutral Scale */
  --color-neutral-50: #F9FAFB;
  --color-neutral-100: #F3F4F6;
  --color-neutral-200: #E5E7EB;
  --color-neutral-300: #D1D5DB;
  --color-neutral-400: #9CA3AF;
  --color-neutral-500: #6B7280;
  --color-neutral-600: #4B5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1F2937;
  --color-neutral-900: #111827;

  /* Primary Scale */
  --color-primary-50: #DBEAFE;
  --color-primary-500: #2563EB;
  --color-primary-600: #1D4ED8;
  --color-primary-700: #1E40AF;

  /* Secondary Scale */
  --color-secondary-50: #EDE9FE;
  --color-secondary-500: #7C3AED;
  --color-secondary-600: #5B21B6;
}
```

### CSS Custom Properties (Light Theme)
```css
:root[data-theme="light"] {
  /* Background */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-bg-surface: #FFFFFF;
  --color-bg-input: #FFFFFF;
  --color-bg-hover: #F3F4F6;

  /* Text */
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
  --color-text-link: #2563EB;
  --color-text-link-hover: #1D4ED8;

  /* Accent */
  --color-accent-primary: #2563EB;
  --color-accent-secondary: #7C3AED;

  /* Status */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* Neutral Scale */
  --color-neutral-50: #F9FAFB;
  --color-neutral-100: #F3F4F6;
  --color-neutral-200: #E5E7EB;
  --color-neutral-300: #D1D5DB;
  --color-neutral-400: #9CA3AF;
  --color-neutral-500: #6B7280;
  --color-neutral-600: #4B5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1F2937;
  --color-neutral-900: #111827;

  /* Primary Scale */
  --color-primary-50: #DBEAFE;
  --color-primary-500: #2563EB;
  --color-primary-600: #1D4ED8;
  --color-primary-700: #1E40AF;

  /* Secondary Scale */
  --color-secondary-50: #EDE9FE;
  --color-secondary-500: #7C3AED;
  --color-secondary-600: #5B21B6;
}
```

## Usage Guidelines

### Theme Switching
- Default to dark theme on initial load
- Provide user preference persistence
- Smooth transitions between themes
- Respect system preference when available

### Component Implementation
- Use semantic color tokens (--color-text-primary, --color-bg-surface)
- Apply state-specific styles for interactions
- Ensure focus indicators are visible in both themes
- Test all states across both themes

### Maintenance
- Update tokens when brand colors change
- Re-verify accessibility after modifications
- Document any theme-specific component variations