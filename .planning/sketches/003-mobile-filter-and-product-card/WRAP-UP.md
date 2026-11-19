# Sketch Wrap-Up: 003-mobile-filter-and-product-card

> **Status:** Finalized & Approved  
> **Selected Variant:** **Variant C (Floating Glass Dock & Dynamic Timber Swatch Switcher)**  
> **Date:** 2026-11-05  
> **Target:** FurniNest Catalog & Product Cards (`FurniNest/frontend/src/app/pages/catalog/`)

---

## 1. Executive Summary & Design Decision

During the design exploration phase of Sketch 003, three distinct mobile architectural patterns were created to solve the filter pill clutter and improve product card ergonomics:
* **Variant A (Sticky Pill Carousel & 2-Col Minimalist):** Single-row swipeable category/budget chips with column layout switcher.
* **Variant B (Bottom Sheet Drawer & Editorial Story):** Compact filter trigger with full-height modal drawer and full-width magazine cards.
* **Variant C (Floating Glass Dock & Dynamic Swatch Switcher):** Floating glassmorphic control dock pinned at the bottom for natural thumb reach, paired with cards featuring live wood finish swatches that update image tints dynamically.

**Winning Direction:** **Variant C** was approved by the user. Its one-handed thumb ergonomics and interactive timber swatches (Walnut, Oak, Charred Ebony) provide an engaging, high-end digital atelier experience on mobile devices.

---

## 2. Design Tokens & Component Specs

### 1. Floating Glass Dock (Bottom Navigation)
* **Position:** Fixed at viewport bottom (`bottom: 20px; left: 16px; right: 16px; max-width: 440px; margin: 0 auto; z-index: 400;`).
* **Visual Style:**
  ```css
  background: rgba(30, 41, 59, 0.90);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  box-shadow: 0 16px 35px -5px rgba(0, 0, 0, 0.35);
  padding: 6px 10px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  ```
* **Interactive Pills:**
  * `🛋️ Spaces` (toggles space selection popup drawer)
  * `↕️ Sort` (quick cycle sort: Newest, Price Ascending, Price Descending)
  * `🏷️ Under ₹25k` (quick budget filter toggle with active amber pill state)
  * `🛍️ Bag` (opens bag drawer with reactive counter badge)

### 2. Space Selection Popup Drawer (Dock Expansion)
* **Position:** Floating immediately above the glass dock (`bottom: calc(100% + 10px); left: 0; right: 0;`).
* **Style:**
  ```css
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.18);
  padding: 12px;
  ```
* **Chips:** All, Living Room, Bedroom, Dining Room, Home Office.

### 3. Modern Hybrid Product Card
* **Dimensions:** 2-column responsive grid on mobile screens (`repeat(2, 1fr)` with `gap: 12px;`).
* **Scarcity & Craft Badges:**
  * Low Stock: `background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; font-size: 0.62rem;`
  * Sustainable: `background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;`
* **Interactive Timber Swatches:**
  * Dot size: `12px × 12px` circle with 1px white border.
  * Walnut: `#4a2f18` -> Applies `filter: sepia(0.2) contrast(1.05);`
  * Natural Oak: `#d7af73` -> Applies `filter: brightness(1.08) saturate(1.1);`
  * Charred Ebony: `#222222` -> Applies `filter: grayscale(0.7) contrast(1.2);`
* **Micro-Actions:**
  * Wishlist button: Floating round pill with `🤍` / `❤️` toggle.
  * Price row: Bold primary price + strike-through original price.
  * Quick Add: Full-width dark slate button (`#1e293b`) with smooth hover/active state.

---

## 3. Angular 21 Architecture Implementation Plan

### Targeted Components:
1. `FurniNest/frontend/src/app/pages/catalog/catalog.component.ts`
   * Replace the current multi-row filter bar on mobile with the responsive **Floating Glass Dock** and collapsible space selection drawer.
   * Add wood finish tint signals to product cards.
2. `FurniNest/frontend/src/app/pages/catalog/catalog.component.css` / inline styles:
   * Implement CSS media query `@media (max-width: 768px)` to activate the floating glass dock.
   * On desktop (`>768px`), display the elegant horizontal bar with enhanced styling.

