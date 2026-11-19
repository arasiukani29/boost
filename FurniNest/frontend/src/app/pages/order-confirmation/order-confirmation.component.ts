import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';
import { Order } from '../../models/furninest.models';
import { InvoiceModalComponent } from '../../components/invoice-modal/invoice-modal.component';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, InvoiceModalComponent],
  template: `
    <div class="confirmation-page container animate-fade-in">
      @if (loading()) {
        <div class="loading-state">
          <p>Retrieving order confirmation...</p>
        </div>
      } @else if (order()) {
        @if (order()!.status === 'Cancelled') {
          <div class="cancelled-banner animate-fade-in">
            <div class="cancelled-circle">✕</div>
            <span class="badge badge-red">Order Cancelled</span>
            <h1 class="page-title">Order #{{ order()!.orderNumber }} Has Been Cancelled</h1>
            <p class="order-subtitle">
              @if (order()!.paymentMethod === 'CashOnDelivery') {
                This Cash on Delivery order has been successfully cancelled and the reserved pieces returned to our workshop inventory.
              } @else {
                A full refund of <strong>₹{{ order()!.totalAmount.toLocaleString('en-IN') }}</strong> has been initiated to your original payment method. The reserved pieces have been returned to our inventory.
              }
            </p>
          </div>
        } @else {
          <div class="success-banner">
            <div class="icon-circle">✓</div>
            <span class="badge badge-green">Order Confirmed</span>
            <h1 class="page-title">Thank You For Choosing FurniNest</h1>
            <p class="order-subtitle">
              Order <strong>#{{ order()!.orderNumber }}</strong> has been verified and registered with our master craft workshop.
            </p>
          </div>
        }

        <!-- Live Order Status Tracker Stepper -->
        @if (order()!.status !== 'Cancelled') {
          <div class="card status-card">
            <div class="status-card-header">
              <h3 class="status-card-title">Live Fulfillment Progress</h3>
              <div class="status-header-actions">
                @if (canCancel()) {
                  <button (click)="onCancelOrder()" class="btn-cancel-header" title="Cancel this order">
                    ✕ Cancel Order
                  </button>
                }
                <button (click)="refreshStatus(true)" class="btn-refresh-status" [disabled]="refreshing()">
                  <span [class.spin]="refreshing()">🔄</span> {{ refreshing() ? 'Checking...' : 'Check Live Status' }}
                </button>
              </div>
            </div>

            <div class="stepper-timeline">
            <!-- Step 1: Placed -->
            <div class="step-item" [class.completed]="isStepPassed('Placed')" [class.active]="order()!.status === 'Placed'">
              <div class="step-circle">1</div>
              <div class="step-content">
                <strong>Order Placed</strong>
                <span>Payment authorized</span>
              </div>
            </div>

            <div class="step-connector" [class.filled]="isStepPassed('InCrafting')"></div>

            <!-- Step 2: InCrafting -->
            <div class="step-item" [class.completed]="isStepPassed('InCrafting')" [class.active]="order()!.status === 'InCrafting'">
              <div class="step-circle">2</div>
              <div class="step-content">
                <strong>In Crafting</strong>
                <span>Artisan joinery & shaping</span>
              </div>
            </div>

            <div class="step-connector" [class.filled]="isStepPassed('QualityCheck')"></div>

            <!-- Step 3: QualityCheck -->
            <div class="step-item" [class.completed]="isStepPassed('QualityCheck')" [class.active]="order()!.status === 'QualityCheck'">
              <div class="step-circle">3</div>
              <div class="step-content">
                <strong>Quality Inspection</strong>
                <span>Finish & stability test</span>
              </div>
            </div>

            <div class="step-connector" [class.filled]="isStepPassed('Shipped')"></div>

            <!-- Step 4: Shipped -->
            <div class="step-item" [class.completed]="isStepPassed('Shipped')" [class.active]="order()!.status === 'Shipped'">
              <div class="step-circle">4</div>
              <div class="step-content">
                <strong>Dispatched / Shipped</strong>
                <span>{{ order()!.carrierName || 'White-Glove Fleet' }}</span>
              </div>
            </div>

            <div class="step-connector" [class.filled]="isStepPassed('Delivered')"></div>

            <!-- Step 5: Delivered -->
            <div class="step-item" [class.completed]="isStepPassed('Delivered')" [class.active]="order()!.status === 'Delivered'">
              <div class="step-circle">5</div>
              <div class="step-content">
                <strong>Delivered</strong>
                <span>Room setup complete</span>
              </div>
            </div>
          </div>

          @if (order()!.trackingNumber) {
            <div class="tracking-pill">
              📦 Tracking: <strong>{{ order()!.carrierName }} #{{ order()!.trackingNumber }}</strong>
            </div>
          }
        </div>
        }

        <!-- Details Grid -->
        <div class="details-grid">
          <!-- Items Ordered -->
          <div class="card detail-card">
            <h3>Handcrafted Items ({{ order()!.items.length }})</h3>
            <div class="items-list">
              @for (item of order()!.items; track item.id) {
                <div class="order-item-row">
                  <img [src]="item.productImageUrl" [alt]="item.productName" class="item-img" />
                  <div class="item-meta">
                    <h4>{{ item.productName }}</h4>
                    <span class="meta-sub">Qty: {{ item.quantity }} × ₹{{ item.unitPrice.toLocaleString('en-IN') }}</span>
                  </div>
                  <div class="meta-price">₹{{ item.totalPrice.toLocaleString('en-IN') }}</div>
                </div>
              }
            </div>

            <div class="cost-breakdown">
              <div class="cost-row">
                <span>Subtotal</span>
                <span>₹{{ order()!.subtotal.toLocaleString('en-IN') }}</span>
              </div>
              <div class="cost-row">
                <span>White-Glove Delivery</span>
                <span>{{ order()!.shippingFee === 0 ? 'FREE' : ('₹' + order()!.shippingFee.toLocaleString('en-IN')) }}</span>
              </div>
              <div class="cost-row">
                <span>GST (5%)</span>
                <span>₹{{ order()!.tax.toLocaleString('en-IN') }}</span>
              </div>
              <div class="cost-row cost-total">
                <span>{{ order()!.paymentMethod === 'CashOnDelivery' && order()!.status !== 'Delivered' ? 'Total (Due on Delivery)' : 'Total Paid' }}</span>
                <span>₹{{ order()!.totalAmount.toLocaleString('en-IN') }}</span>
              </div>
            </div>
          </div>

          <!-- Shipping Destination -->
          <div class="card detail-card">
            <h3>Delivery Destination</h3>
            <div class="address-box">
              <p class="recipient"><strong>{{ order()!.recipientName }}</strong></p>
              <p>{{ order()!.shippingAddress }}</p>
              <p>{{ order()!.city }}, {{ order()!.state }} {{ order()!.postalCode }}</p>
              <p class="phone-line">📞 {{ order()!.phone }}</p>

              @if (order()!.notes) {
                <div class="notes-box">
                  <strong>Delivery Instructions:</strong>
                  <p>{{ order()!.notes }}</p>
                </div>
              }
            </div>

            <div class="actions-panel">
              <button (click)="showInvoice.set(true)" class="btn btn-accent full-btn">
                📄 View & Print GST Tax Invoice
              </button>
              <a routerLink="/my-orders" class="btn btn-outline full-btn">View All My Orders</a>
              <a routerLink="/catalog" class="btn btn-primary full-btn">Continue Exploring Collection</a>
            </div>
          </div>
        </div>

        @if (showInvoice()) {
          <app-invoice-modal [order]="order()!" (close)="showInvoice.set(false)" />
        }
      }
    </div>
  `,
  styles: [`
    .confirmation-page {
      padding: 3.5rem 0 5rem;
    }
    .success-banner {
      text-align: center;
      margin-bottom: 3rem;
    }
    .cancelled-banner {
      text-align: center;
      margin-bottom: 3rem;
      background: #fffdfd;
      border: 1px solid #fee2e2;
      border-radius: var(--radius-md);
      padding: 2.5rem 1.5rem;
    }
    .cancelled-circle {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: #fee2e2;
      color: #991b1b;
      font-size: 2rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }
    .status-header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .btn-cancel-header {
      font-size: 0.82rem;
      font-weight: 700;
      color: #dc2626;
      background: #fee2e2;
      border: 1px solid #fca5a5;
      padding: 0.35rem 0.8rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-cancel-header:hover {
      background: #dc2626;
      color: #ffffff;
    }
    .icon-circle {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: #dcfce7;
      color: #166534;
      font-size: 2rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }
    .page-title {
      font-size: 2.75rem;
      font-weight: 700;
      margin: 0.75rem 0 0.5rem;
    }
    .order-subtitle {
      font-size: 1.1rem;
      color: var(--text-muted);
    }
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      color: var(--text-main);
    }
    .status-card {
      margin-bottom: 2.5rem;
    }
    .status-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .status-card-title {
      font-size: 1.25rem;
      margin-bottom: 0;
      color: var(--text-main);
    }
    .btn-refresh-status {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--accent);
      background: var(--bg-surface);
      padding: 0.35rem 0.8rem;
      border-radius: 9999px;
      border: 1px solid var(--border);
      transition: all 0.2s;
    }
    .btn-refresh-status:hover {
      background: var(--border);
    }
    .spin {
      display: inline-block;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
    .stepper-timeline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 900px;
      margin: 0 auto;
      position: relative;
    }
    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
      position: relative;
      z-index: 2;
    }
    .step-circle {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--bg-surface);
      color: var(--text-muted);
      border: 1px solid var(--border);
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: all 0.3s;
    }
    .step-item.completed .step-circle {
      background: #166534;
      color: #ffffff;
      border-color: #166534;
    }
    .step-item.active .step-circle {
      background: var(--accent);
      color: #ffffff;
      border-color: var(--accent);
      box-shadow: 0 0 0 4px var(--accent-light);
    }
    .step-content strong {
      display: block;
      font-size: 0.9rem;
      color: var(--text-main);
    }
    .step-content span {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .step-connector {
      flex: 1;
      height: 4px;
      background: var(--border);
      margin: 0 0.5rem;
      margin-bottom: 2rem;
      transition: background 0.3s;
    }
    .step-connector.filled {
      background: #166534;
    }
    .tracking-pill {
      text-align: center;
      margin-top: 1.75rem;
      background: var(--bg-surface);
      padding: 0.65rem 1rem;
      border-radius: 9999px;
      display: inline-block;
      border: 1px solid var(--border);
      font-size: 0.9rem;
      color: var(--text-main);
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2rem;
    }
    .detail-card h3 {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
      color: var(--text-main);
    }
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 1.75rem;
    }
    .order-item-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .item-img {
      width: 64px;
      height: 64px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }
    .item-meta {
      flex: 1;
    }
    .item-meta h4 {
      font-size: 0.95rem;
      font-weight: 600;
      margin-bottom: 0.2rem;
      color: var(--text-main);
    }
    .meta-sub {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .meta-price {
      font-weight: 700;
      font-size: 1rem;
      color: var(--text-main);
    }
    .cost-breakdown {
      border-top: 1px solid var(--border);
      padding-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .cost-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .cost-total {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      padding-top: 0.5rem;
      border-top: 1px dashed var(--border);
    }
    .address-box {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text-muted);
      margin-bottom: 2rem;
    }
    .recipient {
      font-size: 1.05rem;
      color: var(--text-main);
    }
    .phone-line {
      margin-top: 0.5rem;
      font-weight: 500;
      color: var(--text-main);
    }
    .notes-box {
      margin-top: 1rem;
      background: var(--bg-surface);
      padding: 0.75rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .actions-panel {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .full-btn {
      width: 100%;
    }
    @media (max-width: 900px) {
      .order-conf-page {
        padding: 2rem 0 3.5rem;
      }
      .success-title {
        font-size: 1.85rem;
      }
      .details-grid {
        grid-template-columns: 1fr;
      }
      .stepper-timeline {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.25rem;
        padding: 0 0.5rem;
      }
      .step-item {
        flex-direction: row;
        text-align: left;
        gap: 1rem;
      }
      .step-connector {
        display: none;
      }
    }
  `]
})
export class OrderConfirmationComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private notification = inject(NotificationService);

  order = signal<Order | null>(null);
  loading = signal<boolean>(true);
  refreshing = signal<boolean>(false);
  showInvoice = signal<boolean>(false);

  private readonly stepsOrder = ['Placed', 'InCrafting', 'QualityCheck', 'Shipped', 'Delivered'];
  private pollInterval: any = null;
  private currentOrderId = 0;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.currentOrderId = id;
        this.loadOrder(id);

        // Auto poll for live updates every 10 seconds
        this.pollInterval = setInterval(() => {
          this.refreshStatus(false);
        }, 10000);
      }
    });
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  loadOrder(id: number) {
    this.orderService.getOrderById(id).subscribe({
      next: o => {
        this.order.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  refreshStatus(userTriggered = false) {
    if (!this.currentOrderId) return;
    if (userTriggered) this.refreshing.set(true);

    const prevStatus = this.order()?.status;

    this.orderService.getOrderById(this.currentOrderId).subscribe({
      next: o => {
        if (userTriggered) this.refreshing.set(false);
        const changed = prevStatus !== o.status;
        this.order.set(o);

        if (changed && prevStatus) {
          this.notification.success(`🚚 Order status updated to: ${o.status}`);
        } else if (userTriggered) {
          this.notification.info(`Live Status: ${o.status} (Up to date)`);
        }
      },
      error: () => {
        if (userTriggered) this.refreshing.set(false);
      }
    });
  }

  isStepPassed(stepName: string): boolean {
    if (!this.order()) return false;
    const currentIdx = this.stepsOrder.indexOf(this.order()!.status);
    const targetIdx = this.stepsOrder.indexOf(stepName);
    return currentIdx >= targetIdx;
  }

  canCancel(): boolean {
    const o = this.order();
    return !!o && (o.status === 'Placed' || o.status === 'InCrafting');
  }

  onCancelOrder() {
    const o = this.order();
    if (!o) return;

    const isCod = o.paymentMethod === 'CashOnDelivery';

    this.notification.confirm({
      title: 'Cancel Furniture Order?',
      orderNumber: o.orderNumber,
      amount: o.totalAmount,
      paymentMethod: o.paymentMethod,
      message: isCod 
        ? `Are you sure you want to cancel Cash on Delivery Order #${o.orderNumber}?`
        : `Are you sure you want to cancel Order #${o.orderNumber}?`,
      subMessage: isCod 
        ? 'Your order reservation will be released and handcrafted piece(s) returned to stock. Zero payment is due.'
        : `A full refund of ₹${o.totalAmount.toLocaleString('en-IN')} will be initiated, and the furniture piece(s) returned to stock.`,
      confirmText: 'Yes, Cancel Order',
      cancelText: 'Keep My Order',
      type: 'danger',
      icon: '✕'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.orderService.cancelOrder(o.id, 'Customer self-cancellation from order confirmation').subscribe({
        next: (updated) => {
          this.order.set(updated);
          this.notification.success(isCod 
            ? `Order #${updated.orderNumber} has been successfully cancelled.`
            : `Order #${updated.orderNumber} has been successfully cancelled and refunded.`);
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Failed to cancel order.');
        }
      });
    });
  }
}

