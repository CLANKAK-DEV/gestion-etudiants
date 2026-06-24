import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="d-flex flex-column align-items-center justify-content-center" style="min-height:60vh;text-align:center">
      <div class="mb-4 text-primary" style="font-size:5rem">🧭</div>
      <p class="text-uppercase fw-semibold text-primary small tracking-wide">404</p>
      <h1 class="fw-bold mb-2">Page not found</h1>
      <p class="text-muted mb-4">The page you're looking for doesn't exist or has been moved.</p>
      <a routerLink="/students" class="btn btn-primary px-4">
        ← Back to Students
      </a>
    </div>
  `
})
export class NotFoundComponent {}
