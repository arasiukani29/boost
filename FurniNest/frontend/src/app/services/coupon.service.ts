import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Coupon, CouponValidationResult } from '../models/furninest.models';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private http = inject(HttpClient);

  getActiveCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${environment.apiUrl}/coupons/active`);
  }

  validateCoupon(code: string, subtotal: number): Observable<CouponValidationResult> {
    return this.http.post<CouponValidationResult>(`${environment.apiUrl}/coupons/validate`, {
      code,
      orderSubtotal: subtotal
    });
  }
}

