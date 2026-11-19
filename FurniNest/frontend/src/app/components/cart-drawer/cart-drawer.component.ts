import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [RouterLink, MatProgressBarModule],
  template: `
    @if (cartService.isDrawerOpen()) {
      <div class="drawer-overlay" (click)="cartService.closeDrawer()">
        <div class="drawer-panel" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="drawer-header">
            <div class="title-wrap">
              <h3>Shopping Bag</h3>
              <span class="badge badge-amber">{{ cartService.itemCount() }} Items</span>
            </div>
            <button (click)="cartService.closeDrawer()" class="close-btn" aria-label="Close cart">
              ✕
            </button>
          </div>

          <!-- Free Shipping Progress -->
          <div class="shipping-notice">
            @if (cartService.subtotal() >= 25000) {
              <div class="shipping-unlocked">
                🎉 <strong>Congratulations!</strong> You unlocked <strong>Free White-Glove Delivery</strong>!
              </div>
            } @else {
              <div class="shipping-progress-text">
                Add <strong>₹{{ (25000 - cartService.subtotal()).toLocaleString('en-IN') }}</strong> more to unlock Free White-Glove Delivery!
              </div>
              <mat-progress-bar mode="determinate" [value]="(cartService.subtotal() / 25000) * 100" class="furni-progress"></mat-progress-bar>
            }
          </div>

          <!-- Items List -->
          <div class="items-list">
            @if (cartService.cart().items.length === 0) {
              <div class="empty-state">
                <span class="empty-icon">🛋️</span>
                <h4>Your bag is empty</h4>
                <p>Discover our heirloom crafted collection for your living room, bedroom, or office.</p>
                <div class="empty-state-actions">
                  <button (click)="cartService.closeDrawer()" routerLink="/catalog" class="btn btn-primary">
                    Browse Collection
                  </button>
                  @if (!authService.isAuthenticated()) {
                    <button (click)="signIn()" class="btn btn-outline btn-signin-drawer">
                      Sign In to View Saved Bag →
                    </button>
                  }
                </div>
              </div>
            } @else {
              @for (item of cartService.cart().items; track item.id) {
                <div class="cart-item">
                  <img [src]="item.primaryImageUrl" [alt]="item.productName" class="item-img" />
                  <div class="item-details">
                    <div class="item-title-row">
                      <h4 class="item-name">{{ item.productName }}</h4>
                      <button (click)="removeItem(item.id)" class="remove-btn" title="Remove item">
                        🗑️
                      </button>
                    </div>
                    <div class="item-price">₹{{ item.price.toLocaleString('en-IN') }}</div>
                    
                    <div class="quantity-row">
                      <div class="qty-stepper">
                        <button (click)="updateQuantity(item.id, item.quantity - 1)" class="stepper-btn">-</button>
                        <span class="qty-value">{{ item.quantity }}</span>
                        <button (click)="updateQuantity(item.id, item.quantity + 1)" class="stepper-btn" [disabled]="item.quantity >= item.availableStock">+</button>
                      </div>
                      <span class="line-total">₹{{ item.lineTotal.toLocaleString('en-IN') }}</span>
                    </div>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Footer / Checkout -->
          @if (cartService.cart().items.length > 0) {
            <div class="drawer-footer">
              <div class="summary-row">
                <span>Subtotal</span>
                <span class="val">₹{{ cartService.cart().subtotal.toLocaleString('en-IN') }}</span>
              </div>
              <div class="summary-row">
                <span>Estimated Shipping</span>
                <span class="val">{{ cartService.cart().estimatedShipping === 0 ? 'FREE' : ('₹' + cartService.cart().estimatedShipping.toLocaleString('en-IN')) }}</span>
              </div>
              <div class="summary-row total-row">
                <span>Estimated Total</span>
                <span class="val">₹{{ cartService.cart().total.toLocaleString('en-IN') }}</span>
              </div>

              <div class="cart-festive-coupon-hint">
                <span>🎉 Apply <strong>DIWALI50</strong> or <strong>FESTIVE25</strong> at checkout for up to 50% off!</span>
              </div>

              <button (click)="proceedToCheckout()" class="btn btn-accent checkout-btn">
                Proceed to Checkout →
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: flex;
      justify-content: flex-end;
    }
    .drawer-panel {
      width: 100%;
      max-width: 480px;
      height: 100%;
      background: var(--bg-card);
      color: var(--text-main);
      display: flex;
      flex-direction: column;
      box-shadow: -10px 0 25px -5px rgba(0, 0, 0, 0.35);
      animation: slideIn 0.25s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .title-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .title-wrap h3 {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .close-btn {
      font-size: 1.25rem;
      color: var(--text-muted);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .close-btn:hover {
      background: var(--bg-surface);
      color: var(--text-main);
    }
    .shipping-notice {
      background: var(--bg-main);
      color: var(--text-main);
      padding: 0.85rem 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .shipping-unlocked {
      font-size: 0.85rem;
      color: #166534;
    }
    .shipping-progress-text {
      font-size: 0.85rem;
      color: var(--text-main);
      margin-bottom: 0.4rem;
    }
    .furni-progress {
      height: 8px !important;
      border-radius: 9999px !important;
      --mdc-linear-progress-active-indicator-color: var(--accent);
      --mdc-linear-progress-track-color: #fde68a;
    }
    .items-list {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      color: var(--text-muted);
    }
    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }
    .empty-state h4 {
      font-size: 1.2rem;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }
    .empty-state p {
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
    .empty-state-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;
      width: 100%;
    }
    .btn-signin-drawer {
      border: 1px solid var(--accent);
      color: var(--accent);
      font-weight: 600;
      width: 100%;
      max-width: 260px;
    }
    .btn-signin-drawer:hover {
      background: var(--accent-light);
    }
    .cart-item {
      display: flex;
      gap: 1rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border);
    }
    .item-img {
      width: 90px;
      height: 90px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }
    .item-details {
      flex: 1;
    }
    .item-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
    }
    .item-name {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-main);
    }
    .remove-btn {
      font-size: 0.9rem;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    .remove-btn:hover {
      opacity: 1;
    }
    .item-price {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0.2rem 0 0.6rem;
    }
    .quantity-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .qty-stepper {
      display: flex;
      align-items: center;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }
    .stepper-btn {
      width: 28px;
      height: 28px;
      background: var(--bg-surface);
      color: var(--text-main);
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stepper-btn:hover:not(:disabled) {
      background: var(--border);
    }
    .stepper-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .qty-value {
      width: 32px;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
    }
    .line-total {
      font-weight: 700;
      font-size: 1rem;
      color: var(--accent);
    }
    .drawer-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid var(--border);
      background: var(--bg-main);
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .summary-row.total-row {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
      padding-top: 0.5rem;
      border-top: 1px dashed var(--border);
    }
    .cart-festive-coupon-hint {
      background: #fef3c7;
      border: 1px dashed #f59e0b;
      color: #92400e;
      border-radius: 8px;
      padding: 0.45rem 0.65rem;
      font-size: 0.76rem;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      line-height: 1.35;
    }
    .checkout-btn {
      width: 100%;
      margin-top: 0.75rem;
      padding: 0.85rem;
      font-size: 1rem;
    }
    @media (max-width: 480px) {
      .drawer-panel {
        max-width: 100vw;
      }
      .drawer-header {
        padding: 1rem;
      }
      .shipping-notice {
        padding: 0.75rem 1rem;
      }
      .items-list {
        padding: 1rem;
      }
      .drawer-footer {
        padding: 1rem;
      }
      .item-img {
        width: 70px;
        height: 70px;
      }
    }
  `]
})
export class CartDrawerComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  router = inject(Router);

  updateQuantity(itemId: number, quantity: number) {
    this.cartService.updateQuantity(itemId, quantity).subscribe();
  }

  removeItem(itemId: number) {
    this.cartService.removeItem(itemId).subscribe();
  }

  proceedToCheckout() {
    this.cartService.closeDrawer();
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
    } else {
      this.router.navigate(['/checkout']);
    }
  }

  signIn() {
    this.cartService.closeDrawer();
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }
}

