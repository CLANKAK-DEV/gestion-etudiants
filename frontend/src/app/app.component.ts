import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { ToastService, Toast } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ToastContainerComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <div class="container-xl py-4">
        <router-outlet></router-outlet>
      </div>
    </main>
    <app-toast-container [toasts]="toasts"></app-toast-container>
  `,
  styles: [`
    .main-content {
      padding-top: 80px;
      min-height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.toasts$.subscribe(t => (this.toasts = t));
  }

  ngOnDestroy() { this.sub.unsubscribe(); }
}
