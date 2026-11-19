import { Injectable, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warn' | 'info';
  title?: string;
  message: string;
  action?: string;
  onAction?: () => void;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private dialog = inject(MatDialog);

  // Reactive state for floating top-right notifications
  readonly toasts = signal<Toast[]>([]);
  private timerMap = new Map<string, any>();

  /**
   * Confirmation Dialog Box using Angular Material
   */
  confirm(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '460px',
      maxWidth: '92vw',
      panelClass: 'furninest-dialog-panel',
      autoFocus: false,
      restoreFocus: true
    });

    return dialogRef.afterClosed().pipe(
      map(res => !!res)
    );
  }

  /**
   * Display a top-right floating toast notification
   */
  show(toast: Omit<Toast, 'id'>): string {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const duration = toast.duration ?? (toast.type === 'error' ? 5000 : 4000);

    const newToast: Toast = {
      ...toast,
      id,
      duration
    };

    // Keep up to 5 concurrent toasts, prepend latest
    this.toasts.update(current => [newToast, ...current].slice(0, 5));

    if (duration > 0) {
      const timer = setTimeout(() => {
        this.dismiss(id);
      }, duration);
      this.timerMap.set(id, timer);
    }

    return id;
  }

  /**
   * Dismiss a toast by ID
   */
  dismiss(id: string) {
    if (this.timerMap.has(id)) {
      clearTimeout(this.timerMap.get(id));
      this.timerMap.delete(id);
    }
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  /**
   * Pause auto-dismiss timer on mouse hover
   */
  pauseAutoDismiss(id: string) {
    if (this.timerMap.has(id)) {
      clearTimeout(this.timerMap.get(id));
      this.timerMap.delete(id);
    }
  }

  /**
   * Resume auto-dismiss timer on mouse leave
   */
  resumeAutoDismiss(id: string) {
    if (!this.timerMap.has(id)) {
      const timer = setTimeout(() => {
        this.dismiss(id);
      }, 2500);
      this.timerMap.set(id, timer);
    }
  }

  /**
   * Clean, convenient wrappers
   */
  success(message: string, action?: string, onAction?: () => void, title: string = 'Success') {
    return this.show({
      type: 'success',
      title,
      message,
      action: action === 'Dismiss' ? undefined : action,
      onAction,
      duration: 4000
    });
  }

  info(message: string, action?: string, onAction?: () => void, title: string = 'FurniNest Notice') {
    return this.show({
      type: 'info',
      title,
      message,
      action,
      onAction,
      duration: 4000
    });
  }

  warn(message: string, action?: string, onAction?: () => void, title: string = 'Attention') {
    return this.show({
      type: 'warn',
      title,
      message,
      action: action === 'OK' ? undefined : action,
      onAction,
      duration: 5000
    });
  }

  error(message: string, action?: string, onAction?: () => void, title: string = 'Action Needed') {
    return this.show({
      type: 'error',
      title,
      message,
      action: action === 'Close' ? undefined : action,
      onAction,
      duration: 5500
    });
  }
}
