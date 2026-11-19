import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <div class="auth-page container animate-fade-in">
      <div class="auth-card">
        <!-- Brand Header -->
        <div class="auth-head">
          <span class="auth-icon">🛋️</span>
          <h2>Sign In to FurniNest</h2>
          <p>Access your curated furniture orders, tracked dispatches, and wishlist.</p>
        </div>

        <!-- Auth Method Tabs -->
        <div class="auth-tabs">
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'password'"
            (click)="switchTab('password')"
          >
            <span class="tab-icon">🔑</span>
            <span>Password</span>
          </button>

          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'otp'"
            (click)="switchTab('otp')"
          >
            <span class="tab-icon">✉️</span>
            <span>Email OTP</span>
          </button>

          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'passkey'"
            (click)="switchTab('passkey')"
          >
            <span class="tab-icon">⚡</span>
            <span>Passkey</span>
          </button>
        </div>

        <!-- ══════════ TAB 1: PASSWORD LOGIN ══════════ -->
        @if (activeTab() === 'password') {
          <form (ngSubmit)="onPasswordLogin()" class="auth-form animate-fade-in">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input 
                type="email" 
                [(ngModel)]="email" 
                name="email" 
                required 
                class="form-input" 
                placeholder="e.g. sarah@example.com" 
                autocomplete="email"
              />
            </div>

            <div class="form-group">
              <div class="pw-header-row">
                <label class="form-label mb-0">Password</label>
                <button type="button" (click)="openForgotPassword()" class="btn-forgot-pw">Forgot Password?</button>
              </div>
              <div class="password-wrapper">
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  [(ngModel)]="password" 
                  name="password" 
                  required 
                  class="form-input" 
                  placeholder="••••••••" 
                  autocomplete="current-password"
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

            <button type="submit" [disabled]="loading()" class="btn btn-primary submit-btn">
              @if (loading()) {
                <span class="spinner-inline"></span> Authenticating...
              } @else {
                Sign In with Password →
              }
            </button>
          </form>

          <!-- Quick 1-Click Demo Buttons -->
          <div class="demo-buttons animate-fade-in">
            <p class="demo-label">✨ Quick 1-Click Demo Login:</p>
            <div class="buttons-grid">
              <button type="button" (click)="fillCustomer()" class="btn btn-outline demo-btn">
                👤 Customer (Sarah)
              </button>
              <button type="button" (click)="fillAdmin()" class="btn btn-outline demo-btn">
                🛡️ Admin (Store Manager)
              </button>
            </div>
          </div>
        }

        <!-- ══════════ TAB 2: EMAIL OTP LOGIN ══════════ -->
        @if (activeTab() === 'otp') {
          <div class="otp-flow animate-fade-in">
            @if (otpStep() === 'email') {
              <form (ngSubmit)="onSendLoginOtp()" class="auth-form">
                <div class="form-group">
                  <label class="form-label">Registered Email Address</label>
                  <input 
                    type="email" 
                    [(ngModel)]="otpEmail" 
                    name="otpEmail" 
                    required 
                    class="form-input" 
                    placeholder="e.g. rahul@test.com or customer@furninest.com" 
                    autocomplete="email"
                  />
                  <span class="form-hint">No password needed. We will send a 6-digit one-time sign-in code.</span>
                </div>

                <button type="submit" [disabled]="loading()" class="btn btn-primary submit-btn">
                  @if (loading()) {
                    <span class="spinner-inline"></span> Sending Code...
                  } @else {
                    Send Sign-In Code →
                  }
                </button>
              </form>
            } @else {
              <!-- OTP input step -->
              <div class="otp-verify-pane animate-fade-in">
                <div class="otp-header">
                  <h3>Enter Sign-In Code</h3>
                  <p>Sent to <strong>{{ otpEmail }}</strong></p>
                </div>

                @if (devOtpHint()) {
                  <div class="dev-hint-card" (click)="fillDevOtp()">
                    <div class="dev-hint-badge">DEV MODE OTP</div>
                    <div class="dev-hint-code">{{ devOtpHint() }}</div>
                    <span class="dev-hint-click">👆 Click to auto-fill</span>
                  </div>
                }

                <div class="otp-inputs" (paste)="onOtpPaste($event)">
                  @for (digit of otpDigits; track $index) {
                    <input 
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      maxlength="1"
                      class="otp-box"
                      [id]="'login-otp-' + $index"
                      [value]="digit"
                      (input)="onOtpInput($index, $event)"
                      (keydown)="onOtpKeyDown($index, $event)"
                      autocomplete="one-time-code"
                    />
                  }
                </div>

                <button 
                  type="button" 
                  (click)="onVerifyLoginOtp()" 
                  [disabled]="loading() || getEnteredOtp().length !== 6" 
                  class="btn btn-primary submit-btn"
                >
                  @if (loading()) {
                    <span class="spinner-inline"></span> Verifying Code...
                  } @else {
                    Verify & Sign In →
                  }
                </button>

                <div class="otp-actions">
                  @if (resendCountdown() > 0) {
                    <span class="resend-timer">Resend in {{ resendCountdown() }}s</span>
                  } @else {
                    <button type="button" class="btn-link" [disabled]="loading()" (click)="onSendLoginOtp()">
                      🔄 Resend Code
                    </button>
                  }
                  <span class="action-divider">•</span>
                  <button type="button" class="btn-link" (click)="otpStep.set('email')">
                    ✏️ Change Email
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <!-- ══════════ TAB 3: PASSKEY LOGIN ══════════ -->
        @if (activeTab() === 'passkey') {
          <div class="passkey-pane animate-fade-in">
            <div class="passkey-hero">
              <span class="passkey-symbol">⚡</span>
              <h3>Instant Biometric Sign-In</h3>
              <p>Sign in safely with Windows Hello, Touch ID, Face ID, or a hardware security key.</p>
            </div>

            <button 
              type="button" 
              (click)="onPasskeyLogin()" 
              [disabled]="loading()" 
              class="btn btn-primary submit-btn passkey-trigger-btn"
            >
              @if (loading()) {
                <span class="spinner-inline"></span> Awaiting Sensor / Security Key...
              } @else {
                🔑 Use Device Passkey →
              }
            </button>

            <div class="passkey-note">
              <p>💡 <strong>First time using Passkey?</strong></p>
              <span>Sign in with your password or email OTP first, then tap "Register Passkey" in your account to link this device.</span>
            </div>
          </div>
        }

        <!-- Auth Footer -->
        <div class="auth-foot">
          <span>New to FurniNest?</span>
          <a routerLink="/register">Create an account</a>
        </div>
      </div>

      <!-- ══════════ FORGOT / RESET PASSWORD MODAL ══════════ -->
      @if (showForgotModal()) {
        <div class="forgot-backdrop" (click)="closeForgotPassword()">
          <div class="forgot-modal-card animate-fade-in" (click)="$event.stopPropagation()">
            <div class="forgot-head">
              <div class="forgot-icon-wrap">🔑</div>
              <div class="forgot-title-box">
                <h3>Reset Your Password</h3>
                <p>We will send a 6-digit verification code to your registered email.</p>
              </div>
              <button (click)="closeForgotPassword()" class="close-forgot-btn" title="Close">✕</button>
            </div>

            @if (forgotStep() === 'email') {
              <form (ngSubmit)="onSendResetOtp()" class="auth-form">
                <div class="form-group">
                  <label class="form-label">Registered Email Address</label>
                  <input 
                    type="email" 
                    [(ngModel)]="forgotEmail" 
                    name="forgotEmail" 
                    required 
                    class="form-input" 
                    placeholder="e.g. sarah@example.com" />
                </div>
                <button type="submit" [disabled]="loading()" class="btn btn-primary submit-btn">
                  @if (loading()) {
                    <span class="spinner-inline"></span> Sending Code...
                  } @else {
                    Send 6-Digit Code →
                  }
                </button>
              </form>
            } @else {
              <form (ngSubmit)="onResetPasswordSubmit()" class="auth-form">
                <div class="form-group">
                  <label class="form-label">6-Digit Verification Code</label>
                  <input 
                    type="text" 
                    [(ngModel)]="resetOtp" 
                    name="resetOtp" 
                    maxlength="6" 
                    required 
                    class="form-input code-input" 
                    placeholder="••••••" />
                  @if (forgotDevHint()) {
                    <div class="dev-hint-tag">⚡ Dev Code: <strong>{{ forgotDevHint() }}</strong></div>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">New Password (min 6 characters)</label>
                  <input 
                    type="password" 
                    [(ngModel)]="newResetPassword" 
                    name="newResetPassword" 
                    required 
                    class="form-input" 
                    placeholder="Enter new password" />
                </div>

                <div class="form-group">
                  <label class="form-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    [(ngModel)]="confirmResetPassword" 
                    name="confirmResetPassword" 
                    required 
                    class="form-input" 
                    placeholder="Re-enter new password" />
                </div>

                <div class="forgot-modal-actions">
                  <button type="button" (click)="forgotStep.set('email')" class="btn btn-outline">← Back</button>
                  <button type="submit" [disabled]="loading()" class="btn btn-primary">
                    @if (loading()) { Updating... } @else { Reset & Save Password → }
                  </button>
                </div>
              </form>
            }
          </div>
        </div>
      }
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

    /* Tabs */
    .auth-tabs {
      display: flex;
      background: #f1f5f9;
      padding: 4px;
      border-radius: 10px;
      margin-bottom: 1.75rem;
      gap: 4px;
    }
    .tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.6rem 0.5rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tab-btn:hover {
      color: var(--text);
    }
    .tab-btn.active {
      background: #ffffff;
      color: var(--primary, #0f172a);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .tab-icon {
      font-size: 0.95rem;
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
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
    }

    /* Form */
    .pw-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;
    }
    .btn-forgot-pw {
      background: none;
      border: none;
      color: var(--accent);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      transition: text-decoration 0.2s;
    }
    .btn-forgot-pw:hover {
      text-decoration: underline;
    }

    /* Forgot Password Modal */
    .forgot-backdrop {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 1.5rem;
      box-sizing: border-box;
    }
    .forgot-modal-card {
      width: 100%;
      max-width: 440px;
      background: var(--bg-card);
      color: var(--text-main);
      border-radius: var(--radius-md);
      padding: 2rem;
      box-shadow: var(--shadow-lg);
      position: relative;
    }
    .forgot-head {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.25rem;
      position: relative;
    }
    .forgot-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #fef3c7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      flex-shrink: 0;
    }
    .forgot-title-box h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.2rem;
    }
    .forgot-title-box p {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.35;
    }
    .close-forgot-btn {
      position: absolute;
      top: -0.25rem;
      right: -0.25rem;
      background: none;
      border: none;
      font-size: 1.2rem;
      color: var(--text-muted);
      cursor: pointer;
    }
    .close-forgot-btn:hover {
      color: var(--text);
    }
    .code-input {
      letter-spacing: 0.25rem;
      font-weight: 700;
      font-size: 1.15rem;
      text-align: center;
    }
    .dev-hint-tag {
      margin-top: 0.35rem;
      font-size: 0.8rem;
      color: #92400e;
      background: #fef3c7;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
    }
    .forgot-modal-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }
    .forgot-modal-actions .btn {
      flex: 1;
    }

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
    .form-hint {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.35rem;
      line-height: 1.35;
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

    /* Demo Buttons */
    .demo-buttons {
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px dashed var(--border);
    }
    .demo-label {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.65rem;
      text-align: center;
    }
    .buttons-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .demo-btn {
      font-size: 0.8rem;
      padding: 0.55rem 0.4rem;
      text-align: center;
    }

    /* OTP Flow */
    .otp-header {
      text-align: center;
      margin-bottom: 1rem;
    }
    .otp-header h3 {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 0.2rem;
    }
    .otp-header p {
      font-size: 0.85rem;
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

    /* Passkey Pane */
    .passkey-pane {
      text-align: center;
      padding: 0.5rem 0;
    }
    .passkey-hero {
      margin-bottom: 1.75rem;
    }
    .passkey-symbol {
      font-size: 3rem;
      display: inline-block;
      margin-bottom: 0.75rem;
    }
    .passkey-hero h3 {
      font-size: 1.35rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
    }
    .passkey-hero p {
      font-size: 0.88rem;
      color: var(--text-muted);
      max-width: 360px;
      margin: 0 auto;
      line-height: 1.45;
    }
    .passkey-trigger-btn {
      font-size: 1.05rem;
      padding: 1rem;
    }
    .passkey-note {
      margin-top: 1.75rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.85rem 1rem;
      text-align: left;
      font-size: 0.82rem;
      color: #64748b;
      line-height: 1.4;
    }
    .passkey-note p {
      color: var(--text);
      margin-bottom: 0.25rem;
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
      .buttons-grid {
        grid-template-columns: 1fr;
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
export class LoginComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab = signal<'password' | 'otp' | 'passkey'>('password');
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  infoMessage = signal<string>('');
  returnUrl = '/';

  // Password Login State
  email = '';
  password = '';
  showPassword = signal<boolean>(false);

  // Forgot Password State
  showForgotModal = signal<boolean>(false);
  forgotStep = signal<'email' | 'reset'>('email');
  forgotEmail = '';
  resetOtp = '';
  newResetPassword = '';
  confirmResetPassword = '';
  forgotDevHint = signal<string>('');
  forgotError = signal<string>('');
  forgotSuccess = signal<string>('');

  // Email OTP Login State
  otpStep = signal<'email' | 'otp'>('email');
  otpEmail = '';
  devOtpHint = signal<string>('');
  resendCountdown = signal<number>(0);
  otpDigits: string[] = ['', '', '', '', '', ''];
  private timerInterval: any = null;

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  switchTab(tab: 'password' | 'otp' | 'passkey') {
    this.activeTab.set(tab);
    this.errorMessage.set('');
    this.infoMessage.set('');
  }

  // ─── 1. Password Login ───
  fillCustomer() {
    this.email = 'customer@furninest.com';
    this.password = 'Customer@123';
  }

  fillAdmin() {
    this.email = 'admin@furninest.com';
    this.password = 'Admin@123';
  }

  onPasswordLogin() {
    if (!this.email || !this.password) {
      this.notification.warn('Please provide both email and password.');
      return;
    }

    this.loading.set(true);

    this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: res => {
        this.loading.set(false);
        this.notification.success(`Welcome back, ${res.fullName}!`);
        this.navigateAfterAuth(res.role);
      },
      error: err => {
        this.loading.set(false);
        this.notification.error(err.error?.message || 'Invalid email or password.');
      }
    });
  }

  // ─── Forgot Password Handlers ───
  openForgotPassword() {
    this.showForgotModal.set(true);
    this.forgotStep.set('email');
    this.forgotEmail = this.email || '';
    this.forgotError.set('');
    this.forgotSuccess.set('');
    this.resetOtp = '';
    this.newResetPassword = '';
    this.confirmResetPassword = '';
  }

  closeForgotPassword() {
    this.showForgotModal.set(false);
  }

  onSendResetOtp() {
    if (!this.forgotEmail.trim()) {
      this.notification.warn('Please enter your email address.');
      return;
    }
    this.loading.set(true);

    this.authService.forgotPassword(this.forgotEmail.trim()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.forgotStep.set('reset');
        this.forgotDevHint.set(res.devOtpHint || '');
        this.notification.success(res.message, 'Code Sent');
      },
      error: (err) => {
        this.loading.set(false);
        this.notification.error(err.error?.message || 'Failed to send reset code.');
      }
    });
  }

  onResetPasswordSubmit() {
    if (!this.resetOtp.trim() || !this.newResetPassword || !this.confirmResetPassword) {
      this.notification.warn('Please fill out all fields.');
      return;
    }
    if (this.newResetPassword.length < 6) {
      this.notification.warn('Password must be at least 6 characters long.');
      return;
    }
    if (this.newResetPassword !== this.confirmResetPassword) {
      this.notification.warn('Passwords do not match.');
      return;
    }

    this.loading.set(true);

    this.authService.resetPassword({
      email: this.forgotEmail.trim(),
      otp: this.resetOtp.trim(),
      newPassword: this.newResetPassword
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.email = this.forgotEmail.trim();
        this.password = this.newResetPassword;
        this.showForgotModal.set(false);
        this.notification.success('Password successfully reset! You can now sign in with your new password.', 'Sign In', undefined, 'Password Updated');
      },
      error: (err) => {
        this.loading.set(false);
        this.notification.error(err.error?.message || 'Failed to reset password.');
      }
    });
  }

  // ─── 2. Email OTP Login ───
  onSendLoginOtp() {
    if (!this.otpEmail.trim()) {
      this.notification.warn('Please enter your email address.');
      return;
    }

    this.loading.set(true);

    this.authService.sendLoginOtp(this.otpEmail.trim()).subscribe({
      next: res => {
        this.loading.set(false);
        this.otpStep.set('otp');
        this.notification.info(res.message, 'Check Inbox');
        if (res.devOtpHint) {
          this.devOtpHint.set(res.devOtpHint);
        }
        this.startResendTimer();
        setTimeout(() => this.focusOtpBox(0), 100);
      },
      error: err => {
        this.loading.set(false);
        this.notification.error(err.error?.message || 'Could not send sign-in code.');
      }
    });
  }

  onVerifyLoginOtp() {
    const code = this.getEnteredOtp();
    if (code.length !== 6) {
      this.notification.warn('Please enter all 6 digits of your sign-in code.');
      return;
    }

    this.loading.set(true);

    this.authService.verifyLoginOtp({
      email: this.otpEmail.trim(),
      otp: code
    }).subscribe({
      next: res => {
        this.loading.set(false);
        this.notification.success(`Welcome back, ${res.fullName}!`);
        this.navigateAfterAuth(res.role);
      },
      error: err => {
        this.loading.set(false);
        this.notification.error(err.error?.message || 'Invalid or expired sign-in code.');
      }
    });
  }

  fillDevOtp() {
    const hint = this.devOtpHint();
    if (!hint || hint.length !== 6) return;
    for (let i = 0; i < 6; i++) {
      this.otpDigits[i] = hint[i];
    }
  }

  getEnteredOtp(): string {
    return this.otpDigits.join('').trim();
  }

  onOtpInput(index: number, event: any) {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/[^0-9]/g, '');
    this.otpDigits[index] = val ? val[val.length - 1] : '';
    input.value = this.otpDigits[index];

    if (this.otpDigits[index] && index < 5) {
      this.focusOtpBox(index + 1);
    }

    if (this.getEnteredOtp().length === 6) {
      this.onVerifyLoginOtp();
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
      this.onVerifyLoginOtp();
    }
  }

  private focusOtpBox(index: number) {
    const el = document.getElementById(`login-otp-${index}`) as HTMLInputElement;
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

  // ─── 3. Passkey Login (WebAuthn) ───
  async onPasskeyLogin() {
    if (!this.authService.isWebAuthnSupported()) {
      this.notification.warn('Biometric/Passkey authentication is not supported by your current browser.');
      return;
    }

    this.loading.set(true);

    this.authService.getPasskeyLoginChallenge().subscribe({
      next: async (challengeRes) => {
        try {
          const challengeBuffer = this.base64ToArrayBuffer(challengeRes.challenge);

          // Build allowCredentials if backend returned any allowed passkeys
          const allowCredentials = challengeRes.allowedCredentialIds && challengeRes.allowedCredentialIds.length > 0
            ? challengeRes.allowedCredentialIds.map(id => ({
                id: this.base64ToArrayBuffer(id),
                type: 'public-key' as const
              }))
            : undefined;

          const credential = (await navigator.credentials.get({
            publicKey: {
              challenge: challengeBuffer,
              rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
              allowCredentials: allowCredentials,
              userVerification: 'preferred',
              timeout: 60000
            }
          })) as PublicKeyCredential;

          if (!credential) {
            this.loading.set(false);
            this.notification.warn('Passkey verification was cancelled.');
            return;
          }

          const credId = credential.id || this.arrayBufferToBase64(credential.rawId);

          this.authService.verifyPasskeyLogin({
            credentialId: credId
          }).subscribe({
            next: (authRes) => {
              this.loading.set(false);
              this.notification.success(`Passkey recognized! Welcome back, ${authRes.fullName}.`);
              this.navigateAfterAuth(authRes.role);
            },
            error: (err) => {
              this.loading.set(false);
              this.notification.error(err.error?.message || 'Passkey was not recognized. Please sign in with email and password.');
            }
          });
        } catch (err: any) {
          this.loading.set(false);
          if (err.name === 'NotAllowedError') {
            this.notification.warn('Passkey prompt was cancelled or timed out.');
          } else {
            this.notification.error(err.message || 'Passkey authentication failed.');
          }
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.notification.error(err.error?.message || 'Failed to initialize passkey challenge.');
      }
    });
  }

  private navigateAfterAuth(role: string) {
    if (role === 'Admin' && this.returnUrl === '/') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    let normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4 !== 0) {
      normalized += '=';
    }
    const binary = window.atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}
