import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="navbar-pill-wrapper">
      <nav class="navbar-pill d-flex align-items-center gap-2 px-3 py-2">
        <!-- Nav links -->
        <a routerLink="/students" routerLinkActive="active"
           [routerLinkActiveOptions]="{exact:true}"
           class="nav-icon-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span class="nav-tooltip">Students</span>
        </a>

        <a routerLink="/students/new" routerLinkActive="active"
           class="nav-icon-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
          <span class="nav-tooltip">Add Student</span>
        </a>

        <a routerLink="/settings" routerLinkActive="active"
           class="nav-icon-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span class="nav-tooltip">Settings</span>
        </a>

        <div class="nav-divider ms-1"></div>

        <!-- Dark mode toggle -->
        <button class="nav-icon-btn" (click)="toggleTheme()">
          <svg *ngIf="!dark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg *ngIf="dark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <span class="nav-tooltip">{{ dark ? 'Light mode' : 'Dark mode' }}</span>
        </button>
      </nav>
    </div>
  `,
  styles: [`
    .navbar-pill-wrapper {
      position: fixed;
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1050;
    }
    .navbar-pill {
      background: rgba(24, 24, 32, 0.82);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 1rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.32);
    }
    .nav-divider {
      width: 1px;
      height: 20px;
      background: rgba(255,255,255,0.12);
      border-radius: 1px;
    }
    .nav-icon-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      color: rgba(255,255,255,0.55);
      border-radius: 0.6rem;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .nav-icon-btn:hover {
      background: rgba(99,102,241,0.15);
      color: #c7d2fe;
    }
    .nav-icon-btn.active {
      background: rgba(99,102,241,0.22);
      color: #a5b4fc;
      box-shadow: inset 0 0 0 1px rgba(129,140,248,0.45);
    }
    /* small accent dot under the active item */
    .nav-icon-btn.active::after {
      content: '';
      position: absolute;
      bottom: 3px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #818cf8;
    }
    .nav-tooltip {
      position: absolute;
      bottom: -2rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: #fff;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .nav-icon-btn:hover .nav-tooltip { opacity: 1; }
  `]
})
export class NavbarComponent {
  dark = document.documentElement.classList.contains('dark');

  toggleTheme() {
    this.dark = !this.dark;
    document.documentElement.classList.toggle('dark', this.dark);
    localStorage.setItem('theme', this.dark ? 'dark' : 'light');
  }
}
