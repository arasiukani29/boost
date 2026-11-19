import { Component, inject, signal, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <div class="auth-page container animate-fade-in">
      <div class="auth-card">
        <!-- Brand Header -->
        <div class="auth-head">
          <span class="auth-icon">🛋️</span>
          <h2>Create Your FurniNest Account</h2>
          <p>Join our design community for curated furniture releases and fast delivery tracking.</p>
        </div>

        <!-- Step Indicator -->
        <div class="step-progress">
          <div class="step-pill" [class.active]="step() === 'form'" [class.done]="step() === 'otp'">
            <span class="step-num">1</span>
            <span class="step-label">Account Details</span>
          </div>
          <div class="step-divider"></div>
          <div class="step-pill" [class.active]="step() === 'otp'">
            <span class="step-num">2</span>
            <span class="step-label">Email Verification</span>
          </div>
        </div>

        <!-- STEP 1: REGISTRATION FORM -->
        @if (step() === 'form') {
          <form (ngSubmit)="onSendOtp()" class="auth-form">
            <div class="form-group">
              <label class="form-label">Full Name <span class="required">*</span></label>
              <input 
                type="text" 
                [(ngModel)]="fullName" 
                name="fullName" 
                required 
                class="form-input" 
                placeholder="e.g. Sarah Jenkins" 
                autocomplete="name"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Email Address <span class="required">*</span></label>
              <input 
                type="email" 
                [(ngModel)]="email" 
                name="email" 
                required 
                class="form-input" 
                placeholder="e.g. sarah@example.com" 
                autocomplete="email"
              />
              <span class="form-hint">A 6-digit confirmation code will be sent to this email.</span>
            </div>

            <div class="form-group">
              <label class="form-label">Password <span class="required">*</span></label>
              <div class="password-wrapper">
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  [(ngModel)]="password" 
                  name="password" 
                  required 
                  class="form-input" 
                  placeholder="At least 6 characters" 
                  autocomplete="new-password"
                />
                <button 
                  type="button" 
                  class="toggle-pw-btn" 
                  (click)="showPassword.set(!showPassword())" 
                  tabindex="-1"
                >
                  {{ showPassword() ? '👁️' : '🔒' }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Shipping City (Optional)</label>
              <input 
                type="text" 
                [(ngModel)]="city" 
                name="city" 
                class="form-input" 
                placeholder="e.g. Mumbai, Bengaluru, Delhi" 
                autocomplete="address-level2"
              />
            </div>

            <button type="submit" [disabled]="loading()" class="btn btn-primary submit-btn">
              @if (loading()) {
                <span class="spinner-inline"></span> Sending Code...
              } @else {
                Continue & Verify Email →
              }
            </button>
          </form>
        }

        <!-- STEP 2: OTP VERIFICATION -->
        @if (step() === 'otp') {
          <div class="otp-container animate-fade-in">
            <div class="otp-header">
              <h3>Enter 6-Digit Code</h3>
              <p>We sent a verification code to <strong>{{ email }}</strong></p>
            </div>

            <!-- Dev mode quick-fill badge -->
            @if (devOtpHint()) {
              <div class="dev-hint-card" (click)="fillDevOtp()">
                <div class="dev-hint-badge">DEV MODE OTP</div>
                <div class="dev-hint-code">{{ devOtpHint() }}</div>
                <span class="dev-hint-click">👆 Click to auto-fill</span>
              </div>
            }

            <!-- 6-Digit Boxes -->
            <div class="otp-inputs" (paste)="onOtpPaste($event)">
              @for (digit of otpDigits; track $index) {
                <input 
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength="1"
                  class="otp-box"
                  [id]="'reg-otp-' + $index"
                  [value]="digit"
                  (input)="onOtpInput($index, $event)"
                  (keydown)="onOtpKeyDown($index, $event)"
                  autocomplete="one-time-code"
                />
              }
            </div>

            <button 
              type="button" 
              (click)="onVerifyOtp()" 
              [disabled]="loading() || getEnteredOtp().length !== 6" 
              class="btn btn-primary submit-btn"
            >
              @if (loading()) {
                <span class="spinner-inline"></span> Verifying & Registering...
              } @else {
                Verify & Create Account →
              }
            </button>

            <!-- Resend & Edit details controls -->
            <div class="otp-actions">
              @if (resendCountdown() > 0) {
                <span class="resend-timer">Resend code in {{ resendCountdown() }}s</span>
              } @else {
                <button type="button" class="btn-link" [disabled]="loading()" (click)="onResendOtp()">
                  🔄 Resend Verification Code
                </button>
              }
              <span class="action-divider">•</span>
              <button type="button" class="btn-link" (click)="backToForm()">
                ✏️ Edit Email / Details
              </button>
            </div>
          </div>
        }

        <div class="auth-foot">
          <span>Already have an account?</span>
          <a routerLink="/login">Sign In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      padding: 3.5rem 0 5rem;
      display: flex;
      justify-content: center;
    }
    .auth-card {
      width: 100%;
      max-width: 480px;
      background: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 2.25rem 2.25rem 2rem;
      box-shadow: var(--shadow-md);
    }
    .auth-head {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .auth-icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.4rem;
    }
    .auth-head h2 {
      font-size: 1.65rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.35rem;
    }
    .auth-head p {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* Step indicator */
    .step-progress {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1.75rem;
      padding: 0.5rem 0.75rem;
      background: #f8fafc;
      border-radius: 999px;
      border: 1px solid #e2e8f0;
    }
    .step-pill {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #94a3b8;
      transition: all 0.2s ease;
    }
    .step-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #64748b;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
    }
    .step-pill.active {
      color: var(--primary, #1e293b);
    }
    .step-pill.active .step-num {
      background: var(--primary, #0f172a);
      color: #ffffff;
    }
    .step-pill.done .step-num {
      background: #10b981;
      color: #ffffff;
    }
    .step-divider {
      width: 28px;
      height: 2px;
      background: #cbd5e1;
    }

    /* Alerts */
    .alert {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
    }
    .alert-error {
      background: #fef2f2;
      border: 1px solid #fca5a5;
      color: #991b1b;
    }
    .alert-info {
      background: #f0fdf4;
      border: 1px solid #86efac;
      color: #166534;
    }

    /* Form */
    .form-group {
      margin-bottom: 1.15rem;
    }
    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.35rem;
    }
    .required {
      color: #ef4444;
    }
    .form-hint {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.3rem;
    }
    .password-wrapper {
      position: relative;
    }
    .toggle-pw-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 4px;
      opacity: 0.7;
    }
    .toggle-pw-btn:hover {
      opacity: 1;
    }
    .submit-btn {
      width: 100%;
      padding: 0.85rem;
      font-size: 0.95rem;
      font-weight: 600;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    /* OTP Screen */
    .otp-header {
      text-align: center;
      margin-bottom: 1.25rem;
    }
    .otp-header h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.25rem;
    }
    .otp-header p {
      font-size: 0.88rem;
      color: var(--text-muted);
    }
    .dev-hint-card {
      background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
      border: 1px dashed #d97706;
      border-radius: 8px;
      padding: 0.6rem 1rem;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .dev-hint-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .dev-hint-badge {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      background: #d97706;
      color: #ffffff;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .dev-hint-code {
      font-family: monospace;
      font-size: 1.2rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: #92400e;
    }
    .dev-hint-click {
      font-size: 0.72rem;
      color: #b45309;
      font-weight: 600;
    }

    .otp-inputs {
      display: flex;
      justify-content: center;
      gap: 0.6rem;
      margin: 1.25rem 0 1.5rem;
    }
    .otp-box {
      width: 48px;
      height: 56px;
      text-align: center;
      font-size: 1.5rem;
      font-weight: 700;
      font-family: monospace;
      border: 2px solid #cbd5e1;
      border-radius: 8px;
      background: #f8fafc;
      color: #0f172a;
      transition: all 0.2s ease;
    }
    .otp-box:focus {
      outline: none;
      border-color: var(--primary, #0f172a);
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
    }

    .otp-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-top: 1.25rem;
      font-size: 0.85rem;
    }
    .resend-timer {
      color: var(--text-muted);
    }
    .btn-link {
      background: none;
      border: none;
      color: var(--accent, #92400e);
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      font-size: 0.85rem;
    }
    .btn-link:hover {
      text-decoration: underline;
    }
    .action-divider {
      color: #cbd5e1;
    }

    /* Footer */
    .auth-foot {
      text-align: center;
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid #f1f5f9;
      font-size: 0.88rem;
      color: var(--text-muted);
    }
    .auth-foot a {
      color: var(--accent, #92400e);
      font-weight: 600;
      margin-left: 0.35rem;
    }

    .spinner-inline {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 480px) {
      .auth-page {
        padding: 2rem 0 3.5rem;
      }
      .auth-card {
        padding: 1.5rem 1.15rem;
      }
      .otp-inputs {
        gap: 0.4rem;
      }
      .otp-box {
        width: 40px;
        height: 48px;
        font-size: 1.25rem;
      }
    }
  `]
})
export class RegisterComponent implements OnDestroy {
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  step = signal<'form' | 'otp'>('form');
  fullName = '';
  email = '';
  password = '';
  city = '';
  showPassword = signal<boolean>(false);

  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  infoMessage = signal<string>('');
  devOtpHint = signal<string>('');
  resendCountdown = signal<number>(0);

  otpDigits: string[] = ['', '', '', '', '', ''];
  private timerInterval: any = null;

  ngOnDestroy() {
    this.clearTimer();
  }

  onSendOtp() {
    if (!this.fullName.trim() || !this.email.trim() || !this.password) {
      this.notification.warn('Please fill in Full Name, Email, and Password.');
      return;
    }

    if (this.password.length < 6) {
      this.notification.warn('Password must be at least 6 characters long.');
      return;
    }

    this.loading.set(true);

    this.authService.registerInit({
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      password: this.password,
      city: this.city.trim() || undefined
    }).subscribe({
      next: res => {
        this.loading.set(false);
        this.step.set('otp');
        this.notification.info(res.message, 'Check Inbox');
        if (res.devOtpHint) {
          this.devOtpHint.set(res.devOtpHint);
        }
        this.startResendTimer();
        setTimeout(() => this.focusOtpBox(0), 100);
      },
      error: err => {
        this.loading.set(false);
        this.notification.error(err.error?.message || 'Could not send verification code. Please check your details.');
      }
    });
  }

  onVerifyOtp() {
    const code = this.getEnteredOtp();
    if (code.length !== 6) {
      this.notification.warn('Please enter all 6 digits of your verification code.');
      return;
    }

    this.loading.set(true);

    this.authService.registerVerify({
      email: this.email.trim(),
      otp: code
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success('Account created successfully! Welcome to FurniNest.');
        this.router.navigate(['/']);
      },
      error: err => {
        this.loading.set(false);
        this.notification.error(err.error?.message || 'Invalid or expired verification code.');
      }
    });
  }

  onResendOtp() {
    if (this.resendCountdown() > 0) return;
    this.onSendOtp();
  }

  backToForm() {
    this.step.set('form');
    this.errorMessage.set('');
    this.infoMessage.set('');
    this.clearTimer();
  }

  getEnteredOtp(): string {
    return this.otpDigits.join('').trim();
  }

  fillDevOtp() {
    const hint = this.devOtpHint();
    if (!hint || hint.length !== 6) return;
    for (let i = 0; i < 6; i++) {
      this.otpDigits[i] = hint[i];
    }
  }

  onOtpInput(index: number, event: any) {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/[^0-9]/g, '');
    this.otpDigits[index] = val ? val[val.length - 1] : '';
    input.value = this.otpDigits[index];

    if (this.otpDigits[index] && index < 5) {
      this.focusOtpBox(index + 1);
    }

    // Auto-verify if all 6 digits filled
    if (this.getEnteredOtp().length === 6) {
      this.onVerifyOtp();
    }
  }

  onOtpKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      this.focusOtpBox(index - 1);
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') || '';
    const clean = pasted.replace(/[^0-9]/g, '').slice(0, 6);
    if (!clean) return;

    for (let i = 0; i < 6; i++) {
      this.otpDigits[i] = clean[i] || '';
    }

    const lastIdx = Math.min(clean.length, 5);
    this.focusOtpBox(lastIdx);

    if (clean.length === 6) {
      this.onVerifyOtp();
    }
  }

  private focusOtpBox(index: number) {
    const el = document.getElementById(`reg-otp-${index}`) as HTMLInputElement;
    if (el) {
      el.focus();
      el.select();
    }
  }

  private startResendTimer() {
    this.clearTimer();
    this.resendCountdown.set(45);
    this.timerInterval = setInterval(() => {
      const current = this.resendCountdown();
      if (current <= 1) {
        this.clearTimer();
        this.resendCountdown.set(0);
      } else {
        this.resendCountdown.set(current - 1);
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
