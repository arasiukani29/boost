import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from '../models/furninest.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);

  checkout(orderData: {
    recipientName: string;
    shippingAddress: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    paymentMethod: string;
    cardNumber: string;
    cardExpiry: string;
    cardCvc: string;
    couponCode?: string;
    notes?: string;
  }): Observable<Order> {
    return this.http.post<Order>(`${environment.apiUrl}/orders/checkout`, orderData);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.apiUrl}/orders/my-orders`);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${environment.apiUrl}/orders/${id}`);
  }

  cancelOrder(id: number, reason?: string): Observable<Order> {
    return this.http.post<Order>(`${environment.apiUrl}/orders/${id}/cancel`, { reason });
  }
}

