import { Component, OnInit, HostListener, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';
import { NotificationService } from '../../services/notification.service';
import { Product, Category } from '../../models/furninest.models';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [RouterLink, FormsModule, MatTooltipModule],
  template: `
    <div class="catalog-page container animate-fade-in">
      <!-- Breadcrumbs & Heading -->
      <div class="catalog-header">
        <span class="badge badge-amber">The Full Collection</span>
        <h1 class="catalog-title">Handcrafted Living Essentials</h1>
        <p class="catalog-subtitle">Every piece is cut, shaped, and finished by master artisans using sustainable hardwoods.</p>
      </div>

      <!-- Desktop Filter Bar (Hidden on mobile <768px in favor of Floating Glass Dock) -->
      <div class="filter-bar desktop-only-filter">
        <!-- Category Filter Pills -->
        <div class="category-pills">
          <button 
            (click)="selectCategory('')" 
            class="pill-btn" 
            [class.active]="selectedCategory() === ''">
            All Furniture
          </button>
          @for (cat of categories(); track cat.id) {
            <button 
              (click)="selectCategory(cat.slug)" 
              class="pill-btn" 
              [class.active]="selectedCategory() === cat.slug">
              {{ cat.name }} ({{ cat.productCount }})
            </button>
          }
        </div>

        <!-- Price Range Filter Pills -->
        <div class="price-pills">
          <span class="price-filter-label">🏷️ Budget:</span>
          <button 
            (click)="selectPriceRange('all')" 
            class="price-pill-btn" 
            [class.active]="selectedPriceRange() === 'all'">
            All Prices
          </button>
          <button 
            (click)="selectPriceRange('under-3000')" 
            class="price-pill-btn" 
            [class.active]="selectedPriceRange() === 'under-3000'">
            Under ₹3,000 (Budget Essentials)
          </button>
          <button 
            (click)="selectPriceRange('3000-10000')" 
            class="price-pill-btn" 
            [class.active]="selectedPriceRange() === '3000-10000'">
            ₹3,000 – ₹10,000 (Normal Range)
          </button>
          <button 
            (click)="selectPriceRange('above-10000')" 
            class="price-pill-btn" 
            [class.active]="selectedPriceRange() === 'above-10000'">
            ₹10,000+ (Heirloom Luxury)
          </button>
        </div>

        <!-- Controls: Search & Sort -->
        <div class="controls-row">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search table, sofa, walnut..." 
              [(ngModel)]="searchQuery" 
              (keyup.enter)="applyFilters()" 
              (blur)="applyFilters()" 
              class="search-input" />
          </div>

          <div class="sort-box">
            <label class="sort-label">Sort:</label>
            <select [(ngModel)]="sortBy" (change)="applyFilters()" class="form-select sort-select">
              <option value="newest">Newest Designs</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Mobile Search Bar (Sleek Compact Row) -->
      <div class="mobile-search-row mobile-only">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search handcrafted solid wood..." 
            [(ngModel)]="searchQuery" 
            (input)="applyFilters()" 
            class="search-input" />
        </div>
      </div>

      <!-- Products Grid -->
      @if (loading()) {
        <div class="loading-state">
          <p>Curating furniture collection...</p>
        </div>
      } @else if (products().length === 0) {
        <div class="empty-results">
          <span class="empty-icon">🪑</span>
          <h3>No designs match your criteria</h3>
          <p>Try resetting your filters or search terms.</p>
          <button (click)="resetFilters()" class="btn btn-primary">Reset Filters</button>
        </div>
      } @else {
        <div class="products-grid">
          @for (product of products(); track product.id) {
            <div class="product-card">
              <div class="prod-img-wrap">
                <a [routerLink]="['/product', product.id]">
                  <img 
                    [src]="product.primaryImageUrl" 
                    [alt]="product.name" 
                    class="prod-img" 
                    [style.filter]="getFinishFilter(product.id)"
                  />
                </a>
                
                <!-- Wishlist Heart Button -->
                <button 
                  (click)="toggleWishlist(product.id)" 
                  class="wish-heart-btn" 
                  [class.active]="wishlistService.isInWishlist(product.id)" 
                  title="Save to wishlist"
                  [attr.aria-label]="'Save ' + product.name + ' to wishlist'"
                >
                  {{ wishlistService.isInWishlist(product.id) ? '❤️' : '🤍' }}
                </button>

                <!-- Stock Scarcity Pill -->
                <span class="stock-pill" [class.low-stock]="product.stockQuantity <= 5">
                  {{ product.stockQuantity <= 5 ? ('⚡ Only ' + product.stockQuantity + ' left') : '🌱 Solid Wood' }}
                </span>

                <!-- Variant C Interactive Timber Swatches -->
                <div class="swatch-bar" (click)="$event.stopPropagation()">
                  <button
                    type="button"
                    class="swatch-item sw-walnut" 
                    [class.active]="getFinish(product.id) === 'walnut'" 
                    (click)="setFinish(product.id, 'walnut', $event)" 
                    title="American Walnut"
                    [attr.aria-label]="'American Walnut finish for ' + product.name"
                    [attr.aria-pressed]="getFinish(product.id) === 'walnut'"
                  ></button>
                  <button
                    type="button"
                    class="swatch-item sw-oak" 
                    [class.active]="getFinish(product.id) === 'oak'" 
                    (click)="setFinish(product.id, 'oak', $event)" 
                    title="Natural White Oak"
                    [attr.aria-label]="'Natural White Oak finish for ' + product.name"
                    [attr.aria-pressed]="getFinish(product.id) === 'oak'"
                  ></button>
                  <button
                    type="button"
                    class="swatch-item sw-ebony" 
                    [class.active]="getFinish(product.id) === 'ebony'" 
                    (click)="setFinish(product.id, 'ebony', $event)" 
                    title="Charred Ebony"
                    [attr.aria-label]="'Charred Ebony finish for ' + product.name"
                    [attr.aria-pressed]="getFinish(product.id) === 'ebony'"
                  ></button>
                </div>
              </div>

              <div class="prod-body">
                <div class="prod-cat">{{ product.categoryName }}</div>
                <h3 class="prod-name">
                  <a [routerLink]="['/product', product.id]">{{ product.name }}</a>
                </h3>
                <p class="prod-dimensions">📏 {{ product.dimensions }}</p>
                <p class="prod-material">{{ product.material }}</p>

                <div class="prod-footer">
                  <div class="price-wrap">
                    <span class="current-price">₹{{ product.price.toLocaleString('en-IN') }}</span>
                    @if (product.originalPrice) {
                      <span class="orig-price">₹{{ product.originalPrice.toLocaleString('en-IN') }}</span>
                    }
                  </div>

                  <button (click)="addToCart(product.id)" class="btn btn-primary btn-sm">
                    + Add to Bag
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- ══════════ VARIANT C: FLOATING GLASS DOCK (MOBILE ONLY) ══════════ -->
      <div class="floating-dock-wrap mobile-only">
        <!-- Room Space Selection Popup -->
        @if (spaceDrawerOpen()) {
          <div class="dock-popup">
            <div class="popup-header">
              <span>Select Room Environment</span>
              <button type="button" class="popup-close-btn" (click)="toggleSpaceDrawer()">✕</button>
            </div>
            <div class="popup-chips">
              <button 
                (click)="selectCategory(''); toggleSpaceDrawer()" 
                class="popup-chip" 
                [class.active]="selectedCategory() === ''">
                ✨ All Pieces
              </button>
              @for (cat of categories(); track cat.id) {
                <button 
                  (click)="selectCategory(cat.slug); toggleSpaceDrawer()" 
                  class="popup-chip" 
                  [class.active]="selectedCategory() === cat.slug">
                  {{ cat.name }} ({{ cat.productCount }})
                </button>
              }
            </div>
          </div>
        }

        <!-- The Floating Glass Dock Bar -->
        <nav class="glass-dock" aria-label="Mobile Catalog Navigation">
          <button 
            type="button" 
            class="dock-pill" 
            [class.active]="spaceDrawerOpen() || selectedCategory() !== ''"
            (click)="toggleSpaceDrawer()"
            aria-label="Filter by space">
            <span>🛋️</span>
            <span>{{ getCategoryLabel() }}</span>
          </button>

          <button 
            type="button" 
            class="dock-pill" 
            (click)="cycleSortMobile()"
            aria-label="Cycle sort order">
            <span>↕️</span>
            <span>{{ getSortLabel() }}</span>
          </button>

          <button 
            type="button" 
            class="dock-pill" 
            [class.active]="selectedPriceRange() !== 'all'"
            (click)="cyclePriceRangeMobile()"
            aria-label="Filter by budget">
            <span>🏷️</span>
            <span>{{ getPriceLabel() }}</span>
          </button>

          <button 
            type="button" 
            class="dock-pill" 
            (click)="cartService.openDrawer()"
            aria-label="Open shopping bag">
            <span>🛍️</span>
            @if (cartService.itemCount() > 0) {
              <span class="dock-badge">{{ cartService.itemCount() }}</span>
            }
          </button>
        </nav>
      </div>

    </div>
  `,
  styles: [`
    .catalog-page {
      padding: 3.5rem 0 5rem;
    }
    .catalog-header {
      margin-bottom: 2.5rem;
      max-width: 650px;
    }
    .catalog-title {
      font-size: 2.75rem;
      font-weight: 700;
      margin: 0.75rem 0 0.5rem;
    }
    .catalog-subtitle {
      color: var(--text-muted);
      font-size: 1.05rem;
      line-height: 1.5;
    }

    .desktop-only-filter {
      display: block;
    }
    .mobile-only {
      display: none;
    }

    .filter-bar {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.25rem 1.5rem;
      margin-bottom: 2.5rem;
      box-shadow: var(--shadow-sm);
    }
    .category-pills {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border);
    }
    .pill-btn {
      padding: 0.5rem 1.15rem;
      font-size: 0.88rem;
      font-weight: 600;
      border-radius: 9999px;
      border: 1px solid var(--border);
      background: var(--bg-surface);
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
    }
    .pill-btn:hover {
      background: var(--border);
      color: var(--text-main);
    }
    .pill-btn.active {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--accent);
    }
    .price-pills {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border);
    }
    .price-filter-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-right: 0.25rem;
    }
    .price-pill-btn {
      padding: 0.4rem 0.95rem;
      font-size: 0.82rem;
      font-weight: 600;
      border-radius: 9999px;
      border: 1px solid var(--border);
      background: var(--bg-surface);
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.2s;
    }
    .price-pill-btn:hover {
      background: var(--bg-card);
      border-color: var(--text-muted);
    }
    .price-pill-btn.active {
      background: var(--accent);
      color: #ffffff;
      border-color: var(--accent);
      font-weight: 700;
    }
    .controls-row {
      display: flex;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
    }
    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.9rem;
    }
    .search-input {
      width: 100%;
      padding: 0.65rem 1rem 0.65rem 2.5rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      outline: none;
      font-size: 0.9rem;
      background: var(--bg-surface);
      color: var(--text-main);
      transition: border-color 0.2s;
    }
    .search-input:focus {
      border-color: var(--accent);
    }
    .sort-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .sort-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .sort-select {
      width: auto;
      padding: 0.65rem 1rem;
      font-size: 0.9rem;
      background: var(--bg-surface);
      color: var(--text-main);
      border-color: var(--border);
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 2rem;
    }
    .product-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }
    .product-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }
    .prod-img-wrap {
      position: relative;
      height: 270px;
      overflow: hidden;
      background: var(--bg-surface);
    }
    .wish-heart-btn {
      position: absolute;
      top: 12px;
      left: 12px;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--border);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s, background-color 0.2s;
      z-index: 2;
    }
    .wish-heart-btn:hover {
      transform: scale(1.15);
      background: var(--bg-surface);
    }
    .prod-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s, filter 0.3s ease;
    }
    .product-card:hover .prod-img {
      transform: scale(1.04);
    }
    .stock-pill {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(15, 23, 42, 0.75);
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      backdrop-filter: blur(4px);
      z-index: 2;
    }
    .stock-pill.low-stock {
      background: #b45309;
      color: #ffffff;
    }

    /* Timber Swatches on Card */
    .swatch-bar {
      position: absolute;
      bottom: 10px;
      left: 10px;
      display: flex;
      gap: 5px;
      background: var(--bg-card);
      backdrop-filter: blur(6px);
      padding: 4px 7px;
      border-radius: 9999px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      z-index: 3;
    }
    .swatch-item {
      width: 12px;
      height: 12px;
      padding: 0;
      border-radius: 50%;
      cursor: pointer;
      border: 1.5px solid #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .swatch-item:hover, .swatch-item.active {
      transform: scale(1.25);
      box-shadow: 0 0 0 1.5px var(--accent), 0 1px 3px rgba(0, 0, 0, 0.25);
    }
    .sw-walnut { background: #4a2f18; }
    .sw-oak { background: #d7af73; }
    .sw-ebony { background: #222222; }

    .prod-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .prod-cat {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
    }
    .prod-name {
      font-size: 1.15rem;
      margin-bottom: 0.4rem;
    }
    .prod-dimensions {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }
    .prod-material {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
      flex: 1;
    }
    .prod-footer {
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
    .current-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .orig-price {
      font-size: 0.88rem;
      color: var(--text-muted);
      text-decoration: line-through;
    }
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }
    .loading-state, .empty-results {
      text-align: center;
      padding: 5rem 1rem;
      color: var(--text-muted);
    }
    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }

    /* ══════════ FLOATING GLASS DOCK (MOBILE STYLES) ══════════ */
    .floating-dock-wrap {
      position: fixed;
      bottom: 18px;
      left: 14px;
      right: 14px;
      max-width: 440px;
      margin: 0 auto;
      z-index: 90;
    }
    .glass-dock {
      background: rgba(30, 41, 59, 0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 9999px;
      padding: 5px 8px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      box-shadow: 0 16px 35px -5px rgba(0, 0, 0, 0.35);
    }
    .dock-pill {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 0.74rem;
      font-weight: 600;
      padding: 7px 10px;
      border-radius: 9999px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .dock-pill:active, .dock-pill.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    .dock-badge {
      background: var(--accent);
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 700;
      border-radius: 50%;
      min-width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    .dock-popup {
      position: absolute;
      bottom: calc(100% + 12px);
      left: 0;
      right: 0;
      background: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--border);
      border-radius: 18px;
      box-shadow: var(--shadow-xl);
      padding: 12px 14px;
      animation: popUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes popUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .popup-close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 0.85rem;
      cursor: pointer;
      padding: 2px 4px;
    }
    .popup-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .popup-chip {
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-surface);
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .popup-chip.active {
      background: var(--accent);
      color: #ffffff;
      border-color: var(--accent);
    }
    .mobile-search-row {
      margin-bottom: 1.25rem;
    }

    @media (max-width: 768px) {
      .catalog-page {
        padding: 1.5rem 0 6rem;
      }
      .catalog-title {
        font-size: 1.75rem;
      }
      .catalog-subtitle {
        font-size: 0.88rem;
        margin-bottom: 1rem;
      }
      .desktop-only-filter {
        display: none;
      }
      .mobile-only {
        display: block;
      }
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }
      .prod-img-wrap {
        height: 165px;
      }
      .prod-body {
        padding: 0.75rem;
      }
      .prod-name {
        font-size: 0.88rem;
        line-height: 1.25;
        min-height: 2.3em;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: 0.25rem;
      }
      .prod-dimensions, .prod-material {
        display: none;
      }
      .prod-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 0.4rem;
        padding-top: 0.5rem;
      }
      .price-wrap {
        justify-content: flex-start;
      }
      .current-price {
        font-size: 0.95rem;
      }
      .orig-price {
        font-size: 0.72rem;
      }
      .btn-sm {
        width: 100%;
        padding: 0.4rem 0.5rem;
        font-size: 0.74rem;
        border-radius: 6px;
      }
    }
  `]
})
export class CatalogComponent implements OnInit {
  private productService = inject(ProductService);
  cartService = inject(CartService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  wishlistService = inject(WishlistService);
  private route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal<boolean>(true);

  selectedCategory = signal<string>('');
  selectedPriceRange = signal<string>('all');
  searchQuery = '';
  sortBy = 'newest';

  // Variant C: Floating Dock and Swatch Signals
  spaceDrawerOpen = signal<boolean>(false);
  selectedFinishes = signal<Record<number, 'walnut' | 'oak' | 'ebony'>>({});

  toggleSpaceDrawer() {
    this.spaceDrawerOpen.update(v => !v);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.spaceDrawerOpen()) {
      this.spaceDrawerOpen.set(false);
    }
  }

  getCategoryLabel(): string {
    if (!this.selectedCategory()) return 'Spaces';
    const found = this.categories().find(c => c.slug === this.selectedCategory());
    return found ? found.name.split(' ')[0] : 'Space';
  }

  getSortLabel(): string {
    switch (this.sortBy) {
      case 'price-asc': return 'Price ↑';
      case 'price-desc': return 'Price ↓';
      default: return 'Newest';
    }
  }

  cycleSortMobile() {
    if (this.sortBy === 'newest') this.sortBy = 'price-asc';
    else if (this.sortBy === 'price-asc') this.sortBy = 'price-desc';
    else this.sortBy = 'newest';
    this.applyFilters();
  }

  getPriceLabel(): string {
    switch (this.selectedPriceRange()) {
      case 'under-3000': return '<₹3k';
      case '3000-10000': return '₹3k-10k';
      case 'above-10000': return '₹10k+';
      default: return 'Budget';
    }
  }

  cyclePriceRangeMobile() {
    if (this.selectedPriceRange() === 'all') this.selectedPriceRange.set('under-3000');
    else if (this.selectedPriceRange() === 'under-3000') this.selectedPriceRange.set('3000-10000');
    else if (this.selectedPriceRange() === '3000-10000') this.selectedPriceRange.set('above-10000');
    else this.selectedPriceRange.set('all');
    this.loadProducts();
  }

  getFinish(productId: number): 'walnut' | 'oak' | 'ebony' {
    return this.selectedFinishes()[productId] || 'walnut';
  }

  setFinish(productId: number, finish: 'walnut' | 'oak' | 'ebony', event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.selectedFinishes.update(curr => ({ ...curr, [productId]: finish }));
  }

  getFinishFilter(productId: number): string {
    const f = this.getFinish(productId);
    if (f === 'oak') return 'brightness(1.08) saturate(1.1)';
    if (f === 'ebony') return 'grayscale(0.7) contrast(1.2)';
    return 'sepia(0.2) contrast(1.05)';
  }

  ngOnInit() {
    this.productService.getCategories().subscribe(cats => this.categories.set(cats));

    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading.set(true);

    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    const range = this.selectedPriceRange();
    if (range === 'under-3000') {
      maxPrice = 3000;
    } else if (range === '3000-10000') {
      minPrice = 3000;
      maxPrice = 10000;
    } else if (range === 'above-10000') {
      minPrice = 10000;
    }

    this.productService.getProducts({
      categorySlug: this.selectedCategory(),
      search: this.searchQuery,
      minPrice,
      maxPrice,
      sortBy: this.sortBy
    }).subscribe({
      next: prods => {
        this.products.set(prods);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  selectCategory(slug: string) {
    this.selectedCategory.set(slug);
    this.loadProducts();
  }

  selectPriceRange(range: string) {
    this.selectedPriceRange.set(range);
    this.loadProducts();
  }

  applyFilters() {
    this.loadProducts();
  }

  resetFilters() {
    this.selectedCategory.set('');
    this.selectedPriceRange.set('all');
    this.searchQuery = '';
    this.sortBy = 'newest';
    this.loadProducts();
  }

  toggleWishlist(productId: number) {
    if (!this.authService.isAuthenticated()) {
      this.notification.warn(
        'Please sign in to save pieces to your wishlist.',
        'Sign In →',
        () => this.router.navigate(['/login'], { queryParams: { returnUrl: '/catalog' } }),
        'Sign In Required'
      );
      return;
    }
    const willBeIn = !this.wishlistService.isInWishlist(productId);
    this.wishlistService.toggle(productId).subscribe({
      next: () => {
        if (willBeIn) {
          this.notification.success('❤️ Saved to your Wishlist!');
        } else {
          this.notification.info('Removed from wishlist');
        }
      }
    });
  }

  addToCart(productId: number) {
    if (!this.authService.isAuthenticated()) {
      this.notification.warn(
        'Please sign in to add handcrafted pieces to your shopping bag.',
        'Sign In →',
        () => this.router.navigate(['/login'], { queryParams: { returnUrl: '/catalog' } }),
        'Sign In Required'
      );
      return;
    }
    this.cartService.addToCart(productId, 1).subscribe({
      next: () => {
        this.notification.success('🛋️ Added to Shopping Bag!', 'View Bag', () => this.cartService.openDrawer());
      }
    });
  }
}

