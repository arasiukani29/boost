import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, inject } from '@angular/core';
import { DatePipe, DOCUMENT } from '@angular/common';
import { Order } from '../../models/furninest.models';

@Component({
  selector: 'app-invoice-modal',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="invoice-overlay" (click)="close.emit()">
      <div class="invoice-container" (click)="$event.stopPropagation()">
        <!-- Toolbar -->
        <div class="invoice-toolbar no-print">
          <div class="toolbar-left">
            <span class="badge badge-green">✓ Valid GST Tax Invoice</span>
            <span class="tip-text">Format compliant with Section 31 of CGST Act</span>
          </div>
          <div class="toolbar-actions">
            <button (click)="printInvoice()" class="btn btn-primary btn-sm">
              🖨️ Print / Save as PDF
            </button>
            <button (click)="close.emit()" class="btn btn-outline btn-sm">
              ✕ Close
            </button>
          </div>
        </div>

        <!-- The Printable Invoice Paper -->
        <div class="invoice-paper" id="printable-invoice">
          <!-- Header -->
          <div class="inv-head">
            <div class="company-info">
              <h1 class="brand-name">🛋️ Furni<span>Nest</span></h1>
              <p class="company-sub">FurniNest Studio Private Limited</p>
              <p>Plot No. 42, GIDC Industrial Estate, Sanand</p>
              <p>Ahmedabad, Gujarat – 382110, India</p>
              <p><strong>GSTIN:</strong> 24AAACF1029P1Z8 | <strong>PAN:</strong> AAACF1029P</p>
              <p><strong>State Code:</strong> 24 (Gujarat) | <strong>Email:</strong> billing&#64;furninest.com</p>
            </div>

            <div class="invoice-meta">
              <h2 class="inv-title">TAX INVOICE</h2>
              <table class="meta-table">
                <tr>
                  <td><strong>Invoice No:</strong></td>
                  <td>INV-{{ order.orderNumber }}</td>
                </tr>
                <tr>
                  <td><strong>Invoice Date:</strong></td>
                  <td>{{ order.createdAt | date:'dd MMM yyyy' }}</td>
                </tr>
                <tr>
                  <td><strong>Place of Supply:</strong></td>
                  <td>{{ order.state || 'Gujarat' }} (Code: 24)</td>
                </tr>
                <tr>
                  <td><strong>Reverse Charge:</strong></td>
                  <td>No</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Billed to & Shipped to -->
          <div class="party-details">
            <div class="party-col">
              <h4>Billed & Shipped To:</h4>
              <p class="party-name"><strong>{{ order.recipientName }}</strong></p>
              <p>{{ order.shippingAddress }}</p>
              <p>{{ order.city }}, {{ order.state }} – {{ order.postalCode }}</p>
              <p><strong>Phone:</strong> {{ order.phone }}</p>
              <p><strong>Email:</strong> {{ order.customerEmail }}</p>
            </div>

            <div class="party-col dispatch-col">
              <h4>Shipping / Dispatch Details:</h4>
              <p><strong>Courier:</strong> {{ order.carrierName || 'BlueDart Express' }}</p>
              <p><strong>Tracking AWB:</strong> {{ order.trackingNumber || 'Pending Dispatch' }}</p>
              <p><strong>Payment Status:</strong> 
                <span class="badge" [class.badge-green]="order.paymentStatus === 'Completed'" [class.badge-amber]="order.paymentStatus === 'PendingDelivery' || order.paymentStatus === 'Pending'">
                  {{ order.paymentStatus === 'PendingDelivery' ? 'PENDING (DUE ON DELIVERY)' : (order.paymentStatus === 'Completed' ? 'PAID IN FULL' : order.paymentStatus.toUpperCase()) }}
                </span>
              </p>
              <p><strong>Method:</strong> {{ order.paymentMethod === 'CashOnDelivery' ? '💵 Cash on Delivery (COD)' : (order.paymentMethod || 'Credit/Debit Card') }}</p>
            </div>
          </div>

          <!-- Item Table -->
          <div class="table-responsive">
            <table class="inv-items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Description</th>
                  <th>HSN Code</th>
                  <th>Qty</th>
                  <th>Unit Rate</th>
                  <th>Taxable Value</th>
                </tr>
              </thead>
              <tbody>
                @for (item of order.items; track item.id; let idx = $index) {
                  <tr>
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <strong>{{ item.productName }}</strong>
                      <div class="item-sub">Solid Kiln-Dried Hardwood Furniture</div>
                    </td>
                    <td>9403</td>
                    <td>{{ item.quantity }}</td>
                    <td>₹{{ item.unitPrice.toLocaleString('en-IN') }}</td>
                    <td>₹{{ item.totalPrice.toLocaleString('en-IN') }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Financial Summary & Tax Split -->
          <div class="inv-summary-row">
            <div class="bank-details">
              <h4>Terms & Bank Details:</h4>
              <p><strong>Bank:</strong> HDFC Bank Ltd</p>
              <p><strong>A/C No:</strong> 50200084920194</p>
              <p><strong>IFSC:</strong> HDFC0000182</p>
              <p class="warranty-note">🛡️ Covered under FurniNest 10-Year Framework Warranty.</p>
            </div>

            <div class="inv-totals">
              <div class="sum-line">
                <span>Subtotal (Taxable Value):</span>
                <span>₹{{ order.subtotal.toLocaleString('en-IN') }}</span>
              </div>
              @if (order.discountAmount > 0) {
                <div class="sum-line discount-line">
                  <span>Coupon Discount ({{ order.couponCode }}):</span>
                  <span>-₹{{ order.discountAmount.toLocaleString('en-IN') }}</span>
                </div>
              }
              <div class="sum-line">
                <span>White-Glove Delivery:</span>
                <span>{{ order.shippingFee === 0 ? 'FREE' : ('₹' + order.shippingFee.toLocaleString('en-IN')) }}</span>
              </div>
              <div class="sum-line">
                <span>CGST (2.5%):</span>
                <span>₹{{ (order.tax / 2).toLocaleString('en-IN') }}</span>
              </div>
              <div class="sum-line">
                <span>SGST (2.5%):</span>
                <span>₹{{ (order.tax / 2).toLocaleString('en-IN') }}</span>
              </div>
              <div class="sum-line grand-sum">
                <span>Total Amount (INR):</span>
                <strong>₹{{ order.totalAmount.toLocaleString('en-IN') }}</strong>
              </div>
            </div>
          </div>

          <!-- Signature Block -->
          <div class="inv-sign-block">
            <div class="sign-box">
              <div class="digital-stamp">
                <span class="stamp-circle">APPROVED</span>
                <span>FurniNest Studio Pvt Ltd</span>
              </div>
              <p>Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invoice-overlay {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100vh;
      height: 100dvh;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 100000;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1.5rem;
      overflow-y: auto;
      box-sizing: border-box;
    }
    .invoice-container {
      background: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--border);
      width: 100%;
      max-width: 860px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-xl);
      overflow: hidden;
      max-height: 92vh;
      margin: auto;
      display: flex;
      flex-direction: column;
    }
    .invoice-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.75rem;
      background: var(--bg-surface);
      color: var(--text-main);
      border-bottom: 1px solid var(--border);
    }
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .tip-text {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .toolbar-actions {
      display: flex;
      gap: 0.5rem;
    }
    .invoice-paper {
      padding: 2.5rem;
      overflow-y: auto;
      background: var(--bg-card);
      color: var(--text-main);
      font-size: 0.9rem;
    }
    .inv-head {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid var(--border);
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .brand-name {
      font-size: 1.8rem;
      font-weight: 800;
      margin-bottom: 0.25rem;
      color: var(--text-main);
    }
    .brand-name span {
      color: var(--accent);
    }
    .company-sub {
      font-weight: 700;
      color: var(--text-main);
    }
    .company-info p {
      font-size: 0.82rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .invoice-meta {
      text-align: right;
    }
    .inv-title {
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }
    .meta-table {
      font-size: 0.82rem;
      margin-left: auto;
    }
    .meta-table td {
      padding: 0.15rem 0.4rem;
      text-align: left;
      color: var(--text-main);
    }
    .party-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 1.75rem;
      padding: 1rem;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
    }
    .party-col h4 {
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    .party-name {
      font-size: 1rem;
      color: var(--text-main);
    }
    .party-col p {
      font-size: 0.85rem;
      line-height: 1.4;
      color: var(--text-muted);
    }
    .party-col p.party-name,
    .party-col p strong {
      color: var(--text-main);
    }
    .inv-items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;
    }
    .inv-items-table th {
      background: var(--bg-surface);
      color: var(--text-main);
      border-bottom: 2px solid var(--border);
      padding: 0.65rem 0.85rem;
      font-size: 0.8rem;
      text-transform: uppercase;
      text-align: left;
    }
    .inv-items-table td {
      padding: 0.75rem 0.85rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.85rem;
      color: var(--text-main);
    }
    .item-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .inv-summary-row {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .bank-details {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.5;
    }
    .bank-details h4 {
      color: var(--text-main);
      margin-bottom: 0.4rem;
    }
    .warranty-note {
      margin-top: 0.75rem;
      color: var(--accent);
      font-weight: 600;
    }
    .inv-totals {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .sum-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .discount-line {
      color: #16a34a;
      font-weight: 600;
    }
    .grand-sum {
      border-top: 2px solid var(--border);
      padding-top: 0.5rem;
      font-size: 1.1rem;
      color: var(--text-main);
    }
    .inv-sign-block {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
    }
    .sign-box {
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .digital-stamp {
      border: 2px dashed #16a34a;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      color: #16a34a;
      font-weight: 800;
      font-size: 0.75rem;
      margin-bottom: 0.35rem;
      display: inline-block;
    }

    @media (max-width: 768px) {
      .invoice-overlay {
        padding: 0;
      }
      .invoice-container {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
      }
      .invoice-toolbar {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
      }
      .toolbar-actions {
        width: 100%;
      }
      .toolbar-actions .btn {
        flex: 1;
      }
      .invoice-paper {
        padding: 1.25rem 1rem;
      }
      .inv-head {
        flex-direction: column;
        gap: 1.25rem;
      }
      .invoice-meta {
        text-align: left;
      }
      .meta-table {
        margin-left: 0;
      }
      .party-details {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      .inv-summary-row {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    @media print {
      .no-print {
        display: none !important;
      }
      .invoice-overlay {
        position: static;
        background: none;
        padding: 0;
      }
      .invoice-container {
        box-shadow: none;
        max-width: 100%;
        max-height: none;
        background: #ffffff !important;
        color: #0f172a !important;
        border: none !important;
      }
      .invoice-paper {
        background: #ffffff !important;
        color: #0f172a !important;
      }
    }
  `]
})
export class InvoiceModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) order!: Order;
  @Output() close = new EventEmitter<void>();

  private el = inject(ElementRef);
  private document = inject(DOCUMENT);

  ngOnInit() {
    this.document.body.appendChild(this.el.nativeElement);
    this.document.body.classList.add('modal-open');
    this.document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    this.document.body.classList.remove('modal-open');
    this.document.body.style.overflow = '';
    if (this.el.nativeElement.parentNode === this.document.body) {
      this.document.body.removeChild(this.el.nativeElement);
    }
  }

  printInvoice() {
    window.print();
  }
}

