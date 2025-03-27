import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$: Observable<ToastMessage[]> = this.toastsSubject.asObservable();

  constructor() { }

  /**
   * Show a success toast message
   * @param message The message to display
   * @param duration Duration in milliseconds (default: 3000ms)
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.showToast(message, 'success', duration);
  }

  /**
   * Show an error toast message
   * @param message The message to display
   * @param duration Duration in milliseconds (default: 5000ms)
   */
  showError(message: string, duration: number = 5000): void {
    this.showToast(message, 'error', duration);
  }

  /**
   * Show an info toast message
   * @param message The message to display
   * @param duration Duration in milliseconds (default: 3000ms)
   */
  showInfo(message: string, duration: number = 3000): void {
    this.showToast(message, 'info', duration);
  }

  /**
   * Show a warning toast message
   * @param message The message to display
   * @param duration Duration in milliseconds (default: 4000ms)
   */
  showWarning(message: string, duration: number = 4000): void {
    this.showToast(message, 'warning', duration);
  }

  /**
   * Show a toast message
   * @param message The message to display
   * @param type Type of toast (success, error, info, warning)
   * @param duration Duration in milliseconds
   */
  private showToast(message: string, type: 'success' | 'error' | 'info' | 'warning', duration: number): void {
    const id = this.generateId();
    const toast: ToastMessage = { id, message, type, duration };
    
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);
    
    // Auto-remove the toast after duration
    setTimeout(() => {
      this.removeToast(id);
    }, duration);
  }

  /**
   * Remove a toast by ID
   * @param id The ID of the toast to remove
   */
  removeToast(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  /**
   * Generate a unique ID for a toast
   * @returns A unique string ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
} 