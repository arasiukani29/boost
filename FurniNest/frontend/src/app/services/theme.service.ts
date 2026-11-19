import { Injectable, signal, computed } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'furninest_theme';

  // Reactive theme state
  readonly currentTheme = signal<AppTheme>('light');
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme() {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(this.STORAGE_KEY) as AppTheme | null;
    if (saved === 'dark' || saved === 'light') {
      this.applyTheme(saved);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes if no manual preference saved
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  toggleTheme() {
    const next = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  setTheme(theme: AppTheme) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
    this.applyTheme(theme);
  }

  private applyTheme(theme: AppTheme) {
    this.currentTheme.set(theme);
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      root.classList.add('dark');
    } else {
      document.body.classList.remove('dark-theme');
      root.classList.remove('dark');
    }
  }
}

