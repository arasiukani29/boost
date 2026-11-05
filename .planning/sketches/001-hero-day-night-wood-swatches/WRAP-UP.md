# Sketch Wrap-Up: 001-hero-day-night-wood-swatches

> **Status:** Finalized & Approved  
> **Selected Variant:** **Variant B (Split Wipe Slider & Macro Grain Texture Drawer)**  
> **Date:** 2026-11-05  
> **Target:** FurniNest Frontend (`FurniNest/frontend/src/app/pages/home/`)

---

## 1. Executive Summary & Design Decision

During the design exploration phase, three hero variants were prototyped to solve the challenge of presenting luxury handcrafted furniture in realistic residential lighting environments:
* **Variant A (Cinematic Loupe):** 3-step discrete lighting with cursor loupe.
* **Variant B (Split Wipe Slider):** Interactive before/after split slider comparing 12:00 PM Natural Daylight with 10:30 PM Hearth Glow, supported by a bottom material dock and a 4K macro inspection modal.
* **Variant C (Kelvin Studio):** Continuous Kelvin slider (2200K - 6500K) with live dynamic price calculation.

**Winning Direction:** **Variant B** was selected for its immediate tactile clarity, allowing customers to drag the split handle directly over the furniture and inspect timber fibers at high resolution before purchasing.

---

## 2. Design Tokens & Visual Specs

### Typography
* **Serif Display (Headings & Brand):** `'Playfair Display', Georgia, serif`
  * Hero Title: `font-size: 40px`, `font-weight: 600`, `line-height: 1.15`
  * Section Headers: `font-size: 28px`, `font-weight: 700`
* **Sans Body (UI, Metadata, Specs):** `'Plus Jakarta Sans', system-ui, sans-serif`
  * Body copy: `font-size: 15px`, `line-height: 1.6`
  * Labels / Badges: `font-size: 11px`, `text-transform: uppercase`, `letter-spacing: 0.08em`

### Color Palette
| Token Name | Value | Purpose |
|---|---|---|
| `--color-bg-deep` | `#0d0a08` | Canvas & dark base background |
| `--color-surface-glass` | `rgba(18, 14, 11, 0.78)` | Floating content card & docks (with blur) |
| `--color-border-subtle` | `rgba(255, 255, 255, 0.15)` | Glassmorphic card borders |
| `--color-wood-amber` | `#c48b52` | Primary CTA buttons & active focus rings |
| `--color-wood-gold` | `#f7d59c` | Divider handle, accent tags, glowing indicators |
| `--color-fsc-green` | `#86efac` | Sustainability & FSC certification badge text |

### Lighting Filters & CSS Formulas
* **Daylight Filter:**
  ```css
  filter: brightness(1.08) contrast(1.05);
  ```
* **Night / Hearth Glow Filter:**
  ```css
  filter: brightness(0.65) contrast(1.35) sepia(0.35) hue-rotate(-22deg);
  ```
* **Night Radial Ambient Overlay:**
  ```css
  background: radial-gradient(circle at 75% 45%, rgba(245, 158, 11, 0.4) 0%, rgba(15, 10, 5, 0.8) 80%);
  mix-blend-mode: screen;
  ```
* **Split Slider Clip-Path Formula:**
  ```css
  clip-path: polygon(var(--split-percent) 0, 100% 0, 100% 100%, var(--split-percent) 100%);
  ```
  *(Clamped between 15% and 85% to maintain touch usability)*

---

## 3. Interaction Architecture

### A. Split Handle Dragging
1. `splitPercent` tracked via an Angular signal (`splitPercent = signal<number>(55)`).
2. Pointer event listeners (`pointerdown`, `pointermove`, `pointerup`) on the container.
3. Both desktop mouse and touch dragging supported natively.

### B. Material Finishes & 4K Grain Inspector
1. Three pre-calibrated timber finishes:
   * **Solid American White Oak** (Janka 1,360 | Appalachian Forests | 15% Ultra-Matte Hardwax)
   * **American Black Walnut** (Janka 1,010 | Missouri Woodlands | 25% Satin Linseed Hand-Rub)
   * **Heritage Reclaimed Teak** (Janka 1,155 | Nilgiri Reserves | Natural Beeswax Polish)
2. Clicking **"🔍 Inspect 4K Macro Grain"** opens a high-contrast modal with 2x zoom on hover for microscopic timber inspection.

---

## 4. Frontend Implementation Blueprint (Angular 21)

```typescript
// Proposed Angular Signal Structure
@Component({
  selector: 'app-hero-split-slider',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-split-slider.component.html',
  styleUrls: ['./hero-split-slider.component.scss']
})
export class HeroSplitSliderComponent {
  splitPercent = signal<number>(55);
  isDragging = signal<boolean>(false);
  activeFinish = signal<TimberFinish>(TIMBER_FINISHES[0]);
  isMacroModalOpen = signal<boolean>(false);
  
  onPointerMove(event: PointerEvent, containerRect: DOMRect): void {
    if (!this.isDragging()) return;
    const raw = ((event.clientX - containerRect.left) / containerRect.width) * 100;
    this.splitPercent.set(Math.max(15, Math.min(85, raw)));
  }
}
```

---

## 5. Artifact Verification & Links
* **Prototype:** [variant-b.html](file:///d:/boost/.planning/sketches/001-hero-day-night-wood-swatches/variant-b.html)
* **Hub:** [index.html](file:///d:/boost/.planning/sketches/001-hero-day-night-wood-swatches/index.html)
* **Manifest:** [MANIFEST.md](file:///d:/boost/.planning/sketches/MANIFEST.md)

