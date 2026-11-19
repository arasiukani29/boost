import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatTooltipModule],
  template: `
    <header class="navbar-wrapper">
      <!-- Announcement Banner -->
      <div class="announcement-bar">
        <span>✨ Handcrafted solid wood furniture. Free White Glove Delivery across India on orders over ₹25,000</span>
      </div>

      <nav class="main-nav container">
        <!-- Brand & Back Button Group -->
        <div class="brand-group">
          @if (!isHome()) {
            <button (click)="goBack()" class="mobile-back-btn" aria-label="Go Back" title="Previous page">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          }

          <a routerLink="/" (click)="closeMobileMenu()" class="brand-logo">
            <span class="brand-icon">🛋️</span>
            <span class="brand-text">Furni<span>Nest</span></span>
          </a>
        </div>

        <!-- Desktop Navigation Links -->
        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/catalog" routerLinkActive="active">Collection</a>
          <a routerLink="/catalog" [queryParams]="{category: 'living-room'}">Living</a>
          <a routerLink="/catalog" [queryParams]="{category: 'bedroom'}">Bedroom</a>
          <a routerLink="/catalog" [queryParams]="{category: 'dining-room'}">Dining</a>
          <a routerLink="/catalog" [queryParams]="{category: 'home-office'}">Office</a>
        </div>

        <!-- Action Items (Search, Account, Cart, Hamburger) -->
        <div class="nav-actions">
          @if (authService.isAuthenticated()) {
            @if (authService.isAdmin()) {
              <a routerLink="/admin" class="admin-badge-btn desktop-only">
                <span>🛡️ Admin</span>
              </a>
            }

            <div class="user-menu desktop-only">
              <a routerLink="/my-orders" class="user-greeting">
                <span class="avatar">👤</span>
                <span class="name">{{ authService.currentUser()?.fullName?.split(' ')?.at(0) }}</span>
              </a>
              <button (click)="authService.logout()" class="logout-btn" title="Sign Out">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              </button>
            </div>
          } @else {
            <a routerLink="/login" class="login-link desktop-only">Sign In</a>
          }

          <!-- Theme Toggle Trigger -->
          <button 
            type="button" 
            (click)="themeService.toggleTheme()" 
            class="theme-toggle-btn" 
            [attr.aria-label]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'" 
            [matTooltip]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            @if (themeService.isDark()) {
              <span class="theme-icon sun-icon">☀️</span>
            } @else {
              <span class="theme-icon moon-icon">🌙</span>
            }
          </button>

          <!-- Wishlist Trigger -->
          <a routerLink="/wishlist" (click)="closeMobileMenu()" class="wishlist-trigger" aria-label="Open Wishlist" matTooltip="Saved Wishlist">
            <span class="heart-icon">🤍</span>
            @if (wishlistService.count() > 0) {
              <span class="wish-count">{{ wishlistService.count() }}</span>
            }
          </a>

          <!-- Cart Trigger -->
          <button (click)="openCart()" class="cart-trigger" aria-label="Open Cart" matTooltip="Shopping Bag">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            @if (cartService.itemCount() > 0) {
              <span class="cart-count">{{ cartService.itemCount() }}</span>
            }
          </button>

          <!-- Mobile Hamburger Toggle -->
          <button (click)="toggleMobileMenu()" class="hamburger-btn" [attr.aria-expanded]="mobileMenuOpen()" aria-label="Toggle menu">
            @if (mobileMenuOpen()) {
              <span class="close-icon">✕</span>
            } @else {
              <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            }
          </button>
        </div>
      </nav>

      <!-- Mobile Dropdown Navigation Menu -->
      @if (mobileMenuOpen()) {
        <div class="mobile-nav-backdrop" (click)="closeMobileMenu()">
          <div class="mobile-nav-panel animate-fade-in" (click)="$event.stopPropagation()">
            <!-- Mobile Header with Back / Close -->
            <div class="mobile-panel-header">
              <div class="mobile-panel-title">Menu Navigation</div>
              <button (click)="closeMobileMenu()" class="mobile-panel-close">
                ✕ Close
              </button>
            </div>

            <!-- Mobile Appearance Switch -->
            <div class="mobile-theme-row">
              <span class="theme-label">🌓 Color Mode</span>
              <button type="button" (click)="themeService.toggleTheme()" class="theme-switch-pill">
                <span>{{ themeService.isDark() ? '☀️ Light Mode' : '🌙 Dark Mode' }}</span>
              </button>
            </div>

            <!-- Mobile Links -->
            <div class="mobile-links-group">
              <div class="mobile-group-title">EXPLORE FURNINNEST</div>
              <a routerLink="/" (click)="closeMobileMenu()" class="mobile-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <span>🏠 Home</span>
              </a>
              <a routerLink="/catalog" (click)="closeMobileMenu()" class="mobile-link" routerLinkActive="active">
                <span>🛋️ All Furniture Collection</span>
              </a>
              <a routerLink="/catalog" [queryParams]="{category: 'living-room'}" (click)="closeMobileMenu()" class="mobile-link">
                <span>✨ Living Room Collection</span>
              </a>
              <a routerLink="/catalog" [queryParams]="{category: 'bedroom'}" (click)="closeMobileMenu()" class="mobile-link">
                <span>🛏️ Bedroom Pieces</span>
              </a>
              <a routerLink="/catalog" [queryParams]="{category: 'dining-room'}" (click)="closeMobileMenu()" class="mobile-link">
                <span>🍽️ Dining Tables & Chairs</span>
              </a>
              <a routerLink="/catalog" [queryParams]="{category: 'home-office'}" (click)="closeMobileMenu()" class="mobile-link">
                <span>💼 Executive Home Office</span>
              </a>
            </div>

            <div class="mobile-divider"></div>

            <!-- Mobile User Section -->
            <div class="mobile-user-section">
              @if (authService.isAuthenticated()) {
                <div class="mobile-user-badge">
                  <span class="avatar">👤</span>
                  <div class="user-text">
                    <strong>{{ authService.currentUser()?.fullName }}</strong>
                    <small>{{ authService.currentUser()?.email }}</small>
                  </div>
                </div>

                <a routerLink="/my-orders" (click)="closeMobileMenu()" class="mobile-link user-action-link">
                  <span>📦 My Orders & Tracking</span>
                </a>

                <a routerLink="/wishlist" (click)="closeMobileMenu()" class="mobile-link user-action-link">
                  <span>❤️ Saved Wishlist ({{ wishlistService.count() }})</span>
                </a>

                @if (authService.isAdmin()) {
                  <a routerLink="/admin" (click)="closeMobileMenu()" class="mobile-link admin-mobile-link">
                    <span>🛡️ Store Administration</span>
                  </a>
                }

                <button (click)="logoutMobile()" class="mobile-logout-btn">
                  🚪 Sign Out
                </button>
              } @else {
                <div class="mobile-guest-actions">
                  <a routerLink="/login" (click)="closeMobileMenu()" class="btn btn-primary btn-block">
                    Sign In to Account
                  </a>
                  <a routerLink="/register" (click)="closeMobileMenu()" class="btn btn-outline btn-block">
                    Create New Account
                  </a>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      position: sticky;
      top: 0;
      z-index: 50;
      background: var(--bg-card);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border);
    }
    .announcement-bar {
      background-color: var(--primary);
      color: #f8fafc;
      font-size: 0.75rem;
      font-weight: 500;
      text-align: center;
      padding: 0.35rem 0.75rem;
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .main-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .mobile-back-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: #f1f5f9;
      color: var(--primary);
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .mobile-back-btn:active {
      background: #e2e8f0;
      transform: scale(0.92);
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-main);
      flex-shrink: 0;
    }
    .brand-text span {
      color: var(--accent);
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
      font-weight: 500;
      font-size: 0.92rem;
    }
    .nav-links a {
      color: var(--text-muted);
      transition: color 0.2s;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--text-main);
      font-weight: 600;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .admin-badge-btn {
      background-color: var(--accent-light);
      color: var(--accent);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.35rem 0.7rem;
      border-radius: 9999px;
      border: 1px solid var(--accent);
      transition: background-color 0.2s;
    }
    .admin-badge-btn:hover {
      background-color: var(--accent);
      color: #0b0f19;
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .user-greeting {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-weight: 600;
      font-size: 0.88rem;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      background-color: var(--bg-surface);
      color: var(--text-main);
      border: 1px solid var(--border);
      transition: all 0.2s;
    }
    .user-greeting:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    .user-greeting .avatar {
      font-size: 0.95rem;
    }
    .user-greeting .name {
      color: var(--text-main);
      font-weight: 700;
    }
    .logout-btn {
      color: var(--text-muted);
      padding: 0.35rem;
      display: flex;
      align-items: center;
    }
    .logout-btn:hover {
      color: #dc2626;
    }
    .login-link {
      font-weight: 600;
      font-size: 0.88rem;
      color: var(--text-main);
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background-color: var(--bg-surface);
      transition: all 0.2s;
    }
    .login-link:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    .wishlist-trigger {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1px solid var(--border);
      background-color: var(--bg-surface);
      color: var(--text-main);
      font-size: 1rem;
      transition: transform 0.2s, background-color 0.2s;
    }
    .wishlist-trigger:hover {
      transform: scale(1.05);
      border-color: var(--accent);
    }
    .wish-count {
      position: absolute;
      top: -3px;
      right: -3px;
      background-color: #dc2626;
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 800;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
    }
    .cart-trigger {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background-color: var(--primary);
      color: #ffffff;
      transition: transform 0.2s;
    }
    .cart-trigger:hover {
      transform: scale(1.05);
      background-color: var(--primary-hover);
    }
    .cart-count {
      position: absolute;
      top: -3px;
      right: -3px;
      background-color: var(--accent);
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 800;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
    }
    .hamburger-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--bg-surface);
      color: var(--text-main);
      font-size: 1.1rem;
    }
    .close-icon {
      font-size: 1.1rem;
      font-weight: bold;
    }

    /* Mobile Drawer */
    .mobile-nav-backdrop {
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(4px);
      z-index: 49;
      display: flex;
      flex-direction: column;
    }
    .mobile-nav-panel {
      background: var(--bg-card);
      border-bottom: 2px solid var(--border);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
      padding: 1rem 1.25rem 1.75rem;
      max-height: 80vh;
      overflow-y: auto;
    }
    .mobile-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 1rem;
    }
    .mobile-panel-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .mobile-panel-close {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
    }
    .mobile-group-title {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin-bottom: 0.5rem;
      padding: 0 0.5rem;
    }
    .mobile-link {
      display: flex;
      align-items: center;
      padding: 0.75rem 0.85rem;
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-main);
      transition: background-color 0.2s;
    }
    .mobile-link:hover, .mobile-link.active {
      background-color: var(--bg-surface);
      color: var(--accent);
    }
    .mobile-divider {
      height: 1px;
      background: var(--border);
      margin: 1rem 0;
    }
    .mobile-user-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .mobile-user-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bg-surface);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      margin-bottom: 0.5rem;
    }
    .mobile-user-badge .avatar {
      font-size: 1.5rem;
    }
    .user-text {
      display: flex;
      flex-direction: column;
    }
    .user-text strong {
      font-size: 0.95rem;
      color: var(--text-main);
    }
    .user-text small {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .user-action-link {
      background: #fafafa;
    }
    .admin-mobile-link {
      background: #fef3c7;
      color: #92400e;
    }
    .mobile-logout-btn {
      width: 100%;
      text-align: left;
      padding: 0.75rem 0.85rem;
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      font-weight: 600;
      color: #dc2626;
      background: #fef2f2;
      margin-top: 0.5rem;
    }
    .mobile-guest-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-top: 0.5rem;
    }
    .btn-block {
      width: 100%;
      text-align: center;
    }

    /* Theme Toggle Button */
    .theme-toggle-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      border: 1px solid var(--border);
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--text-main);
    }
    .theme-toggle-btn:hover {
      background: #e2e8f0;
      transform: rotate(15deg) scale(1.08);
    }
    :host-context([data-theme="dark"]) .theme-toggle-btn,
    :host-context(.dark-theme) .theme-toggle-btn {
      background: #1e293b;
      border-color: #334155;
      color: #f59e0b;
    }
    :host-context([data-theme="dark"]) .theme-toggle-btn:hover,
    :host-context(.dark-theme) .theme-toggle-btn:hover {
      background: #273554;
    }

    .mobile-theme-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0.5rem;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .theme-switch-pill {
      background: #f1f5f9;
      border: 1px solid var(--border);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    :host-context([data-theme="dark"]) .theme-switch-pill,
    :host-context(.dark-theme) .theme-switch-pill {
      background: #1e293b;
      border-color: #334155;
      color: #f59e0b;
    }

    /* Dark Mode Overrides for Navbar Elements */
    :host-context([data-theme="dark"]) .navbar-wrapper,
    :host-context(.dark-theme) .navbar-wrapper {
      background: rgba(19, 27, 46, 0.96);
      border-bottom-color: #1e293b;
    }
    :host-context([data-theme="dark"]) .brand-text,
    :host-context(.dark-theme) .brand-text {
      color: #f8fafc;
    }
    :host-context([data-theme="dark"]) .nav-links a,
    :host-context(.dark-theme) .nav-links a {
      color: #94a3b8;
    }
    :host-context([data-theme="dark"]) .nav-links a:hover,
    :host-context([data-theme="dark"]) .nav-links a.active,
    :host-context(.dark-theme) .nav-links a:hover,
    :host-context(.dark-theme) .nav-links a.active {
      color: #f59e0b;
    }
    :host-context([data-theme="dark"]) .mobile-nav-panel,
    :host-context(.dark-theme) .mobile-nav-panel {
      background: #131b2e;
      border-color: #1e293b;
      color: #f8fafc;
    }
    :host-context([data-theme="dark"]) .mobile-link,
    :host-context(.dark-theme) .mobile-link {
      background: #1a233a;
      border-color: #273554;
      color: #cbd5e1;
    }
    :host-context([data-theme="dark"]) .mobile-link.active,
    :host-context(.dark-theme) .mobile-link.active {
      background: rgba(245, 158, 11, 0.15);
      border-color: #f59e0b;
      color: #f59e0b;
    }
    :host-context([data-theme="dark"]) .login-link,
    :host-context(.dark-theme) .login-link {
      background: #1a233a;
      border-color: #273554;
      color: #f8fafc;
    }
    :host-context([data-theme="dark"]) .cart-trigger,
    :host-context([data-theme="dark"]) .wishlist-trigger,
    :host-context(.dark-theme) .cart-trigger,
    :host-context(.dark-theme) .wishlist-trigger {
      color: #cbd5e1;
    }

    /* Breakpoint for Tablets and Phones */
    @media (max-width: 900px) {
      .mobile-back-btn {
        display: flex;
      }
      .nav-links, .desktop-only {
        display: none !important;
      }
      .hamburger-btn {
        display: flex;
      }
      .main-nav {
        height: 60px;
      }
      .brand-logo {
        font-size: 1.2rem;
      }
      .mobile-nav-backdrop {
        top: 60px;
      }
    }
  `]
})
export class NavbarComponent {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  private router = inject(Router);
  private location = inject(Location);

  mobileMenuOpen = signal<boolean>(false);
  isHome = signal<boolean>(true);

  constructor() {
    // Initial check
    this.checkIsHome(this.router.url);

    // Track route changes
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.checkIsHome(e.urlAfterRedirects || e.url);
    });
  }

  private checkIsHome(url: string) {
    const cleanUrl = url.split('?')[0];
    this.isHome.set(cleanUrl === '/' || cleanUrl === '');
  }

  goBack() {
    this.closeMobileMenu();
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  openCart() {
    this.closeMobileMenu();
    this.cartService.openDrawer();
  }

  logoutMobile() {
    this.closeMobileMenu();
    this.authService.logout();
  }
}
