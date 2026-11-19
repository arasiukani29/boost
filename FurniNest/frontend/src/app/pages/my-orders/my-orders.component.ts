import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, Location, CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Order } from '../../models/furninest.models';
import { InvoiceModalComponent } from '../../components/invoice-modal/invoice-modal.component';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule, InvoiceModalComponent],
  template: `
    <div class="my-orders-page container animate-fade-in">
      <div class="page-header">
        <button (click)="goBack()" class="btn-back-link">
          ← Back to Store
        </button>
        <div>
          <span class="badge badge-amber">Client Account</span>
          <h1 class="page-title">My Furniture Orders</h1>
          <p class="page-subtitle">Track your artisanal crafting progress, view tax invoices, and manage device security.</p>
        </div>
      </div>

      <!-- Passkey Management Section -->
      <div class="passkey-mgmt-card animate-fade-in">
        <div class="passkey-info">
          <div class="passkey-icon-badge">⚡</div>
          <div>
            <h3>One-Click Passkey Login</h3>
            <p>Link this laptop or phone to sign in instantly with Touch ID, Face ID, or Windows Hello without typing a password.</p>
          </div>
        </div>

        <div class="passkey-action">
          <button 
            type="button" 
            class="btn btn-outline passkey-btn" 
            [disabled]="passkeyLoading()"
            (click)="onRegisterPasskey()"
          >
            @if (passkeyLoading()) {
              <span class="spinner-sm"></span> Awaiting Sensor...
            } @else {
              🔐 Register This Device as Passkey
            }
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <p>Loading your orders...</p>
        </div>
      } @else if (orders().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">🛋️</span>
          <h3>No orders placed yet</h3>
          <p>Ready to elevate your home with handcrafted solid wood furniture?</p>
          <a routerLink="/catalog" class="btn btn-accent">Explore Catalog</a>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of orders(); track order.id) {
            <div class="order-card">
              <!-- Order Header -->
              <div class="order-head">
                <div>
                  <span class="order-num">#{{ order.orderNumber }}</span>
                  <span class="order-date">{{ order.createdAt | date:'mediumDate' }}</span>
                </div>

                <div class="head-right">
                  <span class="status-badge" [class]="'status-' + order.status.toLowerCase()">
                    {{ formatStatus(order.status) }}
                  </span>
                  @if (canCancel(order)) {
                    <button (click)="onCancelOrder(order)" class="btn btn-outline btn-sm cancel-order-btn" title="Cancel this order and refund payment">
                      ✕ Cancel Order
                    </button>
                  }
                  <button (click)="selectedInvoiceOrder.set(order)" class="btn btn-outline btn-sm">
                    📄 GST Invoice
                  </button>
                  <a [routerLink]="['/order-confirmation', order.id]" class="btn btn-outline btn-sm">
                    Live Tracking →
                  </a>
                </div>
              </div>

              <!-- Items in this Order -->
              <div class="order-items">
                @for (item of order.items; track item.id) {
                  <div class="item-row">
                    <img [src]="item.productImageUrl" [alt]="item.productName" class="item-img" />
                    <div class="item-info">
                      <div class="name">{{ item.productName }}</div>
                      <div class="qty">Qty: {{ item.quantity }} × ₹{{ item.unitPrice.toLocaleString('en-IN') }}</div>
                    </div>
                    <div class="total">₹{{ item.totalPrice.toLocaleString('en-IN') }}</div>
                  </div>
                }
              </div>

              <!-- Order Footer -->
              <div class="order-foot">
                <div class="delivery-meta">
                  @if (order.trackingNumber) {
                    <span>📦 <strong>Carrier:</strong> {{ order.carrierName }} #{{ order.trackingNumber }}</span>
                  } @else {
                    <span>🚚 <strong>White-Glove Delivery:</strong> In preparation</span>
                  }
                  @if (order.paymentMethod === 'CashOnDelivery') {
                    <span class="badge badge-amber inline-badge ml-2">💵 Cash on Delivery</span>
                  }
                </div>
                <div class="grand-total">
                  <span>{{ order.paymentMethod === 'CashOnDelivery' && order.status !== 'Delivered' ? 'Amount Due on Arrival:' : 'Total Amount:' }}</span>
                  <strong>₹{{ order.totalAmount.toLocaleString('en-IN') }}</strong>
                </div>
              </div>
            </div>
          }
        </div>
      }

      @if (selectedInvoiceOrder()) {
        <app-invoice-modal [order]="selectedInvoiceOrder()!" (close)="selectedInvoiceOrder.set(null)" />
      }
    </div>
  `,
  styles: [`
    .my-orders-page {
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
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }
    .order-card {
      background: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .order-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      gap: 1rem;
    }
    .order-num {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--primary);
      margin-right: 0.75rem;
    }
    .order-date {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .head-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .status-badge {
      display: inline-block;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-placed { background: #dbeafe; color: #1e40af; }
    .status-incrafting { background: #fef3c7; color: #92400e; }
    .status-qualitycheck { background: #f3e8ff; color: #6b21a8; }
    .status-shipped { background: #ffedd5; color: #c2410c; }
    .status-delivered { background: #dcfce7; color: #166534; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    
    .order-items {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .item-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .item-img {
      width: 56px;
      height: 56px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }
    .item-info {
      flex: 1;
    }
    .item-info .name {
      font-weight: 600;
      font-size: 0.95rem;
    }
    .item-info .qty {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .item-row .total {
      font-weight: 700;
      font-size: 1rem;
    }
    .order-foot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
      background: #fafafa;
      font-size: 0.9rem;
    }
    .grand-total strong {
      font-size: 1.15rem;
      color: var(--primary);
      margin-left: 0.5rem;
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
      .my-orders-page {
        padding: 2rem 0 3.5rem;
      }
      .page-title {
        font-size: 1.85rem;
      }
      .order-head {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
      }
      .head-right {
        width: 100%;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .head-right .btn {
        flex: 1;
        min-width: 120px;
        text-align: center;
        justify-content: center;
      }
      .order-items {
        padding: 1rem;
      }
      .order-foot {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 1rem;
      }
      .grand-total {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
    }

    /* Passkey Management Card */
    .passkey-mgmt-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-md);
      padding: 1.25rem 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .passkey-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
      min-width: 260px;
    }
    .passkey-icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      flex-shrink: 0;
    }
    .passkey-info h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.2rem;
    }
    .passkey-info p {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.4;
    }
    .passkey-btn {
      font-size: 0.88rem;
      padding: 0.65rem 1.15rem;
      background: #ffffff;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .alert-success {
      background: #f0fdf4;
      border: 1px solid #86efac;
      color: #166534;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.88rem;
      margin-bottom: 1.5rem;
    }
    .alert-error {
      background: #fef2f2;
      border: 1px solid #fca5a5;
      color: #991b1b;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.88rem;
      margin-bottom: 1.5rem;
    }
    .spinner-sm {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .cancel-order-btn {
      color: #dc2626;
      border-color: #fca5a5;
      background: #fff;
    }
    .cancel-order-btn:hover {
      background: #fee2e2;
      border-color: #ef4444;
      color: #991b1b;
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private location = inject(Location);
  private router = inject(Router);

  orders = signal<Order[]>([]);
  loading = signal<boolean>(true);
  selectedInvoiceOrder = signal<Order | null>(null);

  passkeyLoading = signal<boolean>(false);
  passkeySuccess = signal<string>('');
  passkeyError = signal<string>('');

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getMyOrders().subscribe({
      next: res => {
        this.orders.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  canCancel(order: Order): boolean {
    return order.status === 'Placed' || order.status === 'InCrafting';
  }

  onCancelOrder(order: Order) {
    const isCod = order.paymentMethod === 'CashOnDelivery';

    this.notification.confirm({
      title: 'Cancel Furniture Order?',
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      message: isCod
        ? `Are you sure you want to cancel Cash on Delivery Order #${order.orderNumber}?`
        : `Are you sure you want to cancel Order #${order.orderNumber}?`,
      subMessage: isCod
        ? 'The order reservation will be cancelled and handcrafted furniture piece(s) immediately returned to workshop inventory. Zero payment is due.'
        : `A full refund of ₹${order.totalAmount.toLocaleString('en-IN')} will be initiated to your original payment method, and the furniture piece(s) returned to stock.`,
      confirmText: 'Yes, Cancel Order',
      cancelText: 'Keep My Order',
      type: 'danger',
      icon: '✕'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.orderService.cancelOrder(order.id, 'Customer requested cancellation via My Orders').subscribe({
        next: (updated) => {
          this.notification.success(isCod
            ? `Order #${updated.orderNumber} has been successfully cancelled.`
            : `Order #${updated.orderNumber} has been cancelled and refund initiated.`);
          this.loadOrders();
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Failed to cancel order.');
        }
      });
    });
  }

  async onRegisterPasskey() {
    if (!this.authService.isWebAuthnSupported()) {
      this.passkeyError.set('Biometric/Passkey authentication is not supported by your current browser.');
      return;
    }

    this.passkeyLoading.set(true);
    this.passkeySuccess.set('');
    this.passkeyError.set('');

    this.authService.getPasskeyRegisterChallenge().subscribe({
      next: async (challengeRes) => {
        try {
          const challengeBuffer = this.base64ToArrayBuffer(challengeRes.challenge);
          const userIdBuffer = challengeRes.userId 
            ? this.base64ToArrayBuffer(challengeRes.userId) 
            : new TextEncoder().encode(challengeRes.userName || 'user');

          const credential = (await navigator.credentials.create({
            publicKey: {
              challenge: challengeBuffer,
              rp: {
                name: challengeRes.rpName || 'FurniNest',
                id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname
              },
              user: {
                id: userIdBuffer,
                name: challengeRes.userName || 'user@furninest.com',
                displayName: challengeRes.userDisplayName || 'FurniNest Customer'
              },
              pubKeyCredParams: [
                { alg: -7, type: 'public-key' },  // ES256
                { alg: -257, type: 'public-key' } // RS256
              ],
              authenticatorSelection: {
                residentKey: 'preferred',
                requireResidentKey: false,
                userVerification: 'preferred'
              },
              timeout: 60000
            }
          })) as PublicKeyCredential;

          if (!credential) {
            this.passkeyLoading.set(false);
            this.notification.warn('Passkey setup was cancelled.');
            return;
          }

          const credId = credential.id || this.arrayBufferToBase64(credential.rawId);
          const attestationResponse = credential.response as AuthenticatorAttestationResponse;
          const publicKeyBase64 = attestationResponse?.attestationObject 
            ? this.arrayBufferToBase64(attestationResponse.attestationObject)
            : '';

          this.authService.verifyPasskeyRegister({
            credentialId: credId,
            publicKey: publicKeyBase64,
            deviceName: navigator.userAgent.includes('Windows') ? 'Windows Hello / PC' : 'Biometric Device'
          }).subscribe({
            next: (res) => {
              this.passkeyLoading.set(false);
              this.notification.success('Passkey registered successfully! You can now sign in with biometrics on this device.', 'Dismiss', undefined, 'Biometrics Linked');
            },
            error: (err) => {
              this.passkeyLoading.set(false);
              this.notification.error(err.error?.message || 'Failed to save passkey on server.');
            }
          });
        } catch (err: any) {
          this.passkeyLoading.set(false);
          if (err.name === 'NotAllowedError') {
            this.notification.warn('Passkey prompt was cancelled or timed out.');
          } else {
            this.notification.error(err.message || 'Passkey enrollment failed.');
          }
        }
      },
      error: (err) => {
        this.passkeyLoading.set(false);
        this.notification.error(err.error?.message || 'Failed to initialize passkey challenge.');
      }
    });
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    let normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4 !== 0) {
      normalized += '=';
    }
    const binary = window.atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'Placed': return 'Order Placed';
      case 'InCrafting': return '🔨 In Crafting';
      case 'QualityCheck': return '🔍 Quality Check';
      case 'Shipped': return '🚚 Dispatched';
      case 'Delivered': return '✓ Delivered';
      case 'Cancelled': return 'Cancelled';
      default: return status;
    }
  }
}
