---
slug: hero-split-slider
date: 2026-11-05
status: complete
---

# Quick Task Summary: hero-split-slider

## What was built
Successfully integrated the **Day/Night Split Wipe Slider** and **4K Macro Timber Inspector** into FurniNest's homepage component (`FurniNest/frontend/src/app/pages/home/home.component.ts`) following the approved Variant B sketch specifications.

## Key Features Implemented
1. **Interactive Draggable Split Slider:**
   * Uses Angular 21 reactive signals (`splitPercent = signal<number>(52)`, `isDragging`).
   * Pointer and touch event handlers (`onSliderStart`, `onSliderMove`, `onSliderEnd`) with bounded clamping (15% - 85%).
   * Day Layer (Natural Daylight: 12:00 PM) on left side; Night Layer (Warm Hearth Glow: 10:30 PM) on right side with dynamic `clip-path` and screen-blended ambient radial glow.
2. **Floating Hero Glassmorphic Card:**
   * Clean Danish heritage pill, Playfair Display heading for "Sora Mid-Century Lounge Chair", live price (₹9,499), and CTA buttons.
3. **Bottom Timber Material Dock & 4K Grain Modal:**
   * Fast finish switcher supporting Solid American White Oak, American Black Walnut, and Heritage Reclaimed Teak.
   * "🔍 Inspect 4K Grain" button opens an interactive modal with 2x zoom on hover, Janka hardness scale, timber origin, and 100% FSC Chain-of-Custody verification badge.

## Verification
* **Angular Build:** `npx ng build --no-progress` completed in 12.95s with zero errors. All chunks generated cleanly.
