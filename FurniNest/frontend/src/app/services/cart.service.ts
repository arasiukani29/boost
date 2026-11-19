import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartSummary } from '../models/furninest.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  cart = signal<CartSummary>({
    items: [],
    totalItems: 0,
    subtotal: 0,
    estimatedShipping: 0,
    estimatedTax: 0,
    total: 0
  });

  isDrawerOpen = signal<boolean>(false);
  itemCount = computed(() => this.cart().totalItems);
  subtotal = computed(() => this.cart().subtotal);

  constructor() {
    // If logged in, fetch live cart from server
    if (this.authService.isAuthenticated()) {
      this.refreshCart();
    }
  }

  refreshCart(): Observable<CartSummary> {
    return this.http.get<CartSummary>(`${environment.apiUrl}/cart`).pipe(
      tap(summary => this.cart.set(summary))
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<CartSummary> {
    return this.http.post<CartSummary>(`${environment.apiUrl}/cart/items`, { productId, quantity }).pipe(
      tap(summary => {
        this.cart.set(summary);
        this.openDrawer();
      })
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<CartSummary> {
    return this.http.put<CartSummary>(`${environment.apiUrl}/cart/items/${itemId}`, { quantity }).pipe(
      tap(summary => this.cart.set(summary))
    );
  }

  removeItem(itemId: number): Observable<CartSummary> {
    return this.http.delete<CartSummary>(`${environment.apiUrl}/cart/items/${itemId}`).pipe(
      tap(summary => this.cart.set(summary))
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/cart/clear`).pipe(
      tap(() => {
        this.cart.set({
          items: [],
          totalItems: 0,
          subtotal: 0,
          estimatedShipping: 0,
          estimatedTax: 0,
          total: 0
        });
      })
    );
  }

  openDrawer() {
    this.isDrawerOpen.set(true);
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
  }
}

