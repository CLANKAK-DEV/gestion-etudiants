# UI / UX Documentation

The interface is a clean, responsive admin UI built with **Bootstrap 5** and a light/dark theme. It is implemented entirely with **Angular standalone components**.

## App shell

The root component ([`app.component.ts`](../frontend/src/app/app.component.ts)) defines the persistent shell:

```
┌───────────────────────────────────────────────────────────┐
│            ◎  floating pill navbar (fixed, top-centre)      │
│        logo · Students · Add Student · Settings · 🌙/☀️     │
├───────────────────────────────────────────────────────────┤
│                                                             │
│   <router-outlet> inside a .container-xl                    │
│   (Students / Add / Edit / Settings / 404)                  │
│                                                             │
└───────────────────────────────────────────────────────────┘
                                   ▢ toast container (bottom-right)
```

- **Navbar** ([`navbar.component.ts`](../frontend/src/app/shared/components/navbar/navbar.component.ts)) — a frosted-glass "pill" fixed at the top centre. It holds the logo, icon links (Students, Add Student, Settings) with hover tooltips and an active state via `routerLinkActive`, plus a **dark-mode toggle**.
- **Content** — routed pages render inside a centred `.container-xl`, with top padding to clear the floating navbar.
- **Toasts** ([`toast-container.component.ts`](../frontend/src/app/shared/components/toast-container/toast-container.component.ts)) — Bootstrap toasts pinned bottom-right, driven by the [`ToastService`](../frontend/src/app/core/services/toast.service.ts) for success / error / info feedback.

### Pages
| Route | Component | Purpose |
| --- | --- | --- |
| `/` → `/students` | `StudentListComponent` | Stat cards + searchable, filterable, paginated table |
| `/students/new` | `StudentFormComponent` | Reusable validated form (create) |
| `/students/:id/edit` | `StudentFormComponent` | Same form, pre-filled (update) |
| `/settings` | `SettingsComponent` | Appearance (theme) + about |
| `**` | `NotFoundComponent` | Friendly 404 inside the shell |

All routes are **lazy-loaded** via `loadComponent` in [`app.routes.ts`](../frontend/src/app/app.routes.ts).

## Theme system

A simple **light / dark** theme:

- The mode is stored in `localStorage` under the `theme` key.
- Toggling adds/removes a `.dark` class on `<html>` (`document.documentElement`).
- [`styles.scss`](../frontend/src/styles.scss) defines CSS variables (`--bg`, `--surface`, `--border`, `--text`, `--text-muted`) for both `:root` and `:root.dark`, plus dark-mode overrides for Bootstrap components (cards, tables, forms, modals, dropdowns).
- The theme can be changed from the navbar toggle or the **Settings → Appearance** tiles.

## Responsive design

Built on Bootstrap's grid and utilities:

- **Stat cards** flow 2 → 4 columns (`col-6 col-md-3`).
- **Filters** wrap gracefully across rows on small screens.
- **Table** keeps the essential columns on mobile and progressively reveals City, Age, Phone and "Added" as width allows (`d-none d-md-table-cell`, `d-lg-table-cell`).
- **Table** is wrapped in `.table-responsive` for horizontal scroll when needed.

## Students page

[`student-list.component`](../frontend/src/app/features/students/student-list/student-list.component.ts) brings the experience together:

- **Header** — title + **Export** dropdown (PDF / Excel) + **Add Student** button.
- **Stat cards** — Total, New This Month, Last 30 Days, Active Filières (from `/stats/overview`).
- **Filters card** — debounced search, filière select, city, date range, sort, reset.
- **Table** — Bootstrap `table table-hover`, with filière badges, computed age, and edit/delete actions.
- **States** — loading skeletons (`placeholder-glow`), an empty state, and an error state with retry.
- **Pagination footer** — rows-per-page selector + page navigation, server-driven.
- **Delete confirmation** — a Bootstrap modal guards destructive actions.

## Forms

[`student-form.component`](../frontend/src/app/features/students/student-form/student-form.component.ts) is shared by Add and Edit:

- Bootstrap form controls with inline validation messages.
- On submit, success/error is surfaced via toasts; the form navigates back to the list on success.

## Visual language

- **Typography**: Inter (loaded via Google Fonts in `styles.scss`).
- **Surfaces**: `border-0 shadow-sm` cards, pill badges, frosted-glass navbar.
- **Accent**: indigo for primary actions and active navigation states.
- **Feedback**: toasts for outcomes, skeletons for loading, clear empty/error states so the UI never looks broken.
