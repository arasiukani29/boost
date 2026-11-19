import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminStats, Order, Product, CustomerSummary } from '../models/furninest.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${environment.apiUrl}/admin/stats`);
  }

  getOrders(status?: string): Observable<Order[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Order[]>(`${environment.apiUrl}/admin/orders`, { params });
  }

  updateOrderStatus(orderId: number, data: { status: string; trackingNumber?: string; carrierName?: string }): Observable<Order> {
    return this.http.put<Order>(`${environment.apiUrl}/admin/orders/${orderId}/status`, data);
  }

  getCustomers(): Observable<CustomerSummary[]> {
    return this.http.get<CustomerSummary[]>(`${environment.apiUrl}/admin/customers`);
  }

  getAdminProducts(archivedOnly: boolean = false): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/admin/products?archivedOnly=${archivedOnly}`);
  }

  createProduct(data: any): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/admin/products`, data);
  }

  updateProduct(id: number, data: any): Observable<Product> {
    return this.http.put<Product>(`${environment.apiUrl}/admin/products/${id}`, data);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/admin/products/${id}`);
  }

  restoreProduct(id: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/admin/products/${id}/restore`, {});
  }
}


