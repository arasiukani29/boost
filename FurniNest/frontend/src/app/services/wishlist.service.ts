import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { WishlistItem } from '../models/furninest.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  wishlist = signal<WishlistItem[]>([]);
  count = computed(() => this.wishlist().length);

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.refreshWishlist();
    }
  }

  refreshWishlist(): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(`${environment.apiUrl}/wishlist`).pipe(
      tap(items => this.wishlist.set(items))
    );
  }

  isInWishlist(productId: number): boolean {
    return this.wishlist().some(item => item.productId === productId);
  }

  toggle(productId: number): Observable<any> {
    if (this.isInWishlist(productId)) {
      return this.removeFromWishlist(productId);
    } else {
      return this.addToWishlist(productId);
    }
  }

  addToWishlist(productId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/wishlist/${productId}`, {}).pipe(
      tap(() => this.refreshWishlist().subscribe())
    );
  }

  removeFromWishlist(productId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/wishlist/${productId}`).pipe(
      tap(() => {
        this.wishlist.update(items => items.filter(i => i.productId !== productId));
      })
    );
  }
}

