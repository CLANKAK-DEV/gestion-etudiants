import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private _toasts$ = new Subject<Toast[]>();
  private toasts: Toast[] = [];

  toasts$ = this._toasts$.asObservable();

  show(type: ToastType, title: string, message?: string) {
    const id = ++this.counter;
    this.toasts = [...this.toasts, { id, type, title, message }];
    this._toasts$.next(this.toasts);
    setTimeout(() => this.remove(id), 4000);
  }

  success(title: string, message?: string) { this.show('success', title, message); }
  error(title: string, message?: string)   { this.show('error',   title, message); }
  warning(title: string, message?: string) { this.show('warning', title, message); }
  info(title: string, message?: string)    { this.show('info',    title, message); }

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this._toasts$.next(this.toasts);
  }
}
