import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'students', pathMatch: 'full' },
  {
    path: 'students',
    loadComponent: () =>
      import('./features/students/student-list/student-list.component').then(m => m.StudentListComponent),
  },
  {
    path: 'students/new',
    loadComponent: () =>
      import('./features/students/student-form/student-form.component').then(m => m.StudentFormComponent),
  },
  {
    path: 'students/:id/edit',
    loadComponent: () =>
      import('./features/students/student-form/student-form.component').then(m => m.StudentFormComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
