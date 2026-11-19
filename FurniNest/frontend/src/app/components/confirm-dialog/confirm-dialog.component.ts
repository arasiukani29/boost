import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  subMessage?: string;
  orderNumber?: string;
  amount?: number;
  paymentMethod?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="confirm-dialog-wrap" [class]="'dialog-type-' + (data.type || 'warning')">
      <!-- Top Accent Bar -->
      <div class="dialog-accent-bar"></div>

      <!-- Header -->
      <div class="dialog-header">
        <div class="icon-circle" [class]="'icon-' + (data.type || 'warning')">
          <span>{{ data.icon || (data.type === 'danger' ? '✕' : (data.type === 'info' ? 'ℹ️' : '⚠️')) }}</span>
        </div>
        <div class="header-text">
          <h2 class="dialog-title">{{ data.title }}</h2>
          @if (data.orderNumber) {
            <span class="order-chip">Order #{{ data.orderNumber }}</span>
          }
        </div>
      </div>

      <!-- Content -->
      <div class="dialog-body">
        <p class="main-message">{{ data.message }}</p>

        @if (data.amount || data.subMessage) {
          <div class="detail-highlight-card">
            @if (data.amount) {
              <div class="highlight-row">
                <span class="highlight-label">
                  {{ data.paymentMethod === 'CashOnDelivery' ? 'Pending COD Amount' : 'Full Refund Value' }}
                </span>
                <span class="highlight-amount">₹{{ data.amount.toLocaleString('en-IN') }}</span>
              </div>
            }
            @if (data.subMessage) {
              <p class="sub-message">{{ data.subMessage }}</p>
            }
          </div>
        }
      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <button 
          type="button" 
          class="btn-dialog-cancel" 
          (click)="dialogRef.close(false)">
          {{ data.cancelText || 'Keep Order' }}
        </button>
        <button 
          type="button" 
          class="btn-dialog-confirm" 
          [class]="'btn-' + (data.type || 'warning')" 
          (click)="dialogRef.close(true)">
          {{ data.confirmText || 'Yes, Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog-wrap {
      padding: 1.75rem 1.75rem 1.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      color: var(--text-main);
      position: relative;
      overflow-y: auto;
      width: 100%;
      max-width: 460px;
      max-height: 88vh;
      box-sizing: border-box;
    }

    .dialog-accent-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: #f59e0b;
    }

    .dialog-type-danger .dialog-accent-bar {
      background: #ef4444;
    }

    .dialog-type-info .dialog-accent-bar {
      background: #0284c7;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;
      font-weight: 700;
    }

    .icon-danger {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .icon-warning {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .icon-info {
      background: rgba(2, 132, 199, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(2, 132, 199, 0.3);
    }

    .header-text {
      flex: 1;
    }

    .dialog-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
      line-height: 1.3;
      font-family: inherit;
    }

    .order-chip {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      margin-top: 0.25rem;
      letter-spacing: 0.5px;
    }

    .dialog-body {
      margin-bottom: 1.5rem;
    }

    .main-message {
      font-size: 0.95rem;
      color: var(--text-muted);
      line-height: 1.5;
      margin: 0 0 1rem;
    }

    .detail-highlight-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .highlight-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .highlight-label {
      font-size: 0.82rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .highlight-amount {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .sub-message {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.4;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn-dialog-cancel {
      padding: 0.65rem 1.15rem;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      background: var(--bg-surface);
      color: var(--text-main);
      border: 1px solid var(--border);
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-dialog-cancel:hover {
      background: var(--border);
      color: var(--accent);
    }

    .btn-dialog-confirm {
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      color: #ffffff;
      transition: all 0.2s;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .btn-danger {
      background: #dc2626;
    }
    .btn-danger:hover {
      background: #b91c1c;
      box-shadow: 0 4px 10px rgba(220, 38, 38, 0.25);
    }

    .btn-warning {
      background: #d97706;
    }
    .btn-warning:hover {
      background: #b45309;
      box-shadow: 0 4px 10px rgba(217, 119, 6, 0.25);
    }

    .btn-info {
      background: #0284c7;
    }
    .btn-info:hover {
      background: #0369a1;
      box-shadow: 0 4px 10px rgba(2, 132, 199, 0.25);
    }
  `]
})
export class ConfirmDialogComponent {
  dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
}

