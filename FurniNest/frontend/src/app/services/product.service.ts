import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, Category } from '../models/furninest.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }

  getProducts(filters?: {
    categorySlug?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    featuredOnly?: boolean;
  }): Observable<Product[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.categorySlug) params = params.set('categorySlug', filters.categorySlug);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.minPrice != null) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice != null) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.featuredOnly) params = params.set('featuredOnly', 'true');
    }
    return this.http.get<Product[]>(`${environment.apiUrl}/products`, { params });
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products/featured`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/${id}`);
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/slug/${slug}`);
  }
}

