# Rapport de Mini Projet — INF3091 Technologies Web 2

**Titre du projet :** Système de Gestion des Étudiants  
**Module :** INF3091 — Technologies Web 2  
**Étudiant :** Lahoucine Chouker  
**Date :** Juin 2026

---

## Table des matières

1. [Introduction](#1--introduction)
2. [Présentation Générale du Projet](#2--présentation-générale-du-projet)
3. [Étude des Technologies Utilisées](#3--étude-des-technologies-utilisées)
4. [Conception et Architecture du Système](#4--conception-et-architecture-du-système)
5. [Réalisation et Développement de l'Application](#5--réalisation-et-développement-de-lapplication)
6. [Présentation des Fonctionnalités Principales](#6--présentation-des-fonctionnalités-principales)
7. [Tests, Validation et Résultats](#7--tests-validation-et-résultats)
8. [Conclusion Générale](#8--conclusion-générale)

---

## 1 · Introduction

Dans le cadre du module INF3091 — Technologies Web 2, ce mini-projet consiste à concevoir et développer une **application web full-stack** de gestion des étudiants. L'objectif pédagogique est de mettre en pratique les notions fondamentales des technologies web modernes : framework front-end (Angular), API REST côté serveur (Node.js / Express) et base de données relationnelle hébergée dans le cloud (Supabase / PostgreSQL).

Le projet répond aux exigences énoncées dans l'énoncé du mini-projet :

- Interface utilisateur développée avec **Angular** et stylisée avec **Bootstrap**.
- Serveur back-end **Node.js / Express** exposant une API REST.
- Base de données **SQL** (PostgreSQL via Supabase).
- Communication front-end ↔ back-end via le module **`HttpClient`** d'Angular.
- Opérations **CRUD** complètes sur les données étudiant.

Ce rapport présente, dans l'ordre, le contexte général du projet, les technologies retenues et leur justification, l'architecture conçue, les détails de l'implémentation, les fonctionnalités développées, la stratégie de test et de validation, et enfin une conclusion générale.

---

## 2 · Présentation Générale du Projet

### 2.1 Contexte et objectifs

L'application **Gestion des Étudiants** est un système d'information permettant à un administrateur de gérer les dossiers des étudiants inscrits dans un établissement. Elle fournit une interface web moderne et réactive qui centralise les informations suivantes pour chaque étudiant :

| Champ | Type | Contrainte |
|---|---|---|
| `id` | UUID | Clé primaire, auto-générée |
| `matricule` | Texte | Unique, 3–20 caractères alphanumériques |
| `nom` | Texte | Requis, lettres Unicode (noms accentués acceptés) |
| `prenom` | Texte | Requis, lettres Unicode |
| `email` | Texte | Requis, unique, format email valide |
| `telephone` | Texte | Requis, format international |
| `date_naissance` | Date | Requis, âge entre 15 et 100 ans |
| `filiere` | Enum | 10 filières prédéfinies |
| `adresse` | Texte | Optionnel |
| `ville` | Texte | Requis |
| `created_at` | Timestamp | Auto, utilisé pour la pagination et les statistiques |
| `updated_at` | Timestamp | Auto via trigger PostgreSQL |

### 2.2 Périmètre fonctionnel

L'application couvre les besoins suivants :

- **Gestion CRUD** : créer, consulter, modifier et supprimer des étudiants.
- **Recherche en temps réel** : filtrage dynamique par nom, prénom, matricule, email ou ville.
- **Filtres avancés** : par filière et par plage de dates d'inscription.
- **Tri** multi-colonnes (nom, filière, ville, date d'inscription, etc.).
- **Pagination** côté serveur avec taille de page configurable.
- **Tableau de bord statistique** : total des étudiants, nouveaux inscriptions du mois, répartition par filière.
- **Exports** : génération de fichiers PDF et Excel depuis la liste filtrée.
- **Notifications** : retour utilisateur immédiat via des toasts (succès / erreur).
- **Thème clair / sombre** : persisté dans `localStorage`.

### 2.3 Filières gérées

L'application supporte 10 filières académiques :

> Génie Informatique · Génie Civil · Génie Électrique · Génie Mécanique · Génie Industriel · Réseaux & Télécoms · Sciences Économiques · Gestion & Management · Mathématiques Appliquées · Biologie

---

## 3 · Étude des Technologies Utilisées

### 3.1 Front-end : Angular 17

**Angular** est un framework TypeScript développé par Google, conçu pour la création d'applications web monopage (SPA — Single Page Application). La version 17 introduit les **standalone components** qui éliminent le besoin de `NgModule` et simplifient l'arborescence de l'application.

**Pourquoi Angular ?**
- Exigence explicite de l'énoncé du mini-projet.
- Architecture claire (composants, services, intercepteurs, routage).
- Module `HttpClient` natif pour la communication avec l'API.
- Système de **Reactive Forms** (formulaires réactifs) avec validation côté client.
- Chargement paresseux (*lazy loading*) des routes pour de meilleures performances.

**Bibliothèques Angular utilisées :**

| Bibliothèque | Rôle |
|---|---|
| `@angular/router` | Routage SPA avec lazy loading |
| `@angular/forms` | Formulaires réactifs et validations |
| `@angular/common/http` | Requêtes HTTP vers l'API REST |
| RxJS | Programmation réactive (Observables, `debounceTime`, `Subject`) |

### 3.2 Styles : Bootstrap 5

**Bootstrap 5** est le framework CSS le plus utilisé pour la création d'interfaces responsives. Il fournit une grille flexible, des composants prêts à l'emploi (tableaux, formulaires, boutons, modales, pagination) et une compatibilité navigateur étendue.

Dans ce projet, Bootstrap est intégré via **SCSS** (permettant des surcharges de variables) et **sans** la partie JavaScript (les comportements dynamiques — menus déroulants, modales — sont entièrement pilotés par Angular via des `boolean` de visibilité et `@HostListener`).

### 3.3 Back-end : Node.js & Express

**Node.js** est un environnement d'exécution JavaScript côté serveur, basé sur le moteur V8 de Chrome. Il excelle dans les applications I/O-bound (appels base de données, API externes) grâce à son modèle non-bloquant.

**Express** est le framework HTTP minimaliste de l'écosystème Node.js. Ce projet utilise la syntaxe **ESM** (`import`/`export`) native de Node.js ≥ 14.

**Middleware de production utilisés :**

| Middleware | Rôle |
|---|---|
| `helmet` | En-têtes HTTP de sécurité (CSP, HSTS, X-Frame-Options…) |
| `cors` | Contrôle des origines autorisées (CORS) |
| `express-rate-limit` | Limitation du débit par IP (anti-abus) |
| `compression` | Compression GZIP des réponses |
| `morgan` | Journalisation des requêtes HTTP |
| `zod` | Validation et désinfection des données entrantes |

### 3.4 Base de données : Supabase (PostgreSQL)

**Supabase** est une alternative open-source à Firebase, construite sur **PostgreSQL**. Elle fournit une base de données relationnelle hébergée dans le cloud, accessible via un SDK JavaScript ou une API REST auto-générée.

**Fonctionnalités Supabase utilisées :**
- Client JS SDK (`@supabase/supabase-js`) avec la clé **service-role** côté serveur uniquement.
- Requêtes paramétrées via le SDK (protection contre les injections SQL).
- Extensions PostgreSQL : `pgcrypto` (UUID), `pg_trgm` (recherche textuelle par trigrammes).
- **Row Level Security (RLS)** activée — aucune politique publique, accès réservé au back-end via la clé service-role.

### 3.5 Bibliothèques d'export

| Bibliothèque | Format | Usage |
|---|---|---|
| `jsPDF` + `jspdf-autotable` | PDF | Génère un tableau PDF côté client depuis la liste filtrée |
| `SheetJS (xlsx)` | Excel | Génère un fichier `.xlsx` téléchargeable |

### 3.6 Outils de développement

| Outil | Rôle |
|---|---|
| `nodemon` | Rechargement automatique du serveur en développement |
| `dotenv` | Chargement des variables d'environnement depuis `.env` |
| Angular CLI | Génération, build et serve de l'application Angular |
| `proxy.conf.json` | Proxy Angular dev → `/api` → `localhost:5000` |

---

## 4 · Conception et Architecture du Système

### 4.1 Architecture globale

L'application suit une architecture **3-tiers** classique :

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVIGATEUR (client)                                                │
│  Angular SPA — composants standalone, Bootstrap 5                   │
│  HTTP via proxy /api  →  localhost:5000 (dev)                       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ JSON / REST
┌──────────────────────────▼──────────────────────────────────────────┐
│  SERVEUR API (Node.js / Express)                                    │
│  routes → controllers → services → Supabase SDK                     │
│  middleware : sanitize, validate, error, rate-limit, helmet, CORS   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ SDK paramétré
┌──────────────────────────▼──────────────────────────────────────────┐
│  BASE DE DONNÉES (Supabase / PostgreSQL)                            │
│  Table : students (12 colonnes, RLS activée)                        │
│  Extensions : pgcrypto, pg_trgm                                     │
│  Trigger : set_updated_at                                           │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Cycle de vie d'une requête

```
Composant Angular
  │  (ex. StudentListComponent appelle studentService.getStudents())
  ▼
StudentService (HttpClient GET /api/students?search=...&page=1&limit=10)
  │
  ▼  [Angular dev proxy]
  │  /api/* → http://localhost:5000
  ▼
Express Router (/api/students)
  │
  ├─► sanitizeRequest  (nettoie les chaînes — supprime <script>, trim)
  ├─► validateMiddleware(listQuerySchema)  (Zod — coerce + defaults)
  ▼
StudentController.list()
  │
  ▼
StudentService (Node)
  │  supabase.from('students').select('*', {count:'exact'})
  │               .or('nom.ilike.%term%,...')
  │               .range(from, to)
  ▼
Supabase (PostgreSQL)
  │  Résultat + count total
  ▼
ApiResponse.success({ data, meta })
  │  HTTP 200 JSON
  ▼
ApiInterceptor Angular (normalise les erreurs)
  │
  ▼
Composant Angular (mise à jour des données, toasts)
```

### 4.3 Structure des dossiers

```
project angular/
├── frontend/                       # Application Angular
│   └── src/
│       ├── app/
│       │   ├── core/
│       │   │   ├── interceptors/   # api.interceptor.ts
│       │   │   ├── models/         # student.model.ts (interfaces TS)
│       │   │   └── services/       # student.service.ts, stats.service.ts, toast.service.ts
│       │   ├── features/
│       │   │   ├── students/
│       │   │   │   ├── student-list/   # tableau, recherche, filtres, pagination
│       │   │   │   └── student-form/   # formulaire ajout / modification
│       │   │   └── settings/           # thème clair / sombre
│       │   ├── shared/
│       │   │   └── components/
│       │   │       ├── navbar/         # barre de navigation
│       │   │       ├── toast-container/ # notifications
│       │   │       └── not-found/      # page 404
│       │   ├── app.routes.ts           # routing lazy-loaded
│       │   ├── app.config.ts           # providers (HttpClient, router, intercepteur)
│       │   └── app.component.ts        # composant racine
│       ├── assets/icons/               # icônes PNG (add, delete, edit, export…)
│       ├── styles.scss                 # styles globaux + overrides Bootstrap dark mode
│       └── index.html                  # point d'entrée HTML
│
├── server/                         # API Express (ESM)
│   ├── config/
│   │   ├── env.js                  # validation Zod des variables d'environnement
│   │   └── supabase.js             # client Supabase (service-role)
│   ├── routes/
│   │   ├── index.js                # montage /students et /stats
│   │   ├── student.routes.js       # CRUD /students
│   │   └── stats.routes.js         # GET /stats/overview
│   ├── controllers/
│   │   ├── student.controller.js   # handlers HTTP → service
│   │   └── stats.controller.js     # handler statistiques
│   ├── services/
│   │   └── student.service.js      # logique métier + accès Supabase
│   ├── validators/
│   │   └── student.validator.js    # schémas Zod (create, update, list, id)
│   ├── middleware/
│   │   ├── validate.middleware.js  # exécute un schéma Zod, renvoie 400
│   │   ├── sanitize.middleware.js  # nettoie toutes les chaînes entrantes
│   │   ├── error.middleware.js     # handler d'erreur centralisé
│   │   └── notFound.middleware.js  # catch-all 404
│   ├── utils/
│   │   ├── ApiError.js             # classe d'erreur avec code HTTP
│   │   ├── ApiResponse.js          # enveloppe JSON cohérente
│   │   └── asyncHandler.js         # wrapper async/await pour Express
│   ├── app.js                      # assemblage de l'application Express
│   └── server.js                   # point d'entrée (lance le serveur)
│
├── supabase/
│   ├── schema.sql                  # DDL : table, index, trigger, RLS
│   ├── seed.sql                    # 24 étudiants d'exemple
│   └── setup.sql                   # schema + seed combinés (tout-en-un)
│
├── docs/                           # documentation du projet
├── package.json                    # scripts d'orchestration racine
└── .gitignore
```

### 4.4 Modèle de données

```sql
CREATE TABLE public.students (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matricule      TEXT NOT NULL UNIQUE,
    nom            TEXT NOT NULL,
    prenom         TEXT NOT NULL,
    email          TEXT NOT NULL UNIQUE,
    telephone      TEXT NOT NULL,
    date_naissance DATE NOT NULL,
    filiere        TEXT NOT NULL,
    adresse        TEXT,               -- optionnel
    ville          TEXT NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes :**
- `idx_students_filiere` — filtre par filière
- `idx_students_ville` — filtre par ville
- `idx_students_created_at` — tri et pagination par date
- `idx_students_nom_trgm` / `prenom_trgm` / `email_trgm` — recherche textuelle rapide (GIN trigrammes)

**Trigger :** `trg_students_updated_at` — met automatiquement à jour `updated_at` à chaque `UPDATE`.

### 4.5 API REST — liste des endpoints

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Vérification d'état du serveur |
| `GET` | `/api/students` | Liste paginée (search, filtres, tri, pagination) |
| `GET` | `/api/students/:id` | Détail d'un étudiant par UUID |
| `POST` | `/api/students` | Créer un nouvel étudiant |
| `PUT` | `/api/students/:id` | Modifier un étudiant existant |
| `DELETE` | `/api/students/:id` | Supprimer un étudiant |
| `GET` | `/api/stats/overview` | Statistiques agrégées du tableau de bord |

**Paramètres de la route GET `/api/students` :**

| Paramètre | Type | Description |
|---|---|---|
| `search` | string | Recherche dans nom, prénom, matricule, email, ville |
| `filiere` | string | Filtre exact par filière |
| `ville` | string | Filtre partiel par ville |
| `dateFrom` / `dateTo` | YYYY-MM-DD | Plage sur `created_at` |
| `sortBy` | string | Colonne de tri |
| `sortOrder` | `asc` / `desc` | Ordre de tri |
| `page` | number | Numéro de page (défaut 1) |
| `limit` | number | Taille de page 1–100 (défaut 10) |

---

## 5 · Réalisation et Développement de l'Application

### 5.1 Configuration et démarrage du projet

#### Variables d'environnement (`server/.env`)

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:4200
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX=300
```

Le fichier `server/config/env.js` valide ces variables à l'aide d'un schéma **Zod** au démarrage. Si une variable requise est manquante ou incorrecte, le serveur affiche un message lisible et s'arrête immédiatement (*fail fast*).

#### Proxy Angular (`frontend/proxy.conf.json`)

```json
{ "/api": { "target": "http://localhost:5000", "changeOrigin": true } }
```

Toutes les requêtes vers `/api/*` émises par Angular sont redirigées vers le back-end en développement, éliminant tout problème CORS.

### 5.2 Implémentation du back-end

#### `server/app.js` — Pipeline de middleware

Le pipeline est ordonné de façon stricte :

```
helmet()  →  cors()  →  compression()  →  json()  →  morgan()
  →  sanitizeRequest  →  rateLimit  →  routes  →  notFound  →  errorHandler
```

**Chaque couche a une responsabilité unique :**
- `helmet` : sécurité des en-têtes HTTP
- `cors` : restreint les origines autorisées à `CLIENT_URL`
- `sanitizeRequest` : parcourt récursivement `req.body`, `req.query`, `req.params` et supprime les balises HTML dangereuses, trim les chaînes
- `rateLimit` : bloque une IP après `RATE_LIMIT_MAX` requêtes dans la fenêtre temporelle configurée

#### `server/validators/student.validator.js` — Validation Zod

```js
const createStudentSchema = z.object({
  matricule: z.string().trim().regex(/^[A-Za-z0-9-]{3,20}$/),
  nom:       z.string().trim().min(2).max(50).regex(NAME_RE), // Unicode
  prenom:    z.string().trim().min(2).max(50).regex(NAME_RE),
  email:     z.string().trim().toLowerCase().email().max(255),
  telephone: z.string().trim().regex(PHONE_RE),
  date_naissance: z.string() /* âge 15–100 ans, refine() */,
  filiere:   z.enum([...FILIERES]),
  adresse:   z.string().max(200).optional(),
  ville:     z.string().trim().min(2).max(85),
}).strict(); // .strict() → refuse les clés inconnues (anti-mass assignment)
```

Le schéma de mise à jour utilise `.partial()` pour rendre tous les champs optionnels, mais exige au moins un champ modifié via `.refine()`.

#### `server/services/student.service.js` — Accès données

La fonction `listStudents` construit une requête Supabase progressive :

```js
let builder = supabase.from('students').select('*', { count: 'exact' });

if (term) builder = builder.or('nom.ilike.%term%,prenom.ilike.%term%,...');
if (filiere) builder = builder.eq('filiere', filiere);
if (dateFrom) builder = builder.gte('created_at', '${dateFrom}T00:00:00Z');

builder = builder.order(sortBy, { ascending: sortOrder === 'asc' })
                 .range(from, to);
```

La fonction `sanitizeSearchTerm` supprime les caractères spéciaux PostgREST (`, () % _ *`) avant l'injection dans les patterns `ilike`, empêchant toute manipulation de requête.

### 5.3 Implémentation du front-end

#### Routing (`app.routes.ts`)

```ts
export const routes: Routes = [
  { path: '', redirectTo: 'students', pathMatch: 'full' },
  { path: 'students',     loadComponent: () => import('./features/students/student-list/...') },
  { path: 'students/new', loadComponent: () => import('./features/students/student-form/...') },
  { path: 'students/:id', loadComponent: () => import('./features/students/student-form/...') },
  { path: 'settings',     loadComponent: () => import('./features/settings/...') },
  { path: '**',           loadComponent: () => import('./shared/components/not-found/...') },
];
```

Chaque route charge son composant **à la demande** (`loadComponent`) : le bundle initial est minimal.

#### Services Angular

**`StudentService`** centralise tous les appels HTTP :
```ts
getStudents(query: StudentQuery): Observable<ApiSuccess<Student[]>>
getStudent(id: string): Observable<ApiSuccess<Student>>
createStudent(data): Observable<ApiSuccess<Student>>
updateStudent(id, data): Observable<ApiSuccess<Student>>
deleteStudent(id: string): Observable<ApiSuccess<Student>>
```

**`StatsService`** expose les statistiques :
```ts
getStats(): Observable<ApiSuccess<StudentStats>>
```

**`ToastService`** gère les notifications :
```ts
success(message: string): void
error(message: string): void
```

#### Intercepteur HTTP (`api.interceptor.ts`)

L'intercepteur capture toutes les erreurs HTTP et les normalise en un message lisible avant de les transmettre aux composants :
- Erreur réseau → `"Cannot reach the server"`
- HTTP 4xx/5xx → message extrait du corps JSON de l'API

#### Formulaire étudiant (`student-form.component.ts`)

Le formulaire réactif Angular est réutilisé pour **créer** et **modifier** un étudiant :

```ts
this.form = this.fb.group({
  matricule:       ['', [Validators.required, Validators.pattern(MATRICULE_RE)]],
  nom:             ['', [Validators.required, Validators.minLength(2)]],
  prenom:          ['', [Validators.required, Validators.minLength(2)]],
  email:           ['', [Validators.required, Validators.email]],
  telephone:       ['', [Validators.required, Validators.pattern(PHONE_RE)]],
  date_naissance:  ['', Validators.required],
  filiere:         ['', Validators.required],
  adresse:         [''],
  ville:           ['', [Validators.required, Validators.minLength(2)]],
});
```

En mode édition, le composant charge les données existantes via `ActivatedRoute.params` et pré-remplit le formulaire avec `form.patchValue()`. Les erreurs de validation renvoyées par l'API sont injectées dans le formulaire avec `control.setErrors({ server: message })`.

#### Recherche en temps réel

```ts
private searchSubject = new Subject<string>();

ngOnInit() {
  this.searchSubject.pipe(
    debounceTime(350),
    distinctUntilChanged(),
    takeUntil(this.destroy$)
  ).subscribe(term => {
    this.query.search = term;
    this.query.page = 1;
    this.loadStudents();
  });
}
```

Le `debounceTime(350ms)` attend que l'utilisateur arrête de taper avant d'envoyer la requête, évitant les appels inutiles à chaque frappe.

#### Menu Export — Angular sans Bootstrap JS

Le dropdown Export est piloté entièrement par Angular :

```ts
exportOpen = false;

@HostListener('document:click')
closeExport() { this.exportOpen = false; }

toggleExport(e: MouseEvent) {
  e.stopPropagation();
  this.exportOpen = !this.exportOpen;
}
```

```html
<div class="dropdown" style="position:relative">
  <button [class.show]="exportOpen" (click)="toggleExport($event)">Export</button>
  <ul class="dropdown-menu" [class.show]="exportOpen" style="position:absolute; top:100%; right:0;">
    <li><button (click)="exportPdf()">Export PDF</button></li>
    <li><button (click)="exportExcel()">Export Excel</button></li>
  </ul>
</div>
```

---

## 6 · Présentation des Fonctionnalités Principales

### 6.1 Tableau de bord statistique

La page d'accueil affiche des **cartes de statistiques** calculées côté serveur par l'endpoint `/api/stats/overview` :

- **Total des étudiants** inscrits dans la base.
- **Nouveaux ce mois-ci** (inscrits depuis le 1er du mois courant).
- **Nouveaux ces 30 derniers jours**.
- **Nombre de filières actives** (ayant au moins un étudiant).
- **Répartition par filière** (liste triée par effectif décroissant).
- **Évolution mensuelle** sur les 12 derniers mois (buckets YYYY-MM).
- **5 dernières inscriptions** (flux temps réel des ajouts récents).

### 6.2 Liste des étudiants

Le tableau principal offre :

- **Recherche unifiée** sur 5 colonnes simultanément (nom, prénom, matricule, email, ville) avec debounce 350 ms.
- **Filtre par filière** (menu déroulant des 10 filières).
- **Filtre par plage de dates** (`dateFrom` / `dateTo`).
- **Tri** sur toutes les colonnes clés (clic sur l'en-tête du tableau).
- **Pagination** avec navigation numérique, taille de page au choix (10 / 20 / 50 / 100).
- **Bouton Réinitialiser** — efface tous les filtres actifs en un clic.
- **Export PDF** (jsPDF + autotable) et **Export Excel** (SheetJS) — génèrent les fichiers depuis les données actuellement filtrées.
- **Bouton Supprimer** avec confirmation inline.
- **Bouton Modifier** naviguant vers le formulaire pré-rempli.

### 6.3 Formulaire d'ajout / modification

Un **formulaire réactif** unique est utilisé pour les deux modes :

- **Mode création** : accessible via `/students/new`. Tous les champs sont vides.
- **Mode édition** : accessible via `/students/:id`. L'UUID de l'étudiant est lu depuis l'URL, les données sont chargées via `GET /api/students/:id` et injectées dans le formulaire.

**Validations côté client** (retour immédiat) :
- Champs requis
- Format email
- Format matricule (regex alphanumérique)
- Format téléphone (regex international)
- Sélection de filière obligatoire

**Validations côté serveur** (Zod) :
- Unicité du matricule et de l'email (vérifiée par PostgreSQL — erreur 409 renvoyée)
- Âge compris entre 15 et 100 ans
- Longueurs maximales
- Clés inconnues rejetées (`.strict()`)

### 6.4 Notifications (toasts)

Le `ToastService` injecte des messages de succès ou d'erreur dans le `ToastContainerComponent` affiché en superposition :

- **Succès** : vert — confirmation d'ajout, modification, suppression.
- **Erreur** : rouge — erreur réseau, erreur de validation serveur, conflit de données.
- Disparition automatique après 4 secondes.

### 6.5 Thème clair / sombre

La page **Paramètres** permet de choisir entre les thèmes **Clair** et **Sombre**. Le choix est persisté dans `localStorage` et appliqué en ajoutant la classe `.dark` sur la balise `<html>`. Les styles SCSS utilisent des **variables CSS** (`--bg`, `--surface`, `--text`, `--border`, `--accent`) redéfinies sous `:root.dark`.

Les overrides spécifiques pour le mode sombre incluent :
- Options de `<select>` (fond et texte forcés).
- Boutons de pagination Bootstrap (`page-link`).
- `color-scheme: dark` pour les contrôles natifs du navigateur.

---

## 7 · Tests, Validation et Résultats

### 7.1 Validation des données

La validation s'effectue à **deux niveaux complémentaires** :

#### Côté client (Angular Reactive Forms)

| Règle | Mécanisme Angular |
|---|---|
| Champ requis | `Validators.required` |
| Format email | `Validators.email` |
| Format matricule / téléphone | `Validators.pattern(regex)` |
| Longueur minimale | `Validators.minLength(n)` |
| Sélection obligatoire (filière) | `Validators.required` sur le `<select>` |

Le formulaire est **désactivé à la soumission** si `form.invalid` est vrai — aucune requête n'est envoyée si les données sont incorrectes côté client.

#### Côté serveur (Zod + PostgreSQL)

| Règle | Mécanisme serveur |
|---|---|
| Format et longueur des champs | Schéma Zod `.string().regex().min().max()` |
| Âge 15–100 ans | `z.refine()` dans `dateNaissance` |
| Clés inconnues | `.strict()` sur le schéma (retourne 400) |
| Unicité matricule / email | Contrainte `UNIQUE` PostgreSQL (retourne 409) |
| Format UUID des paramètres de route | `idParamSchema` Zod |
| Injection SQL | SDK Supabase — requêtes paramétrées |

### 7.2 Tests fonctionnels effectués

Les scénarios suivants ont été testés manuellement :

#### Tests CRUD

| Action | Résultat attendu | Résultat obtenu |
|---|---|---|
| Créer un étudiant avec toutes les données valides | HTTP 201, toast succès, retour liste | ✅ OK |
| Créer avec un email déjà existant | HTTP 409, message "Email déjà utilisé" | ✅ OK |
| Créer avec un champ requis manquant | Formulaire bloqué côté client + erreur Zod 400 | ✅ OK |
| Modifier un étudiant | HTTP 200, formulaire pré-rempli, toast succès | ✅ OK |
| Supprimer un étudiant inexistant | HTTP 404, toast erreur | ✅ OK |
| Consulter un UUID invalide | HTTP 400 "Invalid student id" | ✅ OK |

#### Tests de recherche et filtres

| Scénario | Résultat |
|---|---|
| Recherche partielle dans le nom | Liste filtrée, debounce 350 ms respecté | ✅ OK |
| Filtre par filière "Génie Informatique" | Seuls les étudiants GI affichés | ✅ OK |
| Filtre par plage de dates | Résultats bornés aux dates saisies | ✅ OK |
| Tri croissant / décroissant par nom | Ordre alphabétique respecté | ✅ OK |
| Pagination — page 2 | Décalage `from/to` correct côté serveur | ✅ OK |
| Réinitialisation des filtres | Retour liste complète, page 1 | ✅ OK |

#### Tests de sécurité

| Test | Résultat |
|---|---|
| Injection de balise `<script>` dans le nom | Sanitisé par `sanitizeRequest` avant Zod | ✅ OK |
| Envoi de champs supplémentaires (`isAdmin: true`) | Rejeté par `.strict()` Zod, HTTP 400 | ✅ OK |
| Plus de 300 requêtes en 15 min depuis la même IP | HTTP 429 "Too many requests" | ✅ OK |
| Requête OPTIONS (preflight CORS) | En-tête `Access-Control-Allow-Origin` correct | ✅ OK |

#### Tests d'export

| Format | Résultat |
|---|---|
| Export PDF avec 10 étudiants | Fichier `.pdf` téléchargé, tableau lisible | ✅ OK |
| Export Excel avec filtres actifs | Fichier `.xlsx`, seules les données filtrées présentes | ✅ OK |

### 7.3 Vérification de la syntaxe serveur

Tous les fichiers JavaScript du back-end ont été vérifiés avec :

```bash
node --check server/app.js
node --check server/server.js
node --check server/services/student.service.js
# ... tous les fichiers : OK, aucune erreur de syntaxe
```

### 7.4 Vérification du build Angular

Le build de production Angular s'exécute sans erreur :

```bash
cd frontend && npm run build
# Output bundle → frontend/dist/frontend/browser/
# Aucune erreur TypeScript ni de compilation
```

### 7.5 Résultats obtenus

L'application finale est fonctionnelle et répond à toutes les exigences du mini-projet :

- ✅ Interface Angular avec Bootstrap responsive (thème clair/sombre)
- ✅ API REST Express complète avec 7 endpoints
- ✅ Base de données PostgreSQL (Supabase) connectée et opérationnelle
- ✅ Communication HttpClient Angular ↔ API REST
- ✅ CRUD complet (création, lecture, modification, suppression)
- ✅ Recherche, filtres, tri et pagination côté serveur
- ✅ Validation à deux niveaux (client Angular + serveur Zod + BD PostgreSQL)
- ✅ Sécurité : Helmet, CORS, rate-limiting, sanitisation, RLS Supabase
- ✅ Exports PDF et Excel
- ✅ Notifications utilisateur (toasts)
- ✅ Thème clair / sombre persisté

---

## 8 · Conclusion Générale

Ce mini-projet a permis de mettre en œuvre une application web full-stack complète, conforme aux exigences du module INF3091 — Technologies Web 2. L'architecture retenue — **Angular** pour le front-end, **Node.js/Express** pour l'API et **Supabase/PostgreSQL** pour la base de données — est représentative des stacks professionnelles actuelles.

### Acquis techniques

La réalisation de ce projet a permis de consolider les compétences suivantes :

- **Architecture SPA** avec Angular 17 (standalone components, lazy loading, routing).
- **Communication HTTP** via `HttpClient`, intercepteurs, et gestion centralisée des erreurs.
- **Conception d'API REST** structurée (routes → controllers → services) avec Express.
- **Validation robuste** à double niveau : formulaires réactifs Angular + schémas Zod côté serveur.
- **Sécurité applicative** : Helmet, CORS, rate-limiting, sanitisation des entrées, requêtes paramétrées.
- **Base de données relationnelle** hébergée dans le cloud (Supabase) avec RLS, indexes de performance et trigger automatique.
- **Export de données** (PDF et Excel) côté client à partir de données filtrées.

### Points d'amélioration possibles

Dans une version ultérieure, les fonctionnalités suivantes pourraient enrichir l'application :

- **Authentification** : connexion administrateur avec JWT (JSON Web Token) et protection des routes API.
- **Pagination des exports** : exporter l'ensemble du résultat (toutes les pages) plutôt que la page courante.
- **Tests automatisés** : tests unitaires Angular (Karma/Jasmine) et tests d'intégration côté API (Jest + Supertest).
- **Déploiement continu** : pipeline CI/CD (GitHub Actions) avec déploiement automatique sur Render (back-end) et Netlify (front-end).
- **Internationalisation (i18n)** : support multilingue français/anglais via `@angular/localize`.

### Conclusion

Ce projet démontre qu'une application web moderne peut être construite de façon propre, sécurisée et maintenable en combinant les technologies Angular, Express et PostgreSQL. La séparation claire des responsabilités entre les couches, la validation stricte des données et la sécurité appliquée dès la conception constituent une base solide pour tout développement web professionnel.

---

*Mini Projet INF3091 — Technologies Web 2 | Angular · Express · Supabase*
