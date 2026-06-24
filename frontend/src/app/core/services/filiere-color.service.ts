import { Injectable } from '@angular/core';
import { FILIERES } from '../models/student.model';

export const COLOR_OPTIONS = [
  { value: 'primary',   label: 'Blue',   hex: '#6366f1' },
  { value: 'success',   label: 'Green',  hex: '#22c55e' },
  { value: 'warning',   label: 'Yellow', hex: '#f59e0b' },
  { value: 'danger',    label: 'Red',    hex: '#ef4444' },
  { value: 'info',      label: 'Cyan',   hex: '#06b6d4' },
  { value: 'secondary', label: 'Grey',   hex: '#6b7280' },
  { value: 'dark',      label: 'Dark',   hex: '#1e293b' },
  { value: 'pink',      label: 'Pink',   hex: '#ec4899' },
  { value: 'orange',    label: 'Orange', hex: '#f97316' },
  { value: 'purple',    label: 'Purple', hex: '#a855f7' },
] as const;

export type BadgeColor = typeof COLOR_OPTIONS[number]['value'];

const STORAGE_KEY = 'filiere-colors';

const DEFAULTS: Record<string, BadgeColor> = {
  'Génie Informatique':       'primary',
  'Génie Civil':              'success',
  'Génie Électrique':         'warning',
  'Génie Mécanique':          'danger',
  'Génie Industriel':         'info',
  'Réseaux & Télécoms':       'secondary',
  'Sciences Économiques':     'dark',
  'Gestion & Management':     'purple',
  'Mathématiques Appliquées': 'pink',
  'Biologie':                 'orange',
};

@Injectable({ providedIn: 'root' })
export class FiliereColorService {
  private map: Record<string, BadgeColor> = { ...DEFAULTS };

  constructor() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) this.map = { ...DEFAULTS, ...JSON.parse(saved) };
    } catch { /* ignore */ }
  }

  getColor(filiere: string): BadgeColor {
    return this.map[filiere] ?? 'secondary';
  }

  setColor(filiere: string, color: BadgeColor): void {
    this.map[filiere] = color;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.map));
  }

  getMap(): Record<string, BadgeColor> {
    return { ...this.map };
  }

  reset(): void {
    this.map = { ...DEFAULTS };
    localStorage.removeItem(STORAGE_KEY);
  }

  readonly filieres = [...FILIERES];
  readonly colorOptions = COLOR_OPTIONS;
}
