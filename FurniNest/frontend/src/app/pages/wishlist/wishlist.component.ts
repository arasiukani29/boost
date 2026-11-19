import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, MatTooltipModule],
  template: `
    <div class="wishlist-page container animate-fade-in">
      <div class="page-header">
        <button (click)="goBack()" class="btn-back-link">
          ← Back to Shopping
        </button>
        <div>
          <span class="badge badge-amber">Curated by You</span>
          <h1 class="page-title">Saved Wishlist</h1>
          <p class="page-subtitle">Your personal collection of handcrafted furniture pieces.</p>
        </div>
      </div>

      @if (wishlistService.wishlist().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">🤍</span>
          <h3>Your wishlist is empty</h3>
          <p>Explore our handcrafted collections and tap the heart icon on any piece you love.</p>
          <a routerLink="/catalog" class="btn btn-accent">Explore Catalog</a>
        </div>
      } @else {
        <div class="wishlist-grid">
          @for (item of wishlistService.wishlist(); track item.id) {
            <div class="wish-card">
              <div class="img-wrap">
                <a [routerLink]="['/product', item.productId]">
                  <img [src]="item.primaryImageUrl" [alt]="item.productName" class="prod-img" />
                </a>
                <button (click)="removeItem(item.productId)" class="remove-btn" title="Remove from wishlist">
                  ✕
                </button>
              </div>

              <div class="card-body">
                <span class="cat-tag">{{ item.categoryName }}</span>
                <h3 class="prod-title">
                  <a [routerLink]="['/product', item.productId]">{{ item.productName }}</a>
                </h3>
                <p class="dimensions">📏 {{ item.dimensions }}</p>
                <p class="material">{{ item.material }}</p>

                <div class="card-footer">
                  <div class="price-wrap">
                    <span class="price">₹{{ item.price.toLocaleString('en-IN') }}</span>
                    @if (item.originalPrice) {
                      <span class="orig-price">₹{{ item.originalPrice.toLocaleString('en-IN') }}</span>
                    }
                  </div>

                  <button (click)="moveToBag(item.productId)" class="btn btn-primary btn-sm move-btn">
                    + Move to Bag
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .wishlist-page {
      padding: 3.5rem 0 5rem;
    }
    .page-header {
      margin-bottom: 2.5rem;
    }
    .btn-back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--primary);
      background: #f1f5f9;
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      margin-bottom: 1rem;
      transition: all 0.2s;
    }
    .btn-back-link:hover {
      background: #e2e8f0;
      color: var(--accent);
    }
    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0.5rem 0 0.25rem;
    }
    .page-subtitle {
      color: var(--text-muted);
      font-size: 1.05rem;
    }
    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }
    .wish-card {
      background: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .wish-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }
    .img-wrap {
      position: relative;
      height: 260px;
      background: #f1f5f9;
      overflow: hidden;
    }
    .prod-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
    .wish-card:hover .prod-img {
      transform: scale(1.04);
    }
    .remove-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      color: #dc2626;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
    }
    .remove-btn:hover {
      background: #dc2626;
      color: #ffffff;
    }
    .card-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .cat-tag {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.3rem;
    }
    .prod-title {
      font-size: 1.15rem;
      margin-bottom: 0.4rem;
    }
    .dimensions {
      font-size: 0.8rem;
      color: #64748b;
      margin-bottom: 0.2rem;
    }
    .material {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
      flex: 1;
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      padding-top: 1rem;
    }
    .price-wrap {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
    }
    .price {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--primary);
    }
    .orig-price {
      font-size: 0.85rem;
      color: #94a3b8;
      text-decoration: line-through;
    }
    .move-btn {
      padding: 0.5rem 0.9rem;
      font-size: 0.85rem;
    }
    .empty-state {
      text-align: center;
      padding: 5rem 1rem;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .empty-icon {
      font-size: 3.5rem;
      display: block;
      margin-bottom: 1rem;
    }
    .empty-state h3 {
      font-size: 1.35rem;
      margin-bottom: 0.5rem;
    }
    .empty-state p {
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }
    @media (max-width: 768px) {
      .wishlist-page {
        padding: 2rem 0 3.5rem;
      }
      .wishlist-grid {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }
      .img-wrap {
        height: 220px;
      }
      .card-body {
        padding: 1rem;
      }
      .card-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
      }
      .card-footer .move-btn {
        width: 100%;
      }
    }
  `]
})
export class WishlistComponent {
  wishlistService = inject(WishlistService);
  cartService = inject(CartService);
  private authService = inject(AuthService);
  private location = inject(Location);
  private router = inject(Router);
  private notification = inject(NotificationService);

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/catalog']);
    }
  }

  removeItem(productId: number) {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => this.notification.info('Piece removed from your wishlist')
    });
  }

  moveToBag(productId: number) {
    if (!this.authService.isAuthenticated()) {
      this.notification.warn(
        'Please sign in to move pieces to your shopping bag.',
        'Sign In →',
        () => this.router.navigate(['/login'], { queryParams: { returnUrl: '/wishlist' } }),
        'Sign In Required'
      );
      return;
    }
    this.cartService.addToCart(productId, 1).subscribe({
      next: () => {
        this.wishlistService.removeFromWishlist(productId).subscribe();
        this.notification.success('🛋️ Moved to Shopping Bag!', 'Open Bag', () => this.cartService.openDrawer());
      }
    });
  }
}

