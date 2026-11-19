import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, Location } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';
import { ReviewService } from '../../services/review.service';
import { NotificationService } from '../../services/notification.service';
import { Product, ProductReviewsSummary, ProductReview } from '../../models/furninest.models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, MatTooltipModule],
  template: `
    <div class="product-detail-page container animate-fade-in">
      @if (loading()) {
        <div class="loading-state">
          <p>Loading piece specifications...</p>
        </div>
      } @else if (product()) {
        <!-- Breadcrumbs & Back Action -->
        <div class="top-nav-bar">
          <button (click)="goBack()" class="btn-back-text">
            ← Back
          </button>
          <nav class="breadcrumbs">
            <a routerLink="/">Home</a> <span>/</span>
            <a routerLink="/catalog">Collection</a> <span>/</span>
            <span class="current">{{ product()!.name }}</span>
          </nav>
        </div>

        <div class="product-layout">
          <!-- Multi-Angle Image Gallery with Precision Zoom & Lightbox -->
          <div class="image-gallery">
            <div 
              class="main-image-wrap" 
              (mousemove)="onZoom($event)" 
              (mouseleave)="resetZoom()"
              (click)="openLightbox()"
              matTooltip="Click to inspect in fullscreen">
              
              <img 
                [src]="selectedImage() || product()!.primaryImageUrl" 
                [alt]="product()!.name" 
                class="main-img" 
                [class.zoomed]="isZoomed()"
                [style.transform-origin]="zoomX() + '% ' + zoomY() + '%'" />

              <div class="gallery-badges-overlay">
                @if (product()!.originalPrice) {
                  <span class="discount-badge">Save ₹{{ (product()!.originalPrice! - product()!.price).toLocaleString('en-IN') }}</span>
                } @else {
                  <span></span>
                }
                <span class="zoom-hint-pill">🔍 Hover to Zoom • Tap Fullscreen</span>
              </div>
            </div>

            <!-- Multi-Angle Thumbnails Strip -->
            @if (galleryList().length > 1) {
              <div class="thumbnails-strip">
                @for (img of galleryList(); track img; let idx = $index) {
                  <button 
                    type="button" 
                    (click)="selectImage(img)" 
                    (mouseenter)="selectImage(img)"
                    class="thumb-btn" 
                    [class.active]="(selectedImage() || product()!.primaryImageUrl) === img"
                    [matTooltip]="getAngleName(idx)">
                    <img [src]="img" [alt]="product()!.name + ' angle ' + (idx + 1)" class="thumb-img" />
                    <span class="thumb-caption">{{ getAngleName(idx) }}</span>
                  </button>
                }
              </div>
            }
          </div>

          <!-- Product Specifications & Buy Panel -->
          <div class="details-panel">
            <div class="meta-tags-row">
              <span class="category-tag">{{ product()!.categoryName }}</span>
              @if (reviewsSummary()) {
                <div class="stars-badge">
                  <span class="stars-gold">★ {{ reviewsSummary()!.averageRating }}</span>
                  <span class="review-count">({{ reviewsSummary()!.totalReviews }} Reviews)</span>
                </div>
              }
            </div>

            <h1 class="product-title">{{ product()!.name }}</h1>

            <div class="price-row">
              <span class="price">₹{{ product()!.price.toLocaleString('en-IN') }}</span>
              @if (product()!.originalPrice) {
                <span class="orig-price">₹{{ product()!.originalPrice!.toLocaleString('en-IN') }}</span>
              }
              <span class="tax-note">5% GST calculated at checkout</span>
            </div>

            <p class="description">{{ product()!.description }}</p>

            <!-- Specification Cards -->
            <div class="specs-grid">
              <div class="spec-card">
                <span class="spec-label">Dimensions</span>
                <span class="spec-val">{{ product()!.dimensions }}</span>
              </div>
              <div class="spec-card">
                <span class="spec-label">Materials</span>
                <span class="spec-val">{{ product()!.material }}</span>
              </div>
              <div class="spec-card">
                <span class="spec-label">Finish / Color</span>
                <span class="spec-val">{{ product()!.color }}</span>
              </div>
              <div class="spec-card">
                <span class="spec-label">Availability</span>
                <span class="spec-val" [class.low-stock-text]="product()!.stockQuantity <= 5">
                  {{ product()!.stockQuantity > 0 ? (product()!.stockQuantity + ' Units Ready') : 'Out of Stock' }}
                </span>
              </div>
            </div>

            <!-- PIN Code Delivery Estimator Widget (Module 5) -->
            <div class="pincode-card">
              <div class="pin-title">
                <span>📍 Check Delivery & Assembly Date:</span>
              </div>
              <div class="pin-input-group">
                <input 
                  type="text" 
                  [(ngModel)]="pinCodeInput" 
                  maxlength="6" 
                  placeholder="Enter 6-digit PIN code (e.g. 380054)" 
                  class="form-input pin-input" />
                <button (click)="checkPincode()" class="btn btn-primary btn-sm pin-btn">
                  Check
                </button>
              </div>

              @if (deliveryResult()) {
                <div class="pin-result" [class.available]="deliveryResult()!.available">
                  <span>{{ deliveryResult()!.message }}</span>
                </div>
              }
            </div>

            <!-- Add to Cart & Wishlist Action Bar -->
            <div class="action-bar">
              <div class="quantity-picker">
                <button (click)="decrementQty()" [disabled]="quantity() <= 1">-</button>
                <span class="qty-num">{{ quantity() }}</span>
                <button (click)="incrementQty()" [disabled]="quantity() >= product()!.stockQuantity">+</button>
              </div>

              <button 
                (click)="addToCart()" 
                [disabled]="product()!.stockQuantity <= 0" 
                class="btn btn-accent btn-add">
                {{ product()!.stockQuantity > 0 ? ('Add to Bag • ₹' + (product()!.price * quantity()).toLocaleString('en-IN')) : 'Sold Out' }}
              </button>

              <button 
                (click)="toggleWishlist()" 
                class="btn-wish-toggle" 
                [class.active]="wishlistService.isInWishlist(product()!.id)"
                title="Save to Wishlist">
                {{ wishlistService.isInWishlist(product()!.id) ? '❤️' : '🤍' }}
              </button>
            </div>

            <!-- Confidence Highlights -->
            <div class="confidence-box">
              <div class="conf-item">
                <span class="conf-icon">🚚</span>
                <div>
                  <strong>Free White-Glove Delivery Across India</strong>
                  <p>In-room placement, unboxing, and zero-mess assembly.</p>
                </div>
              </div>
              <div class="conf-item">
                <span class="conf-icon">🛡️</span>
                <div>
                  <strong>10-Year Framework Warranty</strong>
                  <p>Guaranteed structural mortise and tenon integrity.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Verified Reviews Section (Module 2) -->
        <section class="reviews-section">
          <div class="reviews-header">
            <div>
              <span class="section-badge">Client Experiences</span>
              <h2>Verified Customer Reviews</h2>
              @if (reviewsSummary()) {
                <p class="rating-sub">
                  ★ <strong>{{ reviewsSummary()!.averageRating }}</strong> / 5.0 Rating based on {{ reviewsSummary()!.totalReviews }} buyer testimonials
                </p>
              }
            </div>

            <button (click)="showReviewForm.set(!showReviewForm())" class="btn btn-outline btn-sm">
              {{ showReviewForm() ? '✕ Close Review Form' : '✍️ Write a Review' }}
            </button>
          </div>

          <!-- Review Submission Form -->
          @if (showReviewForm()) {
            <div class="card review-form-card animate-fade-in">
              <h3>Share Your Feedback on this Design</h3>
              <form (ngSubmit)="submitReview()" class="review-form">
                <div class="form-group">
                  <label class="form-label">Tap to Rate ({{ newRating }} of 5 Stars)</label>
                  <div class="star-picker-container">
                    <div class="interactive-star-picker">
                      @for (s of [1, 2, 3, 4, 5]; track s) {
                        <button 
                          type="button" 
                          (click)="newRating = s" 
                          class="star-picker-btn" 
                          [class.active]="s <= newRating">
                          ★
                        </button>
                      }
                    </div>
                    <span class="rating-grade-tag">
                      @if (newRating === 5) { ⭐ Outstanding }
                      @else if (newRating === 4) { ⭐ Very Good }
                      @else if (newRating === 3) { ⭐ Average }
                      @else if (newRating === 2) { ⭐ Disappointed }
                      @else { ⭐ Poor }
                    </span>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Review Headline</label>
                  <input type="text" [(ngModel)]="newTitle" name="newTitle" required class="form-input" placeholder="e.g. Masterful joinery and gorgeous velvet" />
                </div>

                <div class="form-group">
                  <label class="form-label">Detailed Comments</label>
                  <textarea [(ngModel)]="newComment" name="newComment" rows="3" required class="form-textarea" placeholder="How does the piece feel in your home? Mention the finish, comfort, and delivery..."></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label">Attach Product Photo (Optional)</label>
                  <div class="review-photo-picker">
                    <input 
                      type="url" 
                      [(ngModel)]="newImageUrl" 
                      name="newImageUrl" 
                      class="form-input" 
                      placeholder="Paste image URL or pick one of the sample customer photos below" />
                    <div class="preset-photo-pills">
                      <span class="preset-label">Quick Samples:</span>
                      <button type="button" (click)="newImageUrl = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'" class="preset-btn">🛋️ Living Room</button>
                      <button type="button" (click)="newImageUrl = 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80'" class="preset-btn">🪵 Wood Texture</button>
                      <button type="button" (click)="newImageUrl = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'" class="preset-btn">✨ Aesthetic Setup</button>
                    </div>
                    @if (newImageUrl) {
                      <div class="photo-preview-box animate-fade-in">
                        <img [src]="newImageUrl" alt="Review Preview" class="photo-preview-thumb" (error)="onImgError($event)" />
                        <button type="button" (click)="newImageUrl = ''" class="btn-clear-photo">✕ Remove Photo</button>
                      </div>
                    }
                  </div>
                </div>

                <button type="submit" class="btn btn-primary">
                  Submit Verified Review
                </button>
              </form>
            </div>
          }

          <!-- Reviews Grid -->
          <div class="reviews-grid">
            @if (reviewsSummary() && reviewsSummary()!.reviews.length > 0) {
              @for (rev of reviewsSummary()!.reviews; track rev.id) {
                <div class="review-card">
                  <div class="rev-head">
                    <div class="rev-stars">
                      @for (star of [1,2,3,4,5]; track star) {
                        <span [class.active-star]="star <= rev.rating">★</span>
                      }
                    </div>
                    <span class="rev-date">{{ rev.createdAt | date:'mediumDate' }}</span>
                  </div>

                  <h4 class="rev-title">{{ rev.title }}</h4>
                  <p class="rev-comment">"{{ rev.comment }}"</p>

                  @if (rev.imageUrl) {
                    <div class="rev-photo-box" (click)="activeReviewPhoto.set(rev.imageUrl)">
                      <img [src]="rev.imageUrl" [alt]="rev.title" class="rev-photo-thumb" (error)="onImgError($event)" />
                      <span class="photo-zoom-hint">🔍 Tap to inspect</span>
                    </div>
                  }

                  <div class="rev-author">
                    <span class="author-avatar">👤</span>
                    <div>
                      <strong class="author-name">{{ rev.reviewerName }}</strong>
                      <span class="badge badge-green verified-tag">✓ Verified Buyer</span>
                    </div>
                  </div>
                </div>
              }
            } @else {
              <div class="no-reviews">
                <p>Be the first to review this artisanal furniture design!</p>
              </div>
            }
          </div>
        </section>

        <!-- Fullscreen High-Definition Lightbox Modal -->
        @if (lightboxOpen()) {
          <div class="lightbox-overlay" (click)="closeLightbox()">
            <div class="lightbox-dialog" (click)="$event.stopPropagation()">
              <button (click)="closeLightbox()" class="lightbox-close-btn" title="Close Lightbox">✕</button>
              
              <div class="lightbox-image-wrap">
                <img [src]="selectedImage() || product()!.primaryImageUrl" [alt]="product()!.name" class="lightbox-img" />
              </div>

              <div class="lightbox-footer">
                <div class="lightbox-caption">
                  <strong>{{ product()!.name }}</strong>
                  <span>High-Definition Texture & Woodwork Inspection</span>
                </div>
                <div class="lightbox-thumbs">
                  @for (img of galleryList(); track img) {
                    <img 
                      [src]="img" 
                      (click)="selectImage(img)" 
                      class="lb-thumb" 
                      [class.active]="(selectedImage() || product()!.primaryImageUrl) === img" />
                  }
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Review Customer Photo Lightbox -->
        @if (activeReviewPhoto()) {
          <div class="lightbox-overlay" (click)="activeReviewPhoto.set(null)">
            <div class="lightbox-dialog" (click)="$event.stopPropagation()">
              <button (click)="activeReviewPhoto.set(null)" class="lightbox-close-btn" title="Close Photo">✕</button>
              
              <div class="lightbox-image-wrap">
                <img [src]="activeReviewPhoto()!" alt="Customer Review Photo" class="lightbox-img" (error)="onImgError($event)" />
              </div>

              <div class="lightbox-footer">
                <div class="lightbox-caption">
                  <strong>📸 Verified Customer Photo</strong>
                  <span>Authentic customer setup inside home environment</span>
                </div>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .product-detail-page {
      padding: 3rem 0 5rem;
    }
    .top-nav-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .btn-back-text {
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
      transition: all 0.2s;
    }
    .btn-back-text:hover {
      background: var(--border);
      color: var(--accent);
    }
    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      color: var(--text-muted);
    }
    .breadcrumbs a:hover {
      color: var(--accent);
    }
    .breadcrumbs .current {
      color: var(--text-main);
      font-weight: 600;
    }
    .product-layout {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 4rem;
      align-items: start;
      margin-bottom: 5rem;
    }
    .main-image-wrap {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-md);
      background: var(--bg-surface);
      height: 480px;
      cursor: crosshair;
    }
    .main-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.15s ease-out;
    }
    .main-img.zoomed {
      transform: scale(2.2);
    }
    .gallery-badges-overlay {
      position: absolute;
      top: 1.25rem;
      left: 1.25rem;
      right: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      pointer-events: none;
    }
    .discount-badge {
      background: #dc2626;
      color: #ffffff;
      font-weight: 700;
      font-size: 0.82rem;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-sm);
    }
    .zoom-hint-pill {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(4px);
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      box-shadow: var(--shadow-sm);
    }
    .thumbnails-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .thumb-btn {
      position: relative;
      background: var(--bg-card);
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      overflow: hidden;
      padding: 0;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      transition: all 0.2s;
    }
    .thumb-btn:hover, .thumb-btn.active {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px rgba(180, 83, 9, 0.2);
      transform: translateY(-2px);
    }
    .thumb-img {
      width: 100%;
      height: 72px;
      object-fit: cover;
    }
    .thumb-caption {
      display: block;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.25rem 0.2rem;
      text-align: center;
      color: var(--text-muted);
      background: #f8fafc;
      border-top: 1px solid var(--border);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .thumb-btn.active .thumb-caption {
      color: var(--accent);
      background: #fef3c7;
      font-weight: 800;
    }

    /* Fullscreen Lightbox */
    .lightbox-overlay {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease-out;
      box-sizing: border-box;
    }
    .lightbox-dialog {
      background: var(--bg-card);
      color: var(--text-main);
      border-radius: var(--radius-md);
      overflow: hidden;
      max-width: 900px;
      width: 100%;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-xl);
      position: relative;
    }
    .lightbox-close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.8);
      color: #ffffff;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: transform 0.2s, background-color 0.2s;
    }
    .lightbox-close-btn:hover {
      background: #000000;
      transform: scale(1.1);
    }
    .lightbox-image-wrap {
      height: 520px;
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .lightbox-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .lightbox-footer {
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-card);
      border-top: 1px solid var(--border);
      flex-wrap: wrap;
      gap: 1rem;
    }
    .lightbox-caption strong {
      display: block;
      font-size: 1.1rem;
      color: var(--text-main);
    }
    .lightbox-caption span {
      font-size: 0.82rem;
      color: var(--text-muted);
    }
    .lightbox-thumbs {
      display: flex;
      gap: 0.5rem;
    }
    .lb-thumb {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 2px solid var(--border);
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .lb-thumb.active {
      border-color: var(--accent);
    }
    .meta-tags-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }
    .category-tag {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .stars-badge {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .stars-gold {
      color: #eab308;
    }
    .review-count {
      color: var(--text-muted);
      font-weight: 500;
      font-size: 0.8rem;
    }
    .product-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    .price-row {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .price {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .orig-price {
      font-size: 1.25rem;
      color: var(--text-muted);
      text-decoration: line-through;
    }
    .tax-note {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .description {
      font-size: 1.05rem;
      color: var(--text-muted);
      line-height: 1.7;
      margin-bottom: 2rem;
    }
    .specs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.75rem;
    }
    .spec-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0.85rem 1rem;
    }
    .spec-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }
    .spec-val {
      font-size: 0.92rem;
      font-weight: 600;
      color: var(--text-main);
    }
    .low-stock-text {
      color: var(--accent);
    }
    /* PIN Code Widget */
    .pincode-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 1rem 1.25rem;
      margin-bottom: 1.75rem;
    }
    .pin-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 0.5rem;
    }
    .pin-input-group {
      display: flex;
      gap: 0.5rem;
    }
    .pin-input {
      font-size: 0.88rem;
      padding: 0.5rem 0.75rem;
      max-width: 260px;
    }
    .pin-btn {
      padding: 0.5rem 1rem;
    }
    .pin-result {
      margin-top: 0.65rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #166534;
    }
    .action-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .quantity-picker {
      display: flex;
      align-items: center;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--bg-card);
      color: var(--text-main);
    }
    .quantity-picker button {
      width: 44px;
      height: 48px;
      font-size: 1.2rem;
      font-weight: 600;
      background: var(--bg-surface);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .quantity-picker button:hover:not(:disabled) {
      background: var(--border);
    }
    .qty-num {
      width: 48px;
      text-align: center;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .btn-add {
      flex: 1;
      height: 48px;
      font-size: 1.05rem;
    }
    .btn-wish-toggle {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--bg-card);
      color: var(--text-main);
      font-size: 1.35rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, transform 0.2s;
    }
    .btn-wish-toggle:hover {
      background: #fef2f2;
      transform: scale(1.05);
    }
    .confidence-box {
      border-top: 1px solid var(--border);
      padding-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .conf-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
    .conf-icon {
      font-size: 1.5rem;
    }
    .conf-item strong {
      font-size: 0.95rem;
      color: var(--text-main);
    }
    .conf-item p {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    /* Reviews Section */
    .reviews-section {
      border-top: 2px solid var(--border);
      padding-top: 4rem;
    }
    .reviews-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2.5rem;
    }
    .section-badge {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      display: block;
      margin-bottom: 0.25rem;
    }
    .reviews-header h2 {
      font-size: 2.25rem;
      margin-bottom: 0.35rem;
    }
    .rating-sub {
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .review-form-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      padding: 1.75rem;
      border-radius: var(--radius-md);
      margin-bottom: 2.5rem;
      color: var(--text-main);
    }
    .review-form-card h3 {
      font-size: 1.25rem;
      margin-bottom: 1.25rem;
      color: var(--text-main);
    }
    .star-picker-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .interactive-star-picker {
      display: inline-flex;
      gap: 0.25rem;
      background: var(--bg-card);
      padding: 0.35rem 0.6rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }
    .star-picker-btn {
      font-size: 1.6rem;
      color: #cbd5e1;
      padding: 0 0.15rem;
      line-height: 1;
      transition: transform 0.15s, color 0.15s;
    }
    .star-picker-btn:hover {
      transform: scale(1.25);
    }
    .star-picker-btn.active {
      color: #f59e0b;
    }
    .rating-grade-tag {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--accent);
      background: var(--accent-light);
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
    }
    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.75rem;
    }
    .review-card {
      background: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }
    .rev-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .rev-stars {
      color: #cbd5e1;
      font-size: 1.1rem;
      letter-spacing: 2px;
    }
    .rev-stars .active-star {
      color: #eab308;
    }
    .rev-date {
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .rev-title {
      font-size: 1.05rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .rev-comment {
      font-size: 0.9rem;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 0.75rem;
    }
    .rev-photo-box {
      margin-bottom: 1rem;
      border-radius: var(--radius-sm);
      overflow: hidden;
      cursor: pointer;
      position: relative;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      max-height: 180px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .rev-photo-box:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .rev-photo-thumb {
      width: 100%;
      height: 180px;
      object-fit: cover;
      display: block;
    }
    .photo-zoom-hint {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(15, 23, 42, 0.75);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      backdrop-filter: blur(4px);
    }
    .review-photo-picker {
      margin-top: 0.35rem;
    }
    .preset-photo-pills {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }
    .preset-label {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .preset-btn {
      font-size: 0.78rem;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      border: 1px solid var(--border);
      background: var(--bg-surface);
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .preset-btn:hover {
      background: var(--accent-light);
      border-color: var(--accent);
      color: var(--accent);
    }
    .photo-preview-box {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 0.75rem;
      padding: 0.5rem;
      background: var(--bg-surface);
      border: 1px dashed var(--border);
      border-radius: var(--radius-sm);
    }
    .photo-preview-thumb {
      width: 70px;
      height: 70px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid var(--border);
    }
    .btn-clear-photo {
      font-size: 0.8rem;
      color: #ef4444;
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 600;
    }
    .btn-clear-photo:hover {
      text-decoration: underline;
    }
    .rev-author {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      border-top: 1px solid var(--border);
      padding-top: 0.75rem;
    }
    .author-name {
      display: block;
      font-size: 0.85rem;
    }
    .verified-tag {
      font-size: 0.68rem;
      padding: 0.15rem 0.4rem;
    }
    .no-reviews {
      text-align: center;
      padding: 3rem;
      color: var(--text-muted);
      grid-column: 1 / -1;
    }
    @media (max-width: 900px) {
      .product-detail-page {
        padding: 1.5rem 0 3.5rem;
      }
      .product-layout {
        grid-template-columns: 1fr;
        gap: 2rem;
        margin-bottom: 3rem;
      }
      .main-image-wrap {
        height: 320px;
      }
      .product-title {
        font-size: 1.85rem;
      }
      .price {
        font-size: 1.6rem;
      }
      .reviews-section {
        padding-top: 2.5rem;
      }
      .reviews-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      .reviews-header h2 {
        font-size: 1.75rem;
      }
      .reviews-grid {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }
    }
    @media (max-width: 600px) {
      .main-image-wrap {
        height: 250px;
      }
      .thumbnails-strip {
        display: flex;
        overflow-x: auto;
        gap: 0.5rem;
        padding-bottom: 0.35rem;
        -webkit-overflow-scrolling: touch;
      }
      .thumb-btn {
        flex: 0 0 82px;
        min-width: 82px;
      }
      .thumb-img {
        height: 58px;
      }
      .specs-grid {
        grid-template-columns: 1fr;
        gap: 0.65rem;
      }
      .action-bar {
        flex-direction: column;
        gap: 0.75rem;
      }
      .quantity-picker {
        width: 100%;
        justify-content: space-between;
      }
      .quantity-picker button {
        flex: 1;
        height: 44px;
      }
      .qty-num {
        width: 60px;
      }
      .btn-add {
        width: 100%;
        height: 48px;
      }
      .btn-wish-toggle {
        width: 100%;
        height: 44px;
      }
      .pin-input-group {
        flex-direction: column;
      }
      .pin-input {
        max-width: 100%;
        width: 100%;
      }
      .pin-btn {
        width: 100%;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  wishlistService = inject(WishlistService);
  private reviewService = inject(ReviewService);
  private notification = inject(NotificationService);

  product = signal<Product | null>(null);
  reviewsSummary = signal<ProductReviewsSummary | null>(null);
  loading = signal<boolean>(true);
  quantity = signal<number>(1);

  // Multi-Angle Image Gallery & Precision Zoom State
  selectedImage = signal<string>('');
  isZoomed = signal<boolean>(false);
  zoomX = signal<number>(50);
  zoomY = signal<number>(50);
  lightboxOpen = signal<boolean>(false);

  galleryList = computed(() => {
    const p = this.product();
    if (!p) return [];
    if (p.galleryImages && p.galleryImages.length > 0) {
      return p.galleryImages;
    }
    return [p.primaryImageUrl];
  });

  // Pin code serviceability
  pinCodeInput = '380054';
  deliveryResult = signal<{ available: boolean; message: string } | null>(null);

  // Review Form
  showReviewForm = signal<boolean>(false);
  newRating = 5;
  newTitle = '';
  newComment = '';
  newImageUrl = '';
  activeReviewPhoto = signal<string | null>(null);

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: number) {
    this.productService.getProductById(id).subscribe({
      next: p => {
        this.product.set(p);
        this.selectedImage.set(p.primaryImageUrl);
        this.loading.set(false);
        this.loadReviews(id);
        this.checkPincode();
      },
      error: () => this.loading.set(false)
    });
  }

  selectImage(img: string) {
    this.selectedImage.set(img);
  }

  onZoom(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    this.zoomX.set(Math.max(0, Math.min(100, x)));
    this.zoomY.set(Math.max(0, Math.min(100, y)));
    this.isZoomed.set(true);
  }

  resetZoom() {
    this.isZoomed.set(false);
  }

  openLightbox() {
    this.lightboxOpen.set(true);
  }

  closeLightbox() {
    this.lightboxOpen.set(false);
  }

  getAngleName(idx: number): string {
    switch (idx) {
      case 0: return 'Full View';
      case 1: return 'Corner & Armrest';
      case 2: return 'Texture Macro';
      case 3: return 'Base & Legs';
      default: return `Angle ${idx + 1}`;
    }
  }

  loadReviews(productId: number) {
    this.reviewService.getProductReviews(productId).subscribe(sum => {
      this.reviewsSummary.set(sum);
    });
  }

  checkPincode() {
    const pin = this.pinCodeInput.trim();
    if (pin.length < 6) {
      this.deliveryResult.set({ available: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
      return;
    }

    // Dynamic Indian city delivery estimate
    const prefix = pin.substring(0, 2);
    let region = 'Western India';
    let days = 3;

    if (prefix === '38' || prefix === '39') { region = 'Gujarat'; days = 2; }
    else if (prefix === '40' || prefix === '41') { region = 'Maharashtra'; days = 3; }
    else if (prefix === '11') { region = 'Delhi NCR'; days = 3; }
    else if (prefix === '56') { region = 'Karnataka'; days = 4; }
    else if (prefix === '60') { region = 'Tamil Nadu'; days = 4; }
    else { days = 5; }

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);

    this.deliveryResult.set({
      available: true,
      message: `🚚 Free White-Glove Delivery to ${region} available by ${deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })} via BlueDart Express.`
    });
  }

  toggleWishlist() {
    if (!this.product()) return;
    if (!this.authService.isAuthenticated()) {
      const returnUrl = `/product/${this.product()!.id}`;
      this.notification.warn(
        'Please sign in to save pieces to your wishlist.',
        'Sign In →',
        () => this.router.navigate(['/login'], { queryParams: { returnUrl } }),
        'Sign In Required'
      );
      return;
    }
    const willBeIn = !this.wishlistService.isInWishlist(this.product()!.id);
    this.wishlistService.toggle(this.product()!.id).subscribe({
      next: () => {
        if (willBeIn) {
          this.notification.success('❤️ Saved to your Wishlist!');
        } else {
          this.notification.info('Removed from wishlist');
        }
      }
    });
  }

  incrementQty() {
    if (this.product() && this.quantity() < this.product()!.stockQuantity) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQty() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart() {
    if (!this.product()) return;

    if (!this.authService.isAuthenticated()) {
      const p = this.product()!;
      const returnUrl = `/product/${p.id}`;
      this.notification.warn(
        `Please sign in to add "${p.name}" to your shopping bag.`,
        'Sign In →',
        () => this.router.navigate(['/login'], { queryParams: { returnUrl } }),
        'Sign In Required'
      );
      return;
    }

    const qty = this.quantity();
    this.cartService.addToCart(this.product()!.id, qty).subscribe({
      next: () => {
        this.notification.success(`🛋️ Added ${qty} × ${this.product()!.name} to bag!`, 'View Bag', () => this.cartService.openDrawer());
      }
    });
  }

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/catalog']);
    }
  }

  submitReview() {
    if (!this.authService.isAuthenticated()) {
      const returnUrl = `/product/${this.product()?.id}`;
      this.notification.warn(
        'Please sign in to write an artisan piece review.',
        'Sign In →',
        () => this.router.navigate(['/login'], { queryParams: { returnUrl } }),
        'Sign In Required'
      );
      return;
    }

    if (!this.product() || !this.newTitle || !this.newComment) {
      this.notification.warn('Please fill out both the headline and comments.');
      return;
    }

    this.reviewService.submitReview({
      productId: this.product()!.id,
      rating: Number(this.newRating),
      title: this.newTitle,
      comment: this.newComment,
      imageUrl: this.newImageUrl.trim() || undefined
    }).subscribe({
      next: () => {
        this.notification.success('⭐ Thank you! Your verified review has been published.');
        this.showReviewForm.set(false);
        this.newTitle = '';
        this.newComment = '';
        this.newImageUrl = '';
        this.loadReviews(this.product()!.id);
      },
      error: () => this.notification.error('Failed to publish review.')
    });
  }
}
