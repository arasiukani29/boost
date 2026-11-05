# Quick Task Plan: hero-split-slider

## Goal
Implement the Day/Night Split Wipe Slider hero section and 4K Macro Timber Inspector into FurniNest's Angular 21 homepage component (`home.component.ts`), matching the approved Variant B sketch design.

## Target Files
* `FurniNest/frontend/src/app/pages/home/home.component.ts`

## Requirements
1. **Interactive Day/Night Split Slider:**
   * Draggable split divider with pointer/mouse and touch support.
   * `splitPercent` tracked using Angular signals (`signal<number>(55)`).
   * Day Layer (Natural Daylight: 12:00 PM) on left; Night Layer (Warm Hearth Glow: 10:30 PM with clip-path and amber radial glow) on right.
   * Smooth clamping between 15% and 85%.
2. **Floating Hero Glassmorphic Card:**
   * Piece title ("Sora Mid-Century Lounge Chair"), heritage badge, price (₹9,499), and CTA buttons to explore or add piece.
3. **Bottom Material Dock & 4K Macro Inspector Modal:**
   * Three selectable timber finishes: Solid American White Oak, American Black Walnut, and Heritage Reclaimed Teak.
   * "🔍 Inspect 4K Macro Grain" button triggers full-screen modal with 2x zoom-on-hover, Janka hardness scale, wood origin, and FSC certification badge.
4. **Preserve Existing Functionality:**
   * Keep Categories Grid ("Shop by Space"), Featured Creations ("Handcrafted Originals"), and Value Pillars intact.
   * Maintain zero TypeScript or Angular build regressions.

## Tasks
- [ ] Task 1: Add timber finish data interface and state signals to `HomeComponent`.
- [ ] Task 2: Implement pointer drag handlers (`onSliderMove`, `startDragging`, `stopDragging`) and modal toggles with touch support.
- [ ] Task 3: Replace old hero HTML template with the Split Wipe Slider and Macro Grain Inspector modal.
- [ ] Task 4: Add high-fidelity CSS styling according to `furninest-hero-split-slider` tokens.
- [ ] Task 5: Verify build using Angular CLI (`npm run build` or type-check).

