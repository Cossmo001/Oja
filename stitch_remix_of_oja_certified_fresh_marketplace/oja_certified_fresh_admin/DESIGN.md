---
name: Oja Certified Fresh Admin
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#41493e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#717a6d'
  outline-variant: '#c0c9bb'
  surface-tint: '#2e6b2f'
  primary: '#002c06'
  on-primary: '#ffffff'
  primary-container: '#00450d'
  on-primary-container: '#74b46e'
  inverse-primary: '#95d78e'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#0b0088'
  on-tertiary: '#ffffff'
  tertiary-container: '#1f1ab3'
  on-tertiary-container: '#989bff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f3a7'
  primary-fixed-dim: '#95d78e'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#135219'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-lg:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  headline-md-mobile:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 24px
  gutter: 16px
  sidebar-width: 260px
---

## Brand & Style

The design system for the admin dashboard prioritizes clarity, efficiency, and professional rigor while maintaining the organic roots of the brand. The visual narrative shifts from consumer-facing warmth to a sophisticated **Corporate Modern** aesthetic. It is designed for operational experts who require high-density information without cognitive fatigue.

The emotional response should be one of "Controlled Vitality"—the interface feels alive and fresh through the signature forest green, but remains grounded and reliable through structured layouts and a restrained neutral palette. Every element is calibrated for precision, using subtle depth and clear boundaries to organize complex data streams into actionable insights.

## Colors

The color architecture is anchored by the signature **Forest Green** (#00450D), utilized primarily for high-level brand touchpoints, primary actions, and sidebar navigation to maintain brand equity. 

The "Admin Palette" introduces a layered neutral system. The primary background uses `surface-container-low` (#F8FAFC) to reduce glare, while white (#FFFFFF) is reserved for interactive cards and data containers to create a "lifted" effect. For data visualization, a vibrant secondary palette of Teal, Indigo, and Lime provides high contrast against the forest green, ensuring complex charts remain legible and distinct. Status colors follow a standardized semantic pattern to ensure immediate recognition of operational health.

## Typography

The typography system uses **Manrope** exclusively, leveraging its modern, semi-condensed geometric structure to handle dense data environments. 

Headlines use heavier weights (Bold 700/800) with slight negative letter-spacing for a compact, authoritative feel. Body text is optimized for legibility at 14px (`body-md`) for standard data tables, while `label-lg` uses All-Caps with increased tracking to differentiate metadata from content. For mobile views, typography scales down to prevent horizontal overflow in data-heavy views, ensuring the hierarchy remains intact on smaller devices.

## Layout & Spacing

This design system employs a **12-column fluid grid** for the main content area, anchored by a fixed left-hand navigation sidebar. The layout logic is built on a 4px baseline grid to ensure mathematical precision in alignment.

- **Desktop:** 24px outer margins with 16px gutters.
- **Tablet:** 16px outer margins, collapsing the sidebar into an icon-only rail.
- **Mobile:** 12px outer margins, using a single-column reflow for all metric cards and data tables, with a bottom-tab or hamburger menu navigation.

Spacing is tight to accommodate high-density information, but horizontal rhythm is maintained by aligning all card content to a consistent `md` (16px) internal padding.

## Elevation & Depth

To maintain the "Admin" sophistication, depth is achieved through **Tonal Layering** combined with **Ambient Shadows**.

1.  **Level 0 (Background):** `surface-container-low` (#F8FAFC) - the base canvas.
2.  **Level 1 (Cards/Containers):** Pure White (#FFFFFF) with a "Soft-Stroke" (1px border, #E2E8F0) and a subtle, highly diffused shadow (Y: 2px, Blur: 4px, Opacity: 4%, Color: #00450D).
3.  **Level 2 (Overlays/Dropdowns):** Pure White (#FFFFFF) with a more pronounced shadow (Y: 8px, Blur: 16px, Opacity: 8%, Color: #00450D).

This approach creates clear separation between the background and interactive elements without the visual "noise" of heavy drop shadows or dark borders.

## Shapes

The "rounded-eight" philosophy is the core of the shape language. A standard radius of **8px (0.5rem)** is applied to all primary containers, buttons, and input fields. This balance provides a modern, approachable feel that isn't as "playful" as pill shapes nor as "aggressive" as sharp corners.

Larger layout sections or featured cards may use `rounded-lg` (16px) to signify a higher level of importance or a "container-within-a-container" hierarchy. Smaller elements like tags or checkboxes scale down to a 4px radius to maintain visual consistency at smaller scales.

## Components

### Buttons
Primary buttons use the Forest Green background with white text. Secondary buttons use a transparent background with a 1px Forest Green border. Ghost buttons are reserved for utility actions like "Cancel" or "Clear Filter."

### Metric Cards
The foundational element for dashboards. These features a `title-md` label, a `headline-lg` value, and a small `label-md` trend indicator (using semantic green/red for +/-).

### Data Tables
Tables are high-density. Rows are 48px high with a subtle bottom border (#F1F5F9). Headers use `label-lg` with a light grey background (#F8FAFC) to distinguish them from data rows.

### Chips & Tags
Used for status and filtering. They use a light tinted background of the semantic color (e.g., 10% opacity Success Green) with high-contrast text for accessibility.

### Input Fields
Fields use a 1px border (#CBD5E1) and an 8px corner radius. On focus, the border shifts to Forest Green with a subtle 2px outer glow. Labels are positioned above the field using `label-lg`.

### Navigation Sidebar
The sidebar uses a dark-mode variant of Forest Green to ground the interface. Active states are indicated by a high-contrast Lime vertical bar on the left edge and a subtle background highlight.