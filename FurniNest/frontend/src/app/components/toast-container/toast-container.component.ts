import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-viewport" aria-live="polite" aria-atomic="true">
      @for (toast of notification.toasts(); track toast.id) {
        <div 
          class="toast-item"
          [class.toast-success]="toast.type === 'success'"
          [class.toast-error]="toast.type === 'error'"
          [class.toast-warn]="toast.type === 'warn'"
          [class.toast-info]="toast.type === 'info'"
          (mouseenter)="pauseToast(toast.id)"
          (mouseleave)="resumeToast(toast.id)"
          role="alert"
        >
          <!-- Status Icon -->
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') {
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              }
              @case ('error') {
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              }
              @case ('warn') {
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              }
              @default {
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              }
            }
          </div>

          <!-- Toast Content -->
          <div class="toast-content">
            <div class="toast-header-line">
              <span class="toast-title">{{ toast.title || defaultTitle(toast.type) }}</span>
              <button 
                type="button" 
                class="toast-close" 
                (click)="dismiss(toast.id)" 
                title="Dismiss"
                aria-label="Close"
              >✕</button>
            </div>
            
            <p class="toast-text">{{ toast.message }}</p>

            @if (toast.action) {
              <div class="toast-action-row">
                <button 
                  type="button" 
                  class="toast-action-btn" 
                  (click)="handleAction(toast)"
                >
                  <span>{{ formatAction(toast.action) }}</span>
                  <svg class="btn-arrow" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-viewport {
      position: fixed;
      top: 18px;
      right: 18px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
      align-items: flex-end;
    }

    .toast-item {
      pointer-events: auto;
      background: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: var(--shadow-lg);
      padding: 10px 12px;
      display: flex;
      gap: 9px;
      align-items: flex-start;
      width: 290px;
      max-width: calc(100vw - 32px);
      animation: toastIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .toast-item:hover {
      box-shadow: var(--shadow-xl);
    }

    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateY(-6px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .toast-icon {
      flex-shrink: 0;
      width: 17px;
      height: 17px;
      margin-top: 1.5px;
    }

    .toast-icon svg {
      width: 100%;
      height: 100%;
    }

    .toast-success .toast-icon { color: #16a34a; }
    .toast-error .toast-icon { color: #dc2626; }
    .toast-warn .toast-icon { color: #d97706; }
    .toast-info .toast-icon { color: #2563eb; }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-header-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: 1.2;
    }

    .toast-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.01em;
    }

    .toast-close {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 0.7rem;
      cursor: pointer;
      padding: 1px 4px;
      border-radius: 3px;
      line-height: 1;
      transition: color 0.15s, background-color 0.15s;
    }

    .toast-close:hover {
      color: var(--text-main);
      background: var(--bg-surface);
    }

    .toast-text {
      font-size: 0.76rem;
      color: var(--text-muted);
      line-height: 1.35;
      margin: 3px 0 0;
      word-break: break-word;
    }

    .toast-action-row {
      margin-top: 6px;
    }

    .toast-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: var(--bg-surface);
      color: var(--accent);
      border: 1px solid var(--border);
      border-radius: 5px;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 3px 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      line-height: 1.2;
    }

    .toast-action-btn .btn-arrow {
      width: 12px;
      height: 12px;
      transition: transform 0.15s ease;
    }

    .toast-action-btn:hover {
      background: var(--accent);
      color: #0b0f19;
      border-color: var(--accent);
    }

    .toast-action-btn:hover .btn-arrow {
      transform: translateX(2px);
    }

    @media (max-width: 480px) {
      .toast-viewport {
        top: 12px;
        right: 12px;
        left: 12px;
        width: auto;
      }
      .toast-item {
        width: 100%;
      }
    }
  `]
})
export class ToastContainerComponent {
  notification = inject(NotificationService);

  formatAction(action?: string): string {
    if (!action) return '';
    // Strip redundant trailing arrows or unicode arrows so only clean label remains
    return action.replace(/[→\->\s]+$/g, '').trim();
  }

  defaultTitle(type: 'success' | 'error' | 'warn' | 'info'): string {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Action Needed';
      case 'warn': return 'Attention';
      case 'info': return 'Notice';
    }
  }

  dismiss(id: string) {
    this.notification.dismiss(id);
  }

  pauseToast(id: string) {
    this.notification.pauseAutoDismiss(id);
  }

  resumeToast(id: string) {
    this.notification.resumeAutoDismiss(id);
  }

  handleAction(toast: Toast) {
    if (toast.onAction) {
      toast.onAction();
    }
    this.notification.dismiss(toast.id);
  }
}
