---
name: Oja Certified Fresh
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#41493e'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#717a6d'
  outline-variant: '#c0c9bb'
  surface-tint: '#2e6b2f'
  primary: '#002c06'
  on-primary: '#ffffff'
  primary-container: '#00450d'
  on-primary-container: '#74b46e'
  inverse-primary: '#95d78e'
  secondary: '#8f4e00'
  on-secondary: '#ffffff'
  secondary-container: '#fea85a'
  on-secondary-container: '#733d00'
  tertiary: '#002c06'
  on-tertiary: '#ffffff'
  tertiary-container: '#00450e'
  on-tertiary-container: '#66b664'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f3a7'
  primary-fixed-dim: '#95d78e'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#135219'
  secondary-fixed: '#ffdcc2'
  secondary-fixed-dim: '#ffb77a'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#6d3a00'
  tertiary-fixed: '#a3f69c'
  tertiary-fixed-dim: '#88d983'
  on-tertiary-fixed: '#002204'
  on-tertiary-fixed-variant: '#005312'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  success-green: '#2a6b2c'
  warning-amber: '#ff8f00'
  error-red: '#ba1a1a'
  outline-muted: '#c0c9bb'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  base: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  container-margin: 20px
---

## Brand & Style
Oja is a premium agricultural marketplace focused on "Certified Freshness," transparency, and trust. The brand personality is professional yet organic, bridging the gap between high-tech logistics and traditional farming. 

The design style is **Corporate / Modern** with a focus on hygiene and clarity. It utilizes a clean, airy aesthetic with ample white space, high-quality food photography, and a systematic green-centric palette. The visual language emphasizes "certified" status through badges and status indicators, evoking a sense of pharmaceutical-grade precision applied to fresh produce.

## Colors
The palette is rooted in a deep "Forest Green" (#00450d) which represents authority and the earth. This is supported by a "Heritage Orange" (#8f4e00) used sparingly for calls to action and secondary highlights, creating a natural harvest-inspired contrast. 

Backgrounds utilize a very light grey (#f9f9f9) to maintain a sterile, clean environment that allows the vibrant colors of the produce to pop. Feedback colors like "Warning Amber" are used specifically for certification badges and urgency (e.g., "Harvested 2h ago").

## Typography
The system uses a pairing of **Manrope** for headlines and **Be Vietnam Pro** for body and UI labels. 

- **Manrope** provides a geometric, modern structure for high-level branding and section headers, with heavy weights (700-800) used to establish a bold presence.
- **Be Vietnam Pro** offers high legibility and a friendly, contemporary feel for product descriptions and functional labels. 
- Tight letter-spacing is applied to large display text to maintain a premium, editorial look.

## Layout & Spacing
The layout follows a **Fluid Grid** approach with a maximum container width of 1280px for desktop. For mobile, it utilizes a 16px gutter (side margin). 

Spacing is based on an 8px base unit. Vertical rhythm is established through consistent `xl` (32px) gaps between major sections and `md` (16px) gaps between section headers and content. Horizontal scrolling "shelf" layouts are preferred for categories and featured picks to maximize content density without overwhelming the user vertically.

## Elevation & Depth
Depth is conveyed through a combination of **Tonal Layers** and **Ambient Shadows**:

- **Surfaces:** The primary background is neutral (#f9f9f9). Interactive cards and containers use white (#ffffff) to lift them off the background.
- **Shadows:** A very soft, diffused shadow (`0 4px 12px 0 rgba(0, 0, 0, 0.04)`) is used for product cards to suggest a subtle lift without appearing heavy.
- **Outlines:** Low-contrast borders (#c0c9bb at 10-20% opacity) define the boundaries of white elements on white backgrounds, maintaining a clean, structured look.
- **Backdrop Blurs:** Used sparingly on top of imagery (e.g., "Harvested" tags) with a semi-transparent surface (#ffffff/90) to ensure legibility.

## Shapes
Oja uses a **Rounded** shape language to appear approachable and organic. 

- **Cards & Banners:** 0.75rem (rounded-xl) to 1rem (rounded-2xl) radius.
- **Buttons & Chips:** Full pill-shaping (9999px) for primary actions and category filters to emphasize touchability.
- **Input Fields:** 0.75rem (rounded-xl) to match card styles.
- **Images:** Internal images within cards should inherit the card's top-level roundedness or use `rounded-lg` (0.5rem) when nested.

## Components

- **Buttons:** Primary buttons are pill-shaped, using the Forest Green background with white text. Icon-only buttons for "Add to Cart" are circular, high-contrast, and provide haptic/visual feedback (scale down on click).
- **Chips/Filters:** Categorization chips use a high-contrast state (Green background) for active items and a "ghost" state (White background with thin border) for inactive items.
- **Product Cards:** Must include a high-aspect-ratio image, a bold price tag in the primary color, and clear "Certified" badging. Hover effects on desktop should include a subtle image zoom.
- **Status Badges:** Use "Secondary Container" (Amber) for trust-based certifications and "Primary" (Green) for logistics-based status (e.g., "Handled by Oja").
- **Search Bar:** A prominent, centrally located input with a fixed height (~56px), rounded-xl corners, and a subtle interior icon.
- **Bottom Navigation:** A fixed bar with clear icon labels. The active state is indicated by a tonal background pill around the entire icon/label group.