import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiliereColorService, BadgeColor } from '../../core/services/filiere-color.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .color-swatch {
      width: 28px; height: 28px; border-radius: 50%;
      border: 3px solid transparent; cursor: pointer;
      transition: transform .15s, border-color .15s;
      flex-shrink: 0;
    }
    .color-swatch:hover { transform: scale(1.18); }
    .color-swatch.active { border-color: var(--text); transform: scale(1.15); }
    .filiere-row {
      display: flex; align-items: center; gap: .75rem;
      padding: .45rem 0; border-bottom: 1px solid var(--border);
    }
    .filiere-row:last-child { border-bottom: none; }
    .filiere-name { flex: 1; font-size: .875rem; min-width: 0; }
    .swatches { display: flex; gap: .35rem; flex-wrap: wrap; }
    .badge-preview { font-size: .7rem; padding: .25em .65em; border-radius: 999px; white-space: nowrap; }
  `],
  template: `
    <div class="mb-4">
      <h1 class="h3 fw-bold mb-0">Settings</h1>
      <p class="text-muted small">Manage appearance and app preferences.</p>
    </div>

    <div class="row g-4">
      <!-- Theme -->
      <div class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title fw-semibold mb-3">Appearance</h5>
            <div class="d-flex flex-column gap-2">
              <button *ngFor="let t of themes" class="btn text-start"
                      [class.btn-primary]="current===t.value"
                      [class.btn-outline-secondary]="current!==t.value"
                      (click)="setTheme(t.value)">
                <img [src]="t.icon" alt="" class="app-icon app-icon-sm me-2">{{ t.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title fw-semibold mb-3">About</h5>
            <dl class="row small mb-0">
              <dt class="col-5 text-muted">App</dt>
              <dd class="col-7">EduManage</dd>
              <dt class="col-5 text-muted">Description</dt>
              <dd class="col-7">Student Management System</dd>
              <dt class="col-5 text-muted">Frontend</dt>
              <dd class="col-7">Angular 17 + Bootstrap 5</dd>
              <dt class="col-5 text-muted">Backend</dt>
              <dd class="col-7">Node.js + Express</dd>
              <dt class="col-5 text-muted">Database</dt>
              <dd class="col-7">Supabase (PostgreSQL)</dd>
            </dl>
          </div>
        </div>
      </div>

      <!-- Filière badge colours -->
      <div class="col-12 col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h5 class="card-title fw-semibold mb-0">Filière Badge Colors</h5>
              <button class="btn btn-sm btn-outline-secondary" (click)="resetColors()">
                Reset defaults
              </button>
            </div>

            <!-- colour legend -->
            <div class="d-flex flex-wrap gap-2 mb-3">
              <span *ngFor="let c of colorSvc.colorOptions"
                    class="badge badge-preview"
                    [style.background]="c.hex"
                    [style.color]="c.value === 'warning' || c.value === 'orange' ? '#1e293b' : '#fff'">
                {{ c.label }}
              </span>
            </div>

            <div>
              <div *ngFor="let f of colorSvc.filieres" class="filiere-row">
                <!-- current badge preview -->
                <span class="badge badge-preview bg-{{ colorSvc.getColor(f) }} filiere-name">{{ f }}</span>

                <!-- colour swatches -->
                <div class="swatches">
                  <button *ngFor="let c of colorSvc.colorOptions"
                          class="color-swatch"
                          [class.active]="colorSvc.getColor(f) === c.value"
                          [style.background]="c.hex"
                          [attr.aria-label]="c.label"
                          (click)="setColor(f, c.value)">
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  themes = [
    { value: 'light', label: 'Light', icon: 'assets/icons/sun.png' },
    { value: 'dark',  label: 'Dark',  icon: 'assets/icons/moon.png' },
  ];
  current = localStorage.getItem('theme') ?? 'dark';

  constructor(readonly colorSvc: FiliereColorService) {}

  setTheme(t: string) {
    this.current = t;
    localStorage.setItem('theme', t);
    document.documentElement.classList.toggle('dark', t === 'dark');
  }

  setColor(filiere: string, color: BadgeColor) {
    this.colorSvc.setColor(filiere, color);
  }

  resetColors() {
    this.colorSvc.reset();
  }
}
