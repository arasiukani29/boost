import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse, OtpSentResponse, PasskeyChallengeResponse } from '../models/furninest.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'furninest_token';
  private readonly USER_KEY = 'furninest_user';

  // State Signals
  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'Admin');

  constructor() {
    // If token exists, verify & refresh profile
    if (this.token()) {
      this.refreshProfile().subscribe({
        error: () => this.logout()
      });
    }
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // --- Registration Flows ---
  registerInit(data: { fullName: string; email: string; password: string; city?: string }): Observable<OtpSentResponse> {
    return this.http.post<OtpSentResponse>(`${environment.apiUrl}/auth/register-init`, data);
  }

  registerVerify(data: { email: string; otp: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register-verify`, data).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  // Legacy direct registration (kept for backward compatibility)
  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  // --- Login Flows ---
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  sendLoginOtp(email: string): Observable<OtpSentResponse> {
    return this.http.post<OtpSentResponse>(`${environment.apiUrl}/auth/send-login-otp`, { email });
  }

  verifyLoginOtp(data: { email: string; otp: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/verify-login-otp`, data).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  // --- Forgot & Reset Password Flows ---
  forgotPassword(email: string): Observable<OtpSentResponse> {
    return this.http.post<OtpSentResponse>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(data: { email: string; otp: string; newPassword: string }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${environment.apiUrl}/auth/reset-password`, data);
  }

  // --- Passkey / WebAuthn Flows ---
  isWebAuthnSupported(): boolean {
    return typeof window !== 'undefined' && !!window.PublicKeyCredential;
  }

  getPasskeyRegisterChallenge(): Observable<PasskeyChallengeResponse> {
    return this.http.post<PasskeyChallengeResponse>(`${environment.apiUrl}/auth/passkey/register-challenge`, {});
  }

  verifyPasskeyRegister(data: { credentialId: string; publicKey: string; deviceName?: string }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${environment.apiUrl}/auth/passkey/register-verify`, data);
  }

  getPasskeyLoginChallenge(email?: string): Observable<PasskeyChallengeResponse> {
    return this.http.post<PasskeyChallengeResponse>(`${environment.apiUrl}/auth/passkey/login-challenge`, { email });
  }

  verifyPasskeyLogin(data: { credentialId: string; authenticatorData?: string; clientDataJson?: string; signature?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/passkey/login-verify`, data).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  refreshProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      })
    );
  }

  handleAuthSuccess(res: AuthResponse) {
    const user: User = {
      id: res.id,
      fullName: res.fullName,
      email: res.email,
      role: res.role
    };

    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    this.token.set(res.token);
    this.currentUser.set(user);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }
}


