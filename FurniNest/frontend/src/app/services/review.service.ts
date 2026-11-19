import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductReview, ProductReviewsSummary } from '../models/furninest.models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);

  getProductReviews(productId: number): Observable<ProductReviewsSummary> {
    return this.http.get<ProductReviewsSummary>(`${environment.apiUrl}/reviews/product/${productId}`);
  }

  submitReview(review: { productId: number; rating: number; title: string; comment: string; imageUrl?: string }): Observable<ProductReview> {
    return this.http.post<ProductReview>(`${environment.apiUrl}/reviews`, review);
  }
}

