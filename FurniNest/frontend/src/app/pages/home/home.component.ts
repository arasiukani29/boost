import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';
import { NotificationService } from '../../services/notification.service';
import { Product, Category } from '../../models/furninest.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatTooltipModule],
  template: `
    <div class="home-page animate-fade-in">
      <!-- Hero Banner -->
      <section class="hero-section">
        <div class="hero-overlay"></div>
        <div class="container hero-content">
          <span class="badge badge-amber hero-pill">Architectural Simplicity</span>
          <h1 class="hero-title">Timeless Solid Wood Furniture For Modern Living.</h1>
          <p class="hero-subtext">
            Hand-built with sustainable FSC-certified hardwoods, natural top-grain leathers, and tailored comfort made to last generations.
          </p>
          <div class="hero-actions">
            <a routerLink="/catalog" class="btn btn-accent btn-lg">Explore Collection</a>
            <a routerLink="/catalog" [queryParams]="{featuredOnly: true}" class="btn btn-outline btn-lg hero-btn-secondary">
              Featured Pieces →
            </a>
          </div>
        </div>
      </section>

      <!-- Category Highlights -->
      <section class="container categories-section">
        <div class="section-header">
          <div>
            <span class="section-subtitle">Curated Environments</span>
            <h2 class="section-title">Shop by Space</h2>
          </div>
          <a routerLink="/catalog" class="view-all-link">View All Catalog →</a>
        </div>

        <div class="categories-grid">
          @for (cat of categories(); track cat.id) {
            <a [routerLink]="['/catalog']" [queryParams]="{category: cat.slug}" class="category-card">
              <div class="cat-img-wrap">
                <img [src]="cat.imageUrl" [alt]="cat.name" class="cat-img" />
                <div class="cat-overlay"></div>
              </div>
              <div class="cat-info">
                <h3>{{ cat.name }}</h3>
                <p>{{ cat.description }}</p>
                <span class="cat-explore">Discover {{ cat.productCount }} Designs →</span>
              </div>
            </a>
          }
        </div>
      </section>

      <!-- Featured Masterpieces -->
      <section class="container featured-section">
        <div class="section-header">
          <div>
            <span class="section-subtitle">Handcrafted Originals</span>
            <h2 class="section-title">Featured Creations</h2>
          </div>
        </div>

        <div class="products-grid">
          @for (product of featuredProducts(); track product.id) {
            <div class="product-card">
              <div class="prod-img-wrap">
                <a [routerLink]="['/product', product.id]">
                  <img [src]="product.primaryImageUrl" [alt]="product.name" class="prod-img" />
                </a>
                <button (click)="toggleWishlist(product.id)" class="wish-heart-btn" [class.active]="wishlistService.isInWishlist(product.id)" title="Save to wishlist">
                  {{ wishlistService.isInWishlist(product.id) ? '❤️' : '🤍' }}
                </button>
                @if (product.originalPrice) {
                  <span class="discount-tag">Save ₹{{ (product.originalPrice - product.price).toLocaleString('en-IN') }}</span>
                }
              </div>

              <div class="prod-body">
                <div class="prod-cat">{{ product.categoryName }}</div>
                <h3 class="prod-name">
                  <a [routerLink]="['/product', product.id]">{{ product.name }}</a>
                </h3>
                <p class="prod-material">{{ product.material }}</p>

                <div class="prod-footer">
                  <div class="price-wrap">
                    <span class="current-price">₹{{ product.price.toLocaleString('en-IN') }}</span>
                    @if (product.originalPrice) {
                      <span class="orig-price">₹{{ product.originalPrice.toLocaleString('en-IN') }}</span>
                    }
                  </div>

                  <button (click)="addToCart(product.id)" class="btn btn-primary btn-sm add-cart-btn">
                    + Add to Bag
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Value Pillars -->
      <section class="pillars-section">
        <div class="container pillars-grid">
          <div class="pillar-card">
            <span class="pillar-icon">🌲</span>
            <h4>FSC-Certified Hardwood</h4>
            <p>Every tree harvested for our pieces is sustainably replenished in North American and European forests.</p>
          </div>
          <div class="pillar-card">
            <span class="pillar-icon">🔨</span>
            <h4>Mortise & Tenon Craft</h4>
            <p>Traditional master woodcraft joints that endure decades without wobbling or loosening.</p>
          </div>
          <div class="pillar-card">
            <span class="pillar-icon">🚚</span>
            <h4>White-Glove Delivery</h4>
            <p>We deliver directly into your room of choice, assemble each piece, and clear away all packing materials.</p>
          </div>
          <div class="pillar-card">
            <span class="pillar-icon">🛡️</span>
            <h4>10-Year Framework Warranty</h4>
            <p>We stand behind our materials and joints with a comprehensive decade-long structural guarantee.</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero-section {
      position: relative;
      background-image: url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85');
      background-size: cover;
      background-position: center;
      padding: 9rem 0 8rem;
      color: #ffffff;
      margin-bottom: 5rem;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.45) 100%);
    }
    .hero-content {
      position: relative;
      max-width: 680px;
    }
    .hero-pill {
      margin-bottom: 1.25rem;
    }
    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 1.25rem;
    }
    .hero-subtext {
      font-size: 1.15rem;
      color: #cbd5e1;
      line-height: 1.6;
      margin-bottom: 2.25rem;
    }
    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .btn-lg {
      padding: 0.95rem 2rem;
      font-size: 1.05rem;
    }
    .hero-btn-secondary {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(4px);
    }
    .hero-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2.5rem;
    }
    .section-subtitle {
      text-transform: uppercase;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--accent);
      display: block;
      margin-bottom: 0.3rem;
    }
    .section-title {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .view-all-link {
      font-weight: 600;
      color: var(--primary);
    }
    .categories-section {
      margin-bottom: 5.5rem;
    }
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .category-card {
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--bg-card);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border);
      transition: transform 0.25s, box-shadow 0.25s;
    }
    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
    }
    .cat-img-wrap {
      position: relative;
      height: 240px;
      overflow: hidden;
      background: var(--bg-surface);
    }
    .cat-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .category-card:hover .cat-img {
      transform: scale(1.05);
    }
    .cat-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%);
    }
    .cat-info {
      padding: 1.5rem;
    }
    .cat-info h3 {
      font-size: 1.35rem;
      margin-bottom: 0.4rem;
      color: var(--text-main);
    }
    .cat-info p {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 1rem;
    }
    .cat-explore {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--accent);
    }
    .featured-section {
      margin-bottom: 6rem;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
    }
    .product-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.25s, box-shadow 0.25s;
    }
    .product-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }
    .prod-img-wrap {
      position: relative;
      height: 280px;
      overflow: hidden;
      background: var(--bg-surface);
    }
    .prod-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .product-card:hover .prod-img {
      transform: scale(1.04);
    }
    .discount-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      background: #dc2626;
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.3rem 0.6rem;
      border-radius: var(--radius-sm);
    }
    .wish-heart-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--bg-card);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s, background-color 0.2s;
    }
    .wish-heart-btn:hover {
      transform: scale(1.15);
      background: var(--bg-surface);
    }
    .prod-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .prod-cat {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.35rem;
    }
    .prod-name {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }
    .prod-material {
      font-size: 0.85rem;
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
      gap: 0.5rem;
    }
    .current-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--accent);
    }
    .orig-price {
      font-size: 0.9rem;
      color: #94a3b8;
      text-decoration: line-through;
    }
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }
    .pillars-section {
      background: var(--bg-card);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 4.5rem 0;
    }
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 2.5rem;
    }
    .pillar-card {
      text-align: center;
    }
    .pillar-icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 1rem;
    }
    .pillar-card h4 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }
    .pillar-card p {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.5;
    }
    @media (max-width: 768px) {
      .hero-section {
        padding: 4.5rem 0 3.5rem;
        margin-bottom: 3rem;
      }
      .hero-title {
        font-size: 2rem;
        line-height: 1.2;
      }
      .hero-subtext {
        font-size: 0.95rem;
        margin-bottom: 1.75rem;
      }
      .hero-actions {
        flex-direction: column;
        width: 100%;
      }
      .hero-actions .btn {
        width: 100%;
      }
      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 1.75rem;
      }
      .section-title {
        font-size: 1.75rem;
      }
      .categories-section {
        margin-bottom: 3.5rem;
      }
      .categories-grid {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }
      .cat-img-wrap {
        height: 200px;
      }
      .featured-section {
        margin-bottom: 3.5rem;
      }
      .products-grid {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }
      .prod-img-wrap {
        height: 220px;
      }
      .prod-body {
        padding: 1rem;
      }
      .pillars-section {
        padding: 3rem 0;
      }
      .pillars-grid {
        grid-template-columns: 1fr;
        gap: 1.75rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  wishlistService = inject(WishlistService);

  categories = signal<Category[]>([]);
  featuredProducts = signal<Product[]>([]);

  ngOnInit() {
    this.productService.getCategories().subscribe(cats => this.categories.set(cats));
    this.productService.getFeaturedProducts().subscribe(prods => this.featuredProducts.set(prods));
  }

  toggleWishlist(productId: number) {
    if (!this.authService.isAuthenticated()) {
      this.notification.warn(
        'Please sign in to save pieces to your wishlist.',
        'Sign In →',
        () => this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } }),
        'Sign In Required'
      );
      return;
    }
    const willBeIn = !this.wishlistService.isInWishlist(productId);
    this.wishlistService.toggle(productId).subscribe({
      next: () => {
        if (willBeIn) {
          this.notification.success('❤️ Piece added to your wishlist!');
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
        () => this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } }),
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

