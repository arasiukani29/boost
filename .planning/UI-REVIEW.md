# FurniNest Visual UI Audit (6-Pillar Framework)

**Date:** November 5, 2026  
**Auditor:** Antigravity UI Reviewer  
**Target:** FurniNest (Angular 21 + Tailwind/Custom Design Tokens + ASP.NET Core 10)  
**Overall Score:** **21.4 / 24.0** (89.1% — **Grade A / High-End Production Ready**)

---

## Executive Summary

FurniNest exhibits an exemplary Scandinavian artisan brand identity. The juxtaposition of **Playfair Display** (editorial serif) for architectural headlines and **Plus Jakarta Sans** for crisp navigational typography creates an immediate luxury, high-trust mood. 

Recent refinements—including the curated 26-product catalog with zero broken image links and the streamlined 290px notification toasts—have eliminated visual clutter and elevated the user journey.

---

## Scorecard Overview

| Pillar | Focus Area | Score (1-4) | Status |
| :--- | :--- | :---: | :--- |
| **Pillar 1** | Design System & Token Consistency | **3.5** | ✅ Solid / High Quality |
| **Pillar 2** | Layout & Responsive Adaptability | **3.7** | ✅ High Quality |
| **Pillar 3** | Typography & Visual Hierarchy | **3.8** | 🌟 Production Masterclass |
| **Pillar 4** | Visual Polish & Micro-Interactions | **3.6** | ✅ Solid / High Quality |
| **Pillar 5** | Component Ergonomics & Feedback States | **3.6** | ✅ Solid / High Quality |
| **Pillar 6** | Accessibility (WCAG AA) & Semantics | **3.2** | 🟡 Adequate (Polish Opportunities) |
| **TOTAL** | **Comprehensive Visual Score** | **21.4 / 24** | **Grade A (89.1%)** |

---

## Detailed Pillar Assessments

### Pillar 1: Design System & Token Consistency (3.5 / 4.0)
- **Strengths:**
  - Strict global palette defined in `:root` (`--primary: #1e293b`, `--accent: #b45309`, `--bg-main: #f8fafc`, `--bg-card: #ffffff`, `--border: #e2e8f0`).
  - Standardized badge token classes (`.badge-amber`, `.badge-green`, `.badge-blue`, `.badge-purple`, `.badge-gray`) reused across catalog, cart, and home components.
  - Consistent elevation curve (`--shadow-sm` up to `--shadow-xl`) providing tactile depth to cards and drawers.
- **Identified Nuances:**
  - A small number of sub-components employ hardcoded hex values (e.g. `#fed7aa`, `#64748b`) rather than invoking CSS custom property tokens.
  - Material Dialog surface overrides rely on `!important` declarations to supersede MDC defaults.

### Pillar 2: Layout & Responsive Adaptability (3.7 / 4.0)
- **Strengths:**
  - Product grids use responsive CSS grid algorithms (`repeat(auto-fill, minmax(280px, 1fr))`) ensuring balanced card distribution across all viewport widths.
  - Breakpoints (`1024px`, `768px`, `480px`) cleanly divide desktop navigation from mobile drawer states.
  - Mobile top-nav introduces a dedicated `.mobile-back-btn` to prevent navigational dead-ends on deep pages.
  - Cart slide-out drawer adapts from 380px fixed desktop width to 100vw bottom/side containment on mobile screens.
- **Identified Nuances:**
  - On viewports between 640px and 800px, multi-filter pill rows (Category + Price Range) can wrap onto 3 or 4 vertical lines. Implementing a single-row horizontal touch-scroll track (`overflow-x: auto; scrollbar-width: none`) would provide cleaner ergonomics.

### Pillar 3: Typography & Visual Hierarchy (3.8 / 4.0)
- **Strengths:**
  - High-end font pairing: `Playfair Display` for emotive artisan headers + `Plus Jakarta Sans` for clean data/button legible legibility.
  - Prices adhere strictly to Indian numbering grouping (`₹25,000`, `₹1,24,999`) with formatted original price strike-throughs and clear discount savings pills.
  - Title line-clamping prevents layout shifts from long artisanal product names.
- **Identified Nuances:**
  - Category subtitles in uppercase tracked caps (`letter-spacing: 0.05em`) are elegant, but line heights on mobile headlines should remain tightly bounded (1.15 to 1.25) to avoid header crowding.

### Pillar 4: Visual Polish & Micro-Interactions (3.6 / 4.0)
- **Strengths:**
  - Tactile card lifts on hover (`translateY(-2px)` / `-4px` with smooth easing).
  - Floating wishlist hearts with smooth fill toggle transitions (`🤍` to `❤️`).
  - Interactive multi-angle image gallery with cursor-following zoom (`transform-origin: X% Y%`) and fullscreen inspection lightbox.
  - Dynamic White-Glove delivery progress bar calculating the ₹25,000 milestone threshold in real time.
- **Identified Nuances:**
  - Standardizing transition bezier curves (e.g. `cubic-bezier(0.16, 1, 0.3, 1)`) across all buttons, dropdowns, and drawers will bring seamless fluidity across every interaction.

### Pillar 5: Component Ergonomics & Feedback States (3.6 / 4.0)
- **Strengths:**
  - Streamlined `ToastContainerComponent` reduced to a sleek 290px floating pill card with subtle 1px border, soft drop-shadow, and automatic duplicate arrow cleanup.
  - Empathetic empty states in the shopping bag and wishlist with clear, one-tap CTAs routing users back to the curated catalog.
  - Multi-tab auth suite (`Password`, `Email OTP`, `Passkey / WebAuthn`) with contextual helper hints.
- **Identified Nuances:**
  - Loading skeleton states for initial product loads could replace the simple text fallback on slow 3G network simulation.

### Pillar 6: Accessibility & Semantic Structure (3.2 / 4.0)
- **Strengths:**
  - Clean HTML5 semantic outline: `<header>`, `<nav>`, `<section>`, `<main>`, `<footer>`.
  - Strong WCAG AA & AAA contrast ratios: Primary text `#0f172a` against white `#ffffff` achieves 16.2:1 (well above the 7.0:1 AAA standard). Woodcraft accent amber `#b45309` achieves 5.1:1.
  - Polite ARIA live regions (`aria-live="polite"`, `role="alert"`) ensure toasts notify assistive technologies without interrupting user actions.
- **Identified Nuances:**
  - Interactive icon buttons (Wishlist heart toggle, item remove trashcan) should have explicit `aria-label` tags.
  - Visible keyboard focus rings (`:focus-visible`) should be styled with a consistent amber ring offset across all filter pills.

---

## Actionable Recommendations & Roadmap

1. **Quick Win (Completed):** Streamlined the toast notification to a sleek 290px width with automatic arrow cleanup and soft luxury elevation.
2. **Phase Next (Pillar 2):** Implement horizontal touch-scroll tracks on mobile filter pills to eliminate multi-line wrapping on mobile devices.
3. **Phase Next (Pillar 6):** Add explicit `aria-label` attributes to icon-only buttons across catalog and product cards.

