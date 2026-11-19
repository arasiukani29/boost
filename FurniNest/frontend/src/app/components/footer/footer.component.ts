import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer-wrapper">
      <div class="container">
        <!-- Back to Top Strip for Mobile & Desktop -->
        <div class="back-to-top-row">
          <button (click)="scrollToTop()" class="btn-back-to-top">
            <span>↑ Back to Top</span>
          </button>
        </div>

        <div class="footer-content">
          <!-- Brand Section -->
          <div class="footer-brand">
            <div class="brand-logo">
              <span class="brand-icon">🛋️</span>
              <span class="brand-text">Furni<span>Nest</span></span>
            </div>
            <p class="brand-desc">
              Handcrafting heirloom-quality furniture designed to bring warmth, character, and timeless architectural comfort into modern homes.
            </p>
            <div class="badges">
              <span class="badge badge-amber">🛡️ 10-Year Warranty</span>
              <span class="badge badge-green">🌲 FSC-Certified</span>
            </div>
          </div>

          <!-- Two-Column Mobile Links Grid -->
          <div class="links-columns-wrap">
            <div class="footer-links">
              <h4>Collections</h4>
              <ul>
                <li><a routerLink="/catalog" [queryParams]="{category: 'living-room'}">Living Room</a></li>
                <li><a routerLink="/catalog" [queryParams]="{category: 'bedroom'}">Bedroom</a></li>
                <li><a routerLink="/catalog" [queryParams]="{category: 'dining-room'}">Dining</a></li>
                <li><a routerLink="/catalog" [queryParams]="{category: 'home-office'}">Home Office</a></li>
              </ul>
            </div>

            <div class="footer-links">
              <h4>Client Services</h4>
              <ul>
                <li><a routerLink="/my-orders">Track Orders</a></li>
                <li><a routerLink="/wishlist">Saved Wishlist</a></li>
                <li><a routerLink="/catalog">Delivery Policy</a></li>
                <li><a routerLink="/catalog">Woodcraft Guarantee</a></li>
              </ul>
            </div>
          </div>

          <!-- Demo & Developer Portal -->
          <div class="footer-demo-col">
            <h4>Quick Access</h4>
            <div class="demo-actions-row">
              <a routerLink="/login" class="demo-link-pill">Sign In</a>
              <a routerLink="/admin" class="demo-link-pill admin-pill">Admin Portal</a>
            </div>

            <div class="demo-card">
              <div class="demo-card-head">
                <span>🔑 Pre-seeded Accounts</span>
              </div>
              <div class="demo-row">
                <span class="role-tag">Customer:</span>
                <code>customer&#64;furninest.com</code>
              </div>
              <div class="demo-row">
                <span class="role-tag admin-tag">Admin:</span>
                <code>admin&#64;furninest.com</code>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Copyright -->
        <div class="footer-bottom">
          <p>&copy; 2026 FurniNest Studio Private Limited. All rights reserved.</p>
          <p class="built-with">
            <span>Engineered with </span>
            <strong>.NET 10 & Angular 21</strong>
            <span> (Signals Architecture)</span>
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-wrapper {
      background-color: var(--primary);
      color: #f8fafc;
      padding: 3rem 0 2rem;
      margin-top: 4.5rem;
      border-top: 3px solid var(--accent);
    }
    .back-to-top-row {
      display: flex;
      justify-content: center;
      margin-bottom: 2.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .btn-back-to-top {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #cbd5e1;
      background: rgba(255, 255, 255, 0.06);
      padding: 0.45rem 1.25rem;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      transition: all 0.2s;
    }
    .btn-back-to-top:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      transform: translateY(-2px);
    }
    .footer-content {
      display: grid;
      grid-template-columns: 1.8fr 2fr 1.4fr;
      gap: 3rem;
      margin-bottom: 3rem;
      align-items: start;
    }
    .footer-brand .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.45rem;
      font-weight: 800;
      margin-bottom: 0.75rem;
    }
    .footer-brand .brand-text span {
      color: var(--accent);
    }
    .brand-desc {
      color: #94a3b8;
      font-size: 0.88rem;
      line-height: 1.6;
      margin-bottom: 1.25rem;
      max-width: 360px;
    }
    .badges {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .links-columns-wrap {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    .footer-links h4 {
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 1rem;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    .footer-links ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .footer-links a {
      color: #94a3b8;
      font-size: 0.88rem;
      transition: color 0.2s;
      display: inline-block;
    }
    .footer-links a:hover {
      color: #ffffff;
      transform: translateX(2px);
    }
    .footer-demo-col h4 {
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.75rem;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    .demo-actions-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .demo-link-pill {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.08);
      color: #f1f5f9;
      border: 1px solid rgba(255, 255, 255, 0.15);
      transition: background 0.2s;
    }
    .demo-link-pill:hover {
      background: rgba(255, 255, 255, 0.18);
    }
    .admin-pill {
      color: #fde68a;
      border-color: rgba(253, 230, 138, 0.3);
    }
    .demo-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-sm);
      padding: 0.75rem 0.85rem;
      font-size: 0.8rem;
    }
    .demo-card-head {
      font-size: 0.75rem;
      font-weight: 700;
      color: #94a3b8;
      margin-bottom: 0.4rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .demo-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.25rem;
    }
    .role-tag {
      font-weight: 600;
      color: #cbd5e1;
      font-size: 0.75rem;
      min-width: 65px;
    }
    .admin-tag {
      color: #fde68a;
    }
    .demo-row code {
      font-family: monospace;
      font-size: 0.78rem;
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.08);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      word-break: break-all;
    }
    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 1.75rem;
      display: flex;
      justify-content: space-between;
      color: #64748b;
      font-size: 0.82rem;
      gap: 1rem;
    }
    .built-with {
      color: #94a3b8;
    }
    .built-with strong {
      color: #e2e8f0;
    }

    /* Mobile Responsive Optimizations */
    @media (max-width: 840px) {
      .footer-wrapper {
        padding: 2.25rem 0 3rem;
        margin-top: 3.5rem;
      }
      .back-to-top-row {
        margin-bottom: 1.75rem;
        padding-bottom: 1.25rem;
      }
      .footer-content {
        grid-template-columns: 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
      }
      .links-columns-wrap {
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        padding: 1.25rem 0;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .footer-links h4 {
        margin-bottom: 0.75rem;
      }
      .footer-links ul {
        gap: 0.5rem;
      }
      .brand-desc {
        max-width: 100%;
        margin-bottom: 1rem;
      }
      .footer-bottom {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
        padding-top: 1.5rem;
      }
    }
  `]
})
export class FooterComponent {
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
