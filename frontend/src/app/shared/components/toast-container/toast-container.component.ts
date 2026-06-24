import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:9999">
      <div *ngFor="let t of toasts" class="toast show align-items-center border-0 mb-2"
           [ngClass]="getClass(t.type)" role="alert">
        <div class="d-flex">
          <div class="toast-body">
            <strong>{{ t.title }}</strong>
            <div *ngIf="t.message" class="small opacity-75 mt-1">{{ t.message }}</div>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto"
                  (click)="toastService.remove(t.id)"></button>
        </div>
      </div>
    </div>
  `
})
export class ToastContainerComponent {
  @Input() toasts: Toast[] = [];
  constructor(public toastService: ToastService) {}

  getClass(type: string) {
    return {
      'bg-success text-white': type === 'success',
      'bg-danger text-white':  type === 'error',
      'bg-warning text-dark':  type === 'warning',
      'bg-info text-white':    type === 'info',
    };
  }
}
