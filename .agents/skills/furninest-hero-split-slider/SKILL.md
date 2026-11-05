---
name: furninest-hero-split-slider
description: "Guidelines and design tokens for FurniNest's Day/Night split slider and 4K macro timber swatch inspector"
---

# FurniNest Hero Split Slider Design System

Use this skill when building, styling, or updating the homepage hero or product showcase components in FurniNest.

## Design Specifications

### 1. Typography & Hierarchy
* **Headings:** `'Playfair Display', Georgia, serif`
* **Body / Labels:** `'Plus Jakarta Sans', system-ui, sans-serif`

### 2. Colors & Tokens
* **Background Deep:** `#0d0a08`
* **Card Surface:** `rgba(18, 14, 11, 0.78)` with `backdrop-filter: blur(20px)`
* **Borders:** `rgba(255, 255, 255, 0.15)`
* **Primary Accent (Amber):** `#c48b52`
* **Highlight (Gold):** `#f7d59c`
* **FSC Badge Green:** `#86efac` with `#14532d` background

### 3. Lighting Filters
* **Daylight:** `brightness(1.08) contrast(1.05)`
* **Night / Hearth Glow:** `brightness(0.65) contrast(1.35) sepia(0.35) hue-rotate(-22deg)`
* **Night Radial Ambient:** `radial-gradient(circle at 75% 45%, rgba(245, 158, 11, 0.4) 0%, rgba(15, 10, 5, 0.8) 80%)` with `mix-blend-mode: screen`

### 4. Interactive Split Slider Formula
```css
clip-path: polygon(var(--split-percent) 0, 100% 0, 100% 100%, var(--split-percent) 100%);
```
Clamp `--split-percent` between `15%` and `85%`.

### 5. Verified Prototype Reference
* [variant-b.html](file:///d:/boost/.planning/sketches/001-hero-day-night-wood-swatches/variant-b.html)
* [WRAP-UP.md](file:///d:/boost/.planning/sketches/001-hero-day-night-wood-swatches/WRAP-UP.md)

