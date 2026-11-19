import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { AdminStats, Order, Product, Category, CustomerSummary } from '../../models/furninest.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, DatePipe, CommonModule],
  template: `
    <div class="admin-page container animate-fade-in">
      <div class="admin-header">
        <div>
          <span class="badge badge-amber">Store Management Portal</span>
          <h1 class="page-title">FurniNest Operations Dashboard</h1>
          <p class="page-subtitle">Real-time revenue metrics, order dispatch management, catalog inventory, and customer intelligence.</p>
        </div>

        <button (click)="openAddModal()" class="btn btn-accent">
          + Add New Furniture Piece
        </button>
      </div>

      <!-- KPI Metrics Cards -->
      @if (stats()) {
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-icon">💰</span>
            <div class="kpi-meta">
              <span class="kpi-label">Gross Revenue</span>
              <strong class="kpi-value">₹{{ stats()!.totalRevenue.toLocaleString('en-IN') }}</strong>
            </div>
          </div>

          <div class="kpi-card">
            <span class="kpi-icon">📦</span>
            <div class="kpi-meta">
              <span class="kpi-label">Total Orders</span>
              <strong class="kpi-value">{{ stats()!.totalOrders }}</strong>
            </div>
          </div>

          <div class="kpi-card">
            <span class="kpi-icon">👥</span>
            <div class="kpi-meta">
              <span class="kpi-label">Active Customers</span>
              <strong class="kpi-value">{{ stats()!.totalCustomers }}</strong>
            </div>
          </div>

          <div class="kpi-card" [class.alert-border]="stats()!.lowStockAlertCount > 0">
            <span class="kpi-icon">⚠️</span>
            <div class="kpi-meta">
              <span class="kpi-label">Low Stock Alerts</span>
              <strong class="kpi-value" [class.alert-text]="stats()!.lowStockAlertCount > 0">
                {{ stats()!.lowStockAlertCount }} Items
              </strong>
            </div>
          </div>
        </div>
      }

      <!-- Tabs Navigation -->
      <div class="admin-tabs">
        <button (click)="activeTab = 'orders'" class="tab-btn" [class.active]="activeTab === 'orders'">
          📋 Order Fulfillment ({{ orders().length }})
        </button>
        <button (click)="activeTab = 'inventory'" class="tab-btn" [class.active]="activeTab === 'inventory'">
          🪑 Product Catalog & Stock ({{ allProducts().length }})
        </button>
        <button (click)="activeTab = 'customers'" class="tab-btn" [class.active]="activeTab === 'customers'">
          👥 Customer Management ({{ customers().length }})
        </button>
      </div>

      <!-- ══════════ TAB 1: ORDERS FULFILLMENT DESK ══════════ -->
      @if (activeTab === 'orders') {
        <div class="card table-card animate-fade-in">
          <div class="table-header">
            <div>
              <h3>Customer Orders Management</h3>
              <span class="table-tip">Update fulfillment stages and assign courier tracking numbers in real-time.</span>
            </div>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Destination</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status Workflow</th>
                  <th>Tracking #</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (order of orders(); track order.id) {
                  <tr>
                    <td>
                      <strong>{{ order.orderNumber }}</strong>
                      <div class="cell-sub">{{ order.createdAt | date:'shortDate' }}</div>
                    </td>
                    <td>
                      <div class="cust-name">{{ order.customerName }}</div>
                      <div class="cell-sub">{{ order.customerEmail }}</div>
                    </td>
                    <td>
                      <div>{{ order.city }}, {{ order.state }}</div>
                      <div class="cell-sub">{{ order.shippingAddress }}</div>
                    </td>
                    <td>
                      <span class="badge badge-gray">{{ order.items.length }} Items</span>
                    </td>
                    <td>
                      <strong>₹{{ order.totalAmount.toLocaleString('en-IN') }}</strong>
                      <div class="cell-sub inline-badge badge" 
                        [class.badge-green]="order.paymentStatus === 'Completed'" 
                        [class.badge-amber]="order.paymentStatus === 'PendingDelivery' || order.paymentStatus === 'Pending'"
                        [class.badge-red]="order.paymentStatus === 'Refunded' || order.paymentStatus === 'Voided'">
                        {{ order.paymentMethod === 'CashOnDelivery' ? '💵 COD (' + (order.paymentStatus === 'PendingDelivery' ? 'Pending' : order.paymentStatus) + ')' : order.paymentStatus }}
                      </div>
                    </td>
                    <td>
                      <select [(ngModel)]="order.status" class="form-select status-select" [class]="'select-' + order.status.toLowerCase()">
                        <option value="Placed">Placed</option>
                        <option value="InCrafting">In Crafting</option>
                        <option value="QualityCheck">Quality Check</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        [(ngModel)]="order.trackingNumber" 
                        placeholder="BlueDart / FedEx #" 
                        class="form-input tracking-input" />
                    </td>
                    <td>
                      <div style="display: flex; gap: 0.35rem; align-items: center;">
                        <button (click)="saveOrderStatus(order)" class="btn btn-primary btn-sm save-btn">
                          Save
                        </button>
                        @if (order.status !== 'Cancelled' && order.status !== 'Delivered') {
                          <button (click)="cancelOrderByAdmin(order)" class="btn btn-outline btn-sm delete-btn" title="Cancel this order & return items to stock">
                            ✕
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ══════════ TAB 2: INVENTORY & ARCHIVE MANAGEMENT ══════════ -->
      @if (activeTab === 'inventory') {
        <div class="card table-card animate-fade-in">
          <div class="table-header table-header-split">
            <div>
              <h3>Furniture Catalog & Stock Controls</h3>
              <span class="table-tip">Manage active pieces, stock counts, and restored/archived collections.</span>
            </div>

            <!-- Segmented Filter Pills: All, Active, Archived -->
            <div class="filter-pills-bar">
              <button 
                type="button" 
                class="pill-btn" 
                [class.active]="catalogFilter() === 'all'" 
                (click)="catalogFilter.set('all')"
              >
                All ({{ allProducts().length }})
              </button>
              <button 
                type="button" 
                class="pill-btn" 
                [class.active]="catalogFilter() === 'active'" 
                (click)="catalogFilter.set('active')"
              >
                Active in Store ({{ activeCount() }})
              </button>
              <button 
                type="button" 
                class="pill-btn pill-archived" 
                [class.active]="catalogFilter() === 'archived'" 
                (click)="catalogFilter.set('archived')"
              >
                📦 Archived Pieces ({{ archivedCount() }})
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Piece</th>
                  <th>Category</th>
                  <th>Price (₹)</th>
                  <th>Stock Count</th>
                  <th>Dimensions</th>
                  <th>Material</th>
                  <th>Catalog Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (displayedProducts().length === 0) {
                  <tr>
                    <td colspan="8" class="empty-table-cell">
                      <div class="empty-state-mini">
                        <span>📦</span>
                        <p>No products found in this view.</p>
                      </div>
                    </td>
                  </tr>
                }
                @for (p of displayedProducts(); track p.id) {
                  <tr [class.archived-row]="!p.isActive">
                    <td class="piece-cell">
                      <img [src]="p.primaryImageUrl" [alt]="p.name" class="table-thumb" />
                      <div>
                        <strong>{{ p.name }}</strong>
                        @if (p.isFeatured && p.isActive) {
                          <span class="badge badge-amber featured-tag">Featured</span>
                        }
                      </div>
                    </td>
                    <td>{{ p.categoryName }}</td>
                    <td>₹{{ p.price.toLocaleString('en-IN') }}</td>
                    <td>
                      <span class="stock-badge" [class.low-stock-alert]="p.stockQuantity <= 5">
                        {{ p.stockQuantity }} units
                      </span>
                    </td>
                    <td class="dim-cell">{{ p.dimensions }}</td>
                    <td class="mat-cell">{{ p.material }}</td>
                    <td>
                      @if (p.isActive) {
                        <span class="badge badge-green">✓ Active in Store</span>
                      } @else {
                        <span class="badge badge-gray">📦 Archived (Hidden)</span>
                      }
                    </td>
                    <td>
                      @if (p.isActive) {
                        <button (click)="archiveProduct(p.id)" class="btn btn-outline btn-sm delete-btn" title="Archive this piece from public catalog">
                          📦 Archive
                        </button>
                      } @else {
                        <button (click)="restoreProduct(p.id)" class="btn btn-primary btn-sm restore-btn" title="Restore this piece back to the public catalog">
                          ♻️ Restore / Unarchive
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ══════════ TAB 3: CUSTOMER MANAGEMENT ══════════ -->
      @if (activeTab === 'customers') {
        <div class="customers-section animate-fade-in">
          <!-- Customer Intelligence KPI Cards -->
          <div class="customer-stats-grid">
            <div class="cstat-card">
              <span class="cstat-icon">👥</span>
              <div>
                <span class="cstat-label">Registered Customers</span>
                <strong class="cstat-val">{{ customers().length }}</strong>
              </div>
            </div>

            <div class="cstat-card">
              <span class="cstat-icon">✅</span>
              <div>
                <span class="cstat-label">Verified Email Accounts</span>
                <strong class="cstat-val">{{ verifiedCustomerCount() }}</strong>
              </div>
            </div>

            <div class="cstat-card">
              <span class="cstat-icon">💳</span>
              <div>
                <span class="cstat-label">Total Customer Spend</span>
                <strong class="cstat-val">₹{{ totalCustomerSpend().toLocaleString('en-IN') }}</strong>
              </div>
            </div>
          </div>

          <!-- Customer Directory Table -->
          <div class="card table-card">
            <div class="table-header table-header-split">
              <div>
                <h3>Customer Profiles & Spend History</h3>
                <span class="table-tip">View registered clients, email verification status, and order history.</span>
              </div>

              <!-- Instant Search Filter -->
              <div class="search-box-wrapper">
                <input 
                  type="text" 
                  [(ngModel)]="customerSearch" 
                  placeholder="🔍 Search name, email, city..." 
                  class="form-input search-input"
                />
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email & Verification</th>
                    <th>Contact & Location</th>
                    <th>Joined On</th>
                    <th>Total Orders</th>
                    <th>Lifetime Spend</th>
                    <th>Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  @if (filteredCustomers().length === 0) {
                    <tr>
                      <td colspan="7" class="empty-table-cell">
                        <div class="empty-state-mini">
                          <span>👤</span>
                          <p>No customers match the current search.</p>
                        </div>
                      </td>
                    </tr>
                  }
                  @for (c of filteredCustomers(); track c.id) {
                    <tr>
                      <td>
                        <div class="cust-profile-cell">
                          <div class="cust-avatar-circle">
                            {{ getInitials(c.fullName) }}
                          </div>
                          <div>
                            <strong>{{ c.fullName }}</strong>
                            <div class="cell-sub">ID #{{ c.id }} • {{ c.role }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{{ c.email }}</div>
                        @if (c.isEmailVerified) {
                          <span class="badge badge-green inline-badge">✓ Email Verified</span>
                        } @else {
                          <span class="badge badge-amber inline-badge">⚠️ Unverified</span>
                        }
                      </td>
                      <td>
                        <div>{{ c.phoneNumber || '—' }}</div>
                        <div class="cell-sub">{{ c.city ? c.city : 'Location not set' }}</div>
                      </td>
                      <td>
                        <div>{{ c.createdAt | date:'mediumDate' }}</div>
                      </td>
                      <td>
                        <span class="badge badge-gray font-bold">
                          {{ c.totalOrders }} {{ c.totalOrders === 1 ? 'Order' : 'Orders' }}
                        </span>
                      </td>
                      <td>
                        <strong class="spend-val">₹{{ c.totalSpent.toLocaleString('en-IN') }}</strong>
                      </td>
                      <td>
                        <div class="cell-sub">
                          {{ c.lastOrderDate ? (c.lastOrderDate | date:'mediumDate') : 'No orders yet' }}
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

    </div>

    <!-- Add Product Modal (True Viewport Top-Level Overlay) -->
    @if (showAddModal()) {
      <div class="modal-overlay" (click)="closeAddModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Add New Handcrafted Furniture</h3>
            <button (click)="closeAddModal()" class="close-x" aria-label="Close modal">✕</button>
          </div>

          <form (ngSubmit)="submitNewProduct()" class="modal-body">
            <div class="form-group">
              <label class="form-label">Piece Name</label>
              <input type="text" [(ngModel)]="newProd.name" name="name" required class="form-input" placeholder="e.g. Kyoto White Oak Dining Table" />
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select [(ngModel)]="newProd.categoryId" name="categoryId" required class="form-select">
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Price (₹ INR)</label>
                <input type="number" [(ngModel)]="newProd.price" name="price" required class="form-input" placeholder="28000" />
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Initial Stock Count</label>
                <input type="number" [(ngModel)]="newProd.stockQuantity" name="stockQuantity" required class="form-input" placeholder="10" />
              </div>
              <div class="form-group">
                <label class="form-label">Color / Finish</label>
                <input type="text" [(ngModel)]="newProd.color" name="color" required class="form-input" placeholder="Bleached Oak" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Dimensions (W x D x H)</label>
              <input type="text" [(ngModel)]="newProd.dimensions" name="dimensions" required class="form-input" placeholder="72&quot;W x 38&quot;D x 30&quot;H" />
            </div>

            <div class="form-group">
              <label class="form-label">Materials Description</label>
              <input type="text" [(ngModel)]="newProd.material" name="material" required class="form-input" placeholder="Solid European White Oak" />
            </div>

            <div class="form-group">
              <label class="form-label">Primary Image URL (Unsplash)</label>
              <input type="url" [(ngModel)]="newProd.primaryImageUrl" name="primaryImageUrl" required class="form-input" placeholder="https://images.unsplash.com/..." />
            </div>

            <div class="form-group">
              <label class="form-label">Story & Description</label>
              <textarea [(ngModel)]="newProd.description" name="description" rows="3" class="form-textarea" placeholder="Crafted with mortise-and-tenon joints..."></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeAddModal()" class="btn btn-outline">Cancel</button>
              <button type="submit" class="btn btn-accent">+ Publish to Catalog</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-page {
      padding: 3.5rem 0 5rem;
    }
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      gap: 1.5rem;
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

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .kpi-card {
      background: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      box-shadow: var(--shadow-sm);
    }
    .kpi-card.alert-border {
      border-color: #fca5a5;
      background: #fffdfd;
    }
    .kpi-icon {
      font-size: 2.25rem;
      width: 52px;
      height: 52px;
      border-radius: var(--radius-sm);
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kpi-meta {
      display: flex;
      flex-direction: column;
    }
    .kpi-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .kpi-value {
      font-size: 1.6rem;
      color: var(--primary);
    }
    .alert-text {
      color: #dc2626 !important;
    }

    .admin-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.25rem;
    }
    .tab-btn {
      padding: 0.75rem 1.25rem;
      font-weight: 700;
      font-size: 0.95rem;
      border: none;
      background: none;
      color: var(--text-muted);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .tab-btn:hover {
      color: var(--primary);
    }
    .tab-btn.active {
      color: var(--primary);
      border-bottom-color: var(--accent);
    }

    .table-card {
      background: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .table-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .table-header-split {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .table-header h3 {
      font-size: 1.25rem;
      margin-bottom: 0.2rem;
    }
    .table-tip {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    /* Filter Pills */
    .filter-pills-bar {
      display: flex;
      background: #f1f5f9;
      padding: 3px;
      border-radius: 8px;
      gap: 3px;
    }
    .pill-btn {
      border: none;
      background: transparent;
      padding: 0.45rem 0.85rem;
      font-size: 0.82rem;
      font-weight: 600;
      color: #64748b;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pill-btn:hover {
      color: #0f172a;
    }
    .pill-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .pill-archived.active {
      background: #475569;
      color: #ffffff;
    }

    .table-responsive {
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    .data-table th {
      background: #f8fafc;
      padding: 0.85rem 1.25rem;
      font-weight: 700;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
    }
    .data-table td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .cell-sub {
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .inline-badge {
      display: inline-block;
      font-size: 0.7rem;
      padding: 0.15rem 0.4rem;
      margin-top: 0.2rem;
    }
    .status-select {
      font-size: 0.85rem;
      padding: 0.4rem 0.6rem;
      font-weight: 600;
    }
    .tracking-input {
      font-size: 0.85rem;
      padding: 0.35rem 0.6rem;
      min-width: 130px;
    }

    .piece-cell {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .table-thumb {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: var(--radius-sm);
    }
    .featured-tag {
      font-size: 0.65rem;
      display: inline-block;
      margin-left: 0.35rem;
    }
    .stock-badge {
      font-weight: 700;
      color: #15803d;
    }
    .low-stock-alert {
      color: #dc2626;
      background: #fee2e2;
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-sm);
    }
    .dim-cell, .mat-cell {
      font-size: 0.8rem;
      color: var(--text-muted);
      max-width: 140px;
    }
    .delete-btn {
      color: #dc2626;
      border-color: #fca5a5;
    }
    .delete-btn:hover {
      background: #dc2626;
      color: #ffffff;
    }
    .restore-btn {
      background: #0284c7;
      border: none;
      color: #ffffff;
    }
    .restore-btn:hover {
      background: #0369a1;
    }
    .archived-row {
      background: #fafafa;
      opacity: 0.85;
    }

    /* Customer Management Styles */
    .customer-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .cstat-card {
      background: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
    }
    .cstat-icon {
      font-size: 2rem;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cstat-label {
      display: block;
      font-size: 0.82rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .cstat-val {
      font-size: 1.45rem;
      color: var(--primary);
    }
    .search-input {
      padding: 0.45rem 0.85rem;
      font-size: 0.85rem;
      min-width: 250px;
    }
    .cust-profile-cell {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .cust-avatar-circle {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .spend-val {
      color: #0f172a;
      font-weight: 700;
    }
    .empty-table-cell {
      text-align: center;
      padding: 3rem 1rem !important;
    }
    .empty-state-mini span {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.5rem;
    }
    .empty-state-mini p {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin: 0;
    }

    /* Modal Viewport Overlay */
    .modal-overlay {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100vh;
      height: 100dvh;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000;
      padding: 1.5rem;
      overflow-y: auto;
      box-sizing: border-box;
    }
    .modal-box {
      background: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--border);
      width: 100%;
      max-width: 620px;
      border-radius: var(--radius-md);
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.4);
      max-height: 88vh;
      overflow-y: auto;
      margin: auto;
      animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes modalPop {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(12px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 {
      margin: 0;
      color: var(--text-main);
    }
    .close-x {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--text-muted);
      transition: color 0.15s;
    }
    .close-x:hover {
      color: var(--text-main);
    }
    .modal-body {
      padding: 1.5rem;
      background: var(--bg-card);
      color: var(--text-main);
    }
    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group {
      margin-bottom: 1.15rem;
    }
    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 0.35rem;
      color: var(--text-main);
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }

    @media (max-width: 768px) {
      .admin-page {
        padding: 2rem 0 3.5rem;
      }
      .page-title {
        font-size: 1.75rem;
      }
      .admin-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      .admin-header .btn {
        width: 100%;
      }
      .kpi-grid, .customer-stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      .admin-tabs {
        overflow-x: auto;
        flex-wrap: nowrap;
        -webkit-overflow-scrolling: touch;
        padding-bottom: 0.5rem;
      }
      .tab-btn {
        flex-shrink: 0;
        white-space: nowrap;
      }
      .search-input {
        width: 100%;
      }
      .table-header-split {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private productService = inject(ProductService);
  private notification = inject(NotificationService);

  stats = signal<AdminStats | null>(null);
  orders = signal<Order[]>([]);
  allProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  customers = signal<CustomerSummary[]>([]);

  activeTab: 'orders' | 'inventory' | 'customers' = 'orders';
  catalogFilter = signal<'all' | 'active' | 'archived'>('active');
  customerSearch = '';
  showAddModal = signal<boolean>(false);

  // Computed properties
  activeCount = computed(() => this.allProducts().filter(p => p.isActive).length);
  archivedCount = computed(() => this.allProducts().filter(p => !p.isActive).length);

  displayedProducts = computed(() => {
    const filter = this.catalogFilter();
    const list = this.allProducts();
    if (filter === 'active') return list.filter(p => p.isActive);
    if (filter === 'archived') return list.filter(p => !p.isActive);
    return list;
  });

  verifiedCustomerCount = computed(() => this.customers().filter(c => c.isEmailVerified).length);
  totalCustomerSpend = computed(() => this.customers().reduce((sum, c) => sum + (c.totalSpent || 0), 0));

  filteredCustomers = computed(() => {
    const q = this.customerSearch.trim().toLowerCase();
    const list = this.customers();
    if (!q) return list;
    return list.filter(c => 
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  newProd = {
    name: '',
    categoryId: 1,
    price: 28000,
    stockQuantity: 12,
    dimensions: '60"W x 30"D x 30"H',
    material: 'Solid American Walnut',
    color: 'Natural Walnut',
    primaryImageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
    description: 'Masterfully built with mortise and tenon jointing and a rich natural matte finish.',
    isFeatured: true
  };

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.adminService.getStats().subscribe(s => this.stats.set(s));
    this.adminService.getOrders().subscribe(o => this.orders.set(o));
    this.adminService.getAdminProducts().subscribe(p => this.allProducts.set(p));
    this.adminService.getCustomers().subscribe(c => this.customers.set(c));
    this.productService.getCategories().subscribe(c => {
      this.categories.set(c);
      if (c.length > 0) this.newProd.categoryId = c[0].id;
    });
  }

  saveOrderStatus(order: Order) {
    this.adminService.updateOrderStatus(order.id, {
      status: order.status,
      trackingNumber: order.trackingNumber,
      carrierName: order.carrierName || 'BlueDart Express'
    }).subscribe({
      next: updated => {
        this.notification.success(`Order #${updated.orderNumber} status updated to '${updated.status}'!`);
        this.adminService.getStats().subscribe(s => this.stats.set(s));
      },
      error: () => this.notification.error('Failed to update order status.')
    });
  }

  cancelOrderByAdmin(order: Order) {
    const isCod = order.paymentMethod === 'CashOnDelivery';

    this.notification.confirm({
      title: 'Admin Order Cancellation',
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      message: isCod
        ? `Cancel Cash on Delivery Order #${order.orderNumber}?`
        : `Cancel and refund Order #${order.orderNumber}?`,
      subMessage: isCod
        ? 'Status will be updated to Cancelled and reserved pieces returned to stock inventory.'
        : `A full refund of ₹${order.totalAmount.toLocaleString('en-IN')} will be recorded and reserved pieces returned to stock inventory.`,
      confirmText: 'Yes, Cancel Order',
      cancelText: 'Dismiss',
      type: 'danger',
      icon: '✕'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.adminService.updateOrderStatus(order.id, {
        status: 'Cancelled',
        trackingNumber: order.trackingNumber,
        carrierName: order.carrierName
      }).subscribe({
        next: (updated) => {
          this.notification.success(`Order #${updated.orderNumber} has been cancelled and stock inventory restored.`);
          this.loadAll();
        },
        error: () => this.notification.error('Failed to cancel order.')
      });
    });
  }

  archiveProduct(id: number) {
    const prod = this.allProducts().find(p => p.id === id);
    this.notification.confirm({
      title: 'Archive Furniture Piece?',
      message: `Are you sure you want to archive "${prod?.name || 'this piece'}"?`,
      subMessage: 'It will be hidden from the customer storefront catalog immediately, but preserved in your Archived Items list for restoration at any time.',
      confirmText: 'Yes, Archive Piece',
      cancelText: 'Keep Active',
      type: 'warning',
      icon: '📦'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.adminService.deleteProduct(id).subscribe({
        next: () => {
          this.notification.success('Piece archived from store catalog.');
          this.loadAll();
        },
        error: () => this.notification.error('Failed to archive piece.')
      });
    });
  }

  restoreProduct(id: number) {
    this.adminService.restoreProduct(id).subscribe({
      next: () => {
        this.loadAll();
        this.notification.success('Piece restored to active store catalog successfully!');
      },
      error: () => this.notification.error('Failed to restore piece.')
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  openAddModal() {
    this.showAddModal.set(true);
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }

  closeAddModal() {
    this.showAddModal.set(false);
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  ngOnDestroy() {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  submitNewProduct() {
    this.adminService.createProduct(this.newProd).subscribe({
      next: () => {
        this.closeAddModal();
        this.loadAll();
        alert('New furniture piece published to catalog successfully!');
      },
      error: () => alert('Failed to create product.')
    });
  }
}
