# Quick Task: 20261105-dark-light-mode
**Description:** Implement comprehensive Dark and Light mode theme system in FurniNest

## Tasks
1. **Create ThemeService (`src/app/services/theme.service.ts`):**
   - Signal-based state `currentTheme = signal<'light' | 'dark'>('light')`
   - LocalStorage persistence (`furninest_theme`)
   - System preference detection via `window.matchMedia`
   - DOM manipulation (`document.documentElement.setAttribute('data-theme', theme)`)

2. **Define Dark Mode Tokens in `styles.css`:**
   - `[data-theme="dark"]` token overrides for `--bg-main`, `--bg-card`, `--text-main`, `--text-muted`, `--border`, `--accent`
   - Dark theme styling for navbar, product cards, filters, dialogs, drawers, and form controls

3. **Integrate Theme Toggle Button into Navbar (`src/app/components/navbar/navbar.component.ts`):**
   - Add theme toggle icon button with `☀️` (sun) and `🌙` (moon) icons
   - Connect click handler to `themeService.toggleTheme()`
   - Add tooltips and accessible `aria-label`

4. **Verify Build & Visual Theme Switch:**
   - Test toggle between Light and Dark mode
   - Confirm persistence across page reloads

