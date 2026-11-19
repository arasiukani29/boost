import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { CouponService } from '../../services/coupon.service';
import { NotificationService } from '../../services/notification.service';
import { CelebrationService } from '../../services/celebration.service';
import { Coupon } from '../../models/furninest.models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="checkout-page container animate-fade-in">
      <div class="checkout-header">
        <button (click)="goBack()" class="btn-back-link">
          ← Back to Bag / Catalog
        </button>
        <h1 class="page-title">Secure White-Glove Checkout</h1>
        <p class="page-subtitle">Complete your shipping and delivery preferences.</p>
      </div>

      <div class="checkout-layout">
        <!-- Form Section -->
        <div class="form-section">
          <!-- Step 1: Shipping -->
          <div class="card checkout-card">
            <div class="card-header">
              <span class="step-num">1</span>
              <h3>Delivery & Shipping Address</h3>
            </div>

            <div class="card-body">
              <div class="form-group">
                <label class="form-label">Recipient Full Name</label>
                <input type="text" [(ngModel)]="recipientName" class="form-input" placeholder="Sarah Jenkins" />
              </div>

              <div class="form-group">
                <label class="form-label">Delivery Street Address</label>
                <input type="text" [(ngModel)]="shippingAddress" class="form-input" placeholder="B-402, Shivalik Residency, S.G. Highway" />
              </div>

              <div class="form-row-3">
                <div class="form-group">
                  <label class="form-label">City</label>
                  <input type="text" [(ngModel)]="city" class="form-input" placeholder="Ahmedabad" />
                </div>
                <div class="form-group">
                  <label class="form-label">State</label>
                  <input type="text" [(ngModel)]="state" class="form-input" placeholder="Gujarat" />
                </div>
                <div class="form-group">
                  <label class="form-label">PIN Code</label>
                  <input type="text" [(ngModel)]="postalCode" class="form-input" placeholder="380054" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Contact Phone (For delivery coordination)</label>
                <input type="tel" [(ngModel)]="phone" class="form-input" placeholder="+91 98765 43210" />
              </div>

              <div class="form-group">
                <label class="form-label">Delivery Instructions (Optional)</label>
                <textarea [(ngModel)]="notes" rows="2" class="form-textarea" placeholder="e.g., Gate code #4021 or leave at front porch entryway"></textarea>
              </div>
            </div>
          </div>

          <!-- Step 2: Payment Simulation -->
          <div class="card checkout-card">
            <div class="card-header">
              <span class="step-num">2</span>
              <h3>Payment Method</h3>
              <span class="badge badge-green">🔒 256-Bit SSL Encrypted</span>
            </div>

            <div class="card-body">
              <div class="payment-tabs">
                <button 
                  type="button" 
                  (click)="selectedPaymentMethod.set('card')" 
                  class="pay-option" 
                  [class.selected]="selectedPaymentMethod() === 'card'">
                  <span class="radio-dot"></span>
                  <span>💳 Credit or Debit Card</span>
                </button>
                <button 
                  type="button" 
                  (click)="selectedPaymentMethod.set('cod')" 
                  class="pay-option" 
                  [class.selected]="selectedPaymentMethod() === 'cod'">
                  <span class="radio-dot"></span>
                  <span>💵 Cash on Delivery (COD)</span>
                </button>
              </div>

              @if (selectedPaymentMethod() === 'card') {
                <div class="form-group">
                  <label class="form-label">Card Number</label>
                  <input type="text" [(ngModel)]="cardNumber" class="form-input" placeholder="4242 •••• •••• 4242" />
                </div>

                <div class="form-row-2">
                  <div class="form-group">
                    <label class="form-label">Expiry Date</label>
                    <input type="text" [(ngModel)]="cardExpiry" class="form-input" placeholder="MM / YY" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Security CVC</label>
                    <input type="text" [(ngModel)]="cardCvc" class="form-input" placeholder="123" />
                  </div>
                </div>

                <p class="demo-notice">
                  ℹ️ <strong>Demo Mode:</strong> You can test with test card <code>4242 4242 4242 4242</code>, expiry <code>12/28</code>, CVC <code>123</code>.
                </p>
              } @else {
                <div class="cod-notice-card animate-fade-in">
                  <div class="cod-icon">🚚💵</div>
                  <div class="cod-content">
                    <h4>Pay at Your Doorstep</h4>
                    <p>Pay with Cash, UPI, or QR code directly to our White-Glove delivery and installation crew when your handcrafted furniture arrives.</p>
                    <span class="badge badge-green">✓ Zero Advance Payment Required</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Order Summary Side Panel -->
        <div class="summary-section">
          <div class="card summary-card">
            <h3 class="summary-title">Order Summary</h3>

            <div class="summary-items">
              @for (item of cartService.cart().items; track item.id) {
                <div class="order-summary-item">
                  <img [src]="item.primaryImageUrl" [alt]="item.productName" class="item-thumb" />
                  <div class="item-info">
                    <div class="item-name">{{ item.productName }}</div>
                    <div class="item-qty">Qty: {{ item.quantity }} × ₹{{ item.price.toLocaleString('en-IN') }}</div>
                  </div>
                  <div class="item-total">₹{{ item.lineTotal.toLocaleString('en-IN') }}</div>
                </div>
              }
            </div>

            <!-- Coupon Code Section -->
            <div class="coupon-box" [class.coupon-applied-box]="couponValid()">
              @if (couponValid()) {
                <div class="coupon-celebration-card animate-celebration">
                  <div class="celebration-badge-row">
                    <span class="celebration-sparkle">✨ 🎉 ✨</span>
                    <span class="celebration-tag">FESTIVE OFFER APPLIED</span>
                  </div>
                  <div class="celebration-details">
                    <div class="code-and-savings">
                      <strong class="applied-code">{{ appliedCouponCode }}</strong>
                      <span class="savings-amount">-₹{{ discountAmount().toLocaleString('en-IN') }} OFF</span>
                    </div>
                    <p class="celebration-msg">{{ couponMessage() }}</p>
                  </div>
                  <button type="button" (click)="removeCoupon()" class="btn-remove-coupon" title="Remove voucher">
                    ✕ Remove Voucher
                  </button>
                </div>
              } @else {
                <label class="form-label">Have a Promo Voucher?</label>
                <div class="coupon-input-group">
                  <input 
                    type="text" 
                    [(ngModel)]="couponInput" 
                    (keydown.enter)="applyCoupon()"
                    placeholder="e.g. DIWALI50, FESTIVE25" 
                    class="form-input coupon-input" />
                  <button (click)="applyCoupon()" class="btn btn-accent btn-sm apply-btn">
                    Apply
                  </button>
                </div>

                <!-- Available Vouchers -->
                <div class="vouchers-label">
                  <span>🎁 Available Festive Coupons (Tap to Apply):</span>
                </div>
                <div class="coupon-suggestions">
                  @for (c of activeCoupons(); track c.id) {
                    <button 
                      type="button" 
                      (click)="useSuggestion(c.code)" 
                      class="coupon-pill"
                      [title]="c.description"
                    >
                      <span class="pill-badge">{{ c.discountPercent }}% OFF</span>
                      <span class="pill-code">{{ c.code }}</span>
                    </button>
                  }
                </div>

                @if (couponMessage()) {
                  <div class="coupon-msg" [class.success]="couponValid()" [class.error]="!couponValid()">
                    {{ couponMessage() }}
                  </div>
                }
              }
            </div>

            <div class="summary-totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>₹{{ cartService.cart().subtotal.toLocaleString('en-IN') }}</span>
              </div>
              @if (discountAmount() > 0) {
                <div class="total-row discount-row">
                  <span>Coupon Discount ({{ appliedCouponCode }})</span>
                  <span>-₹{{ discountAmount().toLocaleString('en-IN') }}</span>
                </div>
              }
              <div class="total-row">
                <span>White-Glove Delivery</span>
                <span>{{ calculatedShipping() === 0 ? 'FREE' : ('₹' + calculatedShipping().toLocaleString('en-IN')) }}</span>
              </div>
              <div class="total-row">
                <span>GST (5%)</span>
                <span>₹{{ calculatedTax().toLocaleString('en-IN') }}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total Amount</span>
                <span>₹{{ calculatedTotal().toLocaleString('en-IN') }}</span>
              </div>
            </div>

            <button 
              (click)="placeOrder()" 
              [disabled]="submitting() || cartService.cart().items.length === 0" 
              class="btn btn-accent btn-submit-order">
              @if (submitting()) {
                <span>Authorizing & Crafting Order...</span>
              } @else if (selectedPaymentMethod() === 'cod') {
                <span>Place Cash on Delivery Order (₹{{ calculatedTotal().toLocaleString('en-IN') }}) →</span>
              } @else {
                <span>Authorize & Place Order (₹{{ calculatedTotal().toLocaleString('en-IN') }}) →</span>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page {
      padding: 3.5rem 0 5rem;
    }
    .checkout-header {
      margin-bottom: 2.5rem;
    }
    .btn-back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-main);
      background: var(--bg-surface);
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      margin-bottom: 1rem;
      transition: all 0.2s;
    }
    .btn-back-link:hover {
      background: var(--border);
      color: var(--accent);
    }
    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.35rem;
      color: var(--text-main);
    }
    .page-subtitle {
      color: var(--text-muted);
      font-size: 1.05rem;
    }
    .checkout-layout {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 3rem;
      align-items: start;
    }
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      color: var(--text-main);
    }
    .checkout-card {
      margin-bottom: 2rem;
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid var(--border);
    }
    .step-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--accent);
      color: #0b0f19;
      font-size: 0.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-header h3 {
      font-size: 1.2rem;
      font-weight: 700;
      flex: 1;
      color: var(--text-main);
    }
    .card-body {
      padding: 1.75rem;
    }
    .form-row-3 {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr;
      gap: 1rem;
    }
    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .payment-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .pay-option {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.85rem 1rem;
      border: 1px solid var(--border);
      background: var(--bg-surface);
      border-radius: var(--radius-sm);
      font-weight: 500;
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }
    .pay-option.selected {
      border: 2px solid var(--accent);
      background: var(--accent-light);
      font-weight: 600;
      color: var(--accent);
    }
    .pay-option:hover {
      border-color: var(--accent);
    }
    .radio-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid var(--border);
      background: #fff;
      display: inline-block;
      flex-shrink: 0;
    }
    .pay-option.selected .radio-dot {
      border-color: var(--accent);
      background: var(--accent);
    }
    .cod-notice-card {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: var(--radius-sm);
      margin-top: 0.5rem;
    }
    .cod-icon {
      font-size: 2rem;
      line-height: 1;
    }
    .cod-content h4 {
      font-size: 1rem;
      color: #166534;
      margin-bottom: 0.25rem;
    }
    .cod-content p {
      font-size: 0.85rem;
      color: #15803d;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }
    .demo-notice {
      margin-top: 1rem;
      background: var(--bg-surface);
      padding: 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      color: var(--text-muted);
      border: 1px solid var(--border);
    }
    .demo-notice code {
      background: var(--bg-card);
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
      font-family: monospace;
      color: var(--accent);
      border: 1px solid var(--border);
    }
    .summary-card {
      padding: 1.75rem;
      position: sticky;
      top: 90px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-main);
    }
    .coupon-box {
      background: var(--bg-surface);
      border: 1px dashed var(--border);
      border-radius: var(--radius-sm);
      padding: 1rem;
      margin-bottom: 1.25rem;
      transition: all 0.3s ease;
    }
    .coupon-applied-box {
      background: rgba(16, 185, 129, 0.1) !important;
      border: 1.5px solid #10b981 !important;
      box-shadow: 0 4px 15px -3px rgba(16, 185, 129, 0.15);
    }
    .coupon-celebration-card {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    @keyframes celebrationPop {
      0% { transform: scale(0.92); opacity: 0; }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-celebration {
      animation: celebrationPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .celebration-badge-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .celebration-sparkle {
      font-size: 1.1rem;
    }
    .celebration-tag {
      font-size: 0.72rem;
      font-weight: 800;
      color: #10b981;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .code-and-savings {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.2rem;
    }
    .applied-code {
      font-size: 1.15rem;
      font-weight: 800;
      color: #10b981;
      letter-spacing: 0.05em;
      background: rgba(16, 185, 129, 0.15);
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      border: 1px dashed #10b981;
    }
    .savings-amount {
      font-size: 1.1rem;
      font-weight: 800;
      color: #10b981;
    }
    .celebration-msg {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.35;
    }
    .btn-remove-coupon {
      align-self: flex-start;
      margin-top: 0.4rem;
      background: none;
      border: none;
      color: #ef4444;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
    }
    .btn-remove-coupon:hover {
      color: #dc2626;
    }
    .coupon-input-group {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.65rem;
    }
    .coupon-input {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
    }
    .vouchers-label {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 0.4rem;
    }
    .coupon-suggestions {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-bottom: 0.5rem;
    }
    .coupon-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.74rem;
      color: var(--accent);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .coupon-pill:hover {
      background: var(--accent-light);
      border-color: var(--accent);
      transform: translateY(-1px);
    }
    .pill-badge {
      background: var(--accent);
      color: #0b0f19;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 1px 4px;
      border-radius: 4px;
      letter-spacing: 0.02em;
    }
    .pill-code {
      font-weight: 800;
    }
    .coupon-msg {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.35rem 0.5rem;
      border-radius: 4px;
    }
    .coupon-msg.success {
      background: #dcfce7;
      color: #166534;
    }
    .coupon-msg.error {
      background: #fee2e2;
      color: #991b1b;
    }
    .discount-row {
      color: #166534;
      font-weight: 600;
    }
    .summary-title {
      font-size: 1.3rem;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }
    .summary-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
      max-height: 280px;
      overflow-y: auto;
    }
    .order-summary-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .item-thumb {
      width: 52px;
      height: 52px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }
    .item-info {
      flex: 1;
    }
    .item-name {
      font-size: 0.88rem;
      font-weight: 600;
    }
    .item-qty {
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .item-total {
      font-weight: 700;
      font-size: 0.95rem;
    }
    .summary-totals {
      border-top: 1px solid var(--border);
      padding-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .grand-total {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--primary);
      padding-top: 0.75rem;
      border-top: 1px dashed var(--border);
    }
    .btn-submit-order {
      width: 100%;
      padding: 1rem;
      font-size: 1.05rem;
    }
    .error-banner {
      background: #fee2e2;
      border: 1px solid #fca5a5;
      color: #991b1b;
      padding: 0.75rem;
      border-radius: var(--radius-sm);
      margin-bottom: 1rem;
      font-size: 0.85rem;
    }
    @media (max-width: 900px) {
      .checkout-page {
        padding: 1.5rem 0 3.5rem;
      }
      .page-title {
        font-size: 1.85rem;
      }
      .checkout-layout {
        grid-template-columns: 1fr;
        gap: 1.75rem;
      }
      .card-body {
        padding: 1.15rem;
      }
      .card-header {
        padding: 1rem 1.15rem;
      }
      .form-row-3, .form-row-2 {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
      .summary-card {
        position: static;
        padding: 1.25rem;
      }
    }
    @media (max-width: 480px) {
      .coupon-input-group {
        flex-direction: column;
      }
      .coupon-input-group .btn {
        width: 100%;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private couponService = inject(CouponService);
  private router = inject(Router);
  private location = inject(Location);
  private notification = inject(NotificationService);
  private celebration = inject(CelebrationService);

  activeCoupons = signal<Coupon[]>([]);

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/catalog']);
    }
  }

  recipientName = '';
  shippingAddress = '';
  city = '';
  state = '';
  postalCode = '';
  phone = '';
  notes = '';

  cardNumber = '4242 4242 4242 4242';
  cardExpiry = '12/28';
  cardCvc = '123';
  selectedPaymentMethod = signal<'card' | 'cod'>('card');

  // Coupon state
  couponInput = '';
  appliedCouponCode: string | null = null;
  discountAmount = signal<number>(0);
  couponValid = signal<boolean>(false);
  couponMessage = signal<string>('');

  // Dynamically calculated order totals with coupon
  effectiveSubtotal = computed(() => {
    return Math.max(0, this.cartService.cart().subtotal - this.discountAmount());
  });

  calculatedShipping = computed(() => {
    const sub = this.effectiveSubtotal();
    return sub > 0 ? (sub >= 25000 ? 0 : 1499) : 0;
  });

  calculatedTax = computed(() => {
    return Math.round(this.effectiveSubtotal() * 0.05);
  });

  calculatedTotal = computed(() => {
    return this.effectiveSubtotal() + this.calculatedShipping() + this.calculatedTax();
  });

  submitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.recipientName = user.fullName || '';
      this.shippingAddress = user.address || 'B-402, Shivalik Residency, S.G. Highway';
      this.city = user.city || 'Ahmedabad';
      this.state = 'Gujarat';
      this.postalCode = user.postalCode || '380054';
      this.phone = user.phoneNumber || '+91 98765 43210';
    }

    this.couponService.getActiveCoupons().subscribe({
      next: coupons => this.activeCoupons.set(coupons)
    });
  }

  useSuggestion(code: string) {
    this.couponInput = code;
    this.applyCoupon();
  }

  applyCoupon() {
    if (!this.couponInput.trim()) return;

    this.couponService.validateCoupon(this.couponInput, this.cartService.cart().subtotal).subscribe({
      next: res => {
        this.couponValid.set(res.isValid);
        this.couponMessage.set(res.message);
        if (res.isValid) {
          this.discountAmount.set(res.discountAmount);
          this.appliedCouponCode = res.code;
          // Launch Grand Confetti Celebration!
          this.celebration.celebrate();
          this.notification.success(
            `🎉 Festive Voucher Applied! You saved ₹${res.discountAmount.toLocaleString('en-IN')}`, 
            'Dismiss', 
            undefined, 
            'Festive Celebration Savings'
          );
        } else {
          this.discountAmount.set(0);
          this.appliedCouponCode = null;
          this.notification.warn(res.message);
        }
      },
      error: () => {
        this.couponValid.set(false);
        this.couponMessage.set('Failed to validate voucher code.');
        this.notification.error('Failed to validate voucher code.');
      }
    });
  }

  removeCoupon() {
    this.discountAmount.set(0);
    this.appliedCouponCode = null;
    this.couponValid.set(false);
    this.couponMessage.set('');
    this.couponInput = '';
    this.notification.info('Voucher removed. You can select another coupon code.');
  }

  placeOrder() {
    if (!this.shippingAddress || !this.city || !this.postalCode || !this.phone) {
      this.notification.warn('Please fill in all shipping address fields.');
      return;
    }

    this.submitting.set(true);

    const isCod = this.selectedPaymentMethod() === 'cod';

    this.orderService.checkout({
      recipientName: this.recipientName,
      shippingAddress: this.shippingAddress,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      phone: this.phone,
      paymentMethod: isCod ? 'CashOnDelivery' : 'CreditCard',
      cardNumber: isCod ? '0000000000000000' : this.cardNumber,
      cardExpiry: isCod ? '12/99' : this.cardExpiry,
      cardCvc: isCod ? '000' : this.cardCvc,
      notes: this.notes,
      couponCode: this.appliedCouponCode || undefined
    }).subscribe({
      next: order => {
        this.submitting.set(false);
        this.cartService.refreshCart();
        this.notification.success('Your order has been verified and registered with our workshop!', 'View Order', undefined, 'Order Placed');
        this.router.navigate(['/order-confirmation', order.id]);
      },
      error: err => {
        this.submitting.set(false);
        this.notification.error(err.error?.message || 'Failed to authorize and place order. Please try again.');
      }
    });
  }
}

