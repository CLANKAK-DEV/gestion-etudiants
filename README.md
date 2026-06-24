<div align="center">

# 🎓 Gestion des Étudiants

**Application CRUD de gestion des étudiants — Mini Projet INF3091 (Technologies Web 2).**

Angular · TypeScript · Bootstrap · Node.js · Express · Supabase (PostgreSQL)

[Fonctionnalités](#-fonctionnalités) · [Stack](#-stack-technique) · [Démarrage](#-démarrage-rapide) · [Documentation](#-documentation)

</div>

---

## ✨ Présentation

Application **CRUD** (Create, Read, Update, Delete) pour la gestion des étudiants, conforme à l'énoncé du mini-projet :

- **Front-end Angular** stylisé avec **Bootstrap**.
- **Back-end Node.js / Express** exposant une API REST.
- **Base de données SQL** (Supabase / PostgreSQL).
- Communication front-end ↔ back-end via le module **`HttpClient`** d'Angular.

L'application permet d'**ajouter**, **modifier**, **supprimer** et **afficher** les étudiants dans un tableau stylisé, avec **recherche** par nom ou matricule, **pagination**, **validation des formulaires** et **notifications** de succès/erreur.

---

## 🚀 Fonctionnalités

- ✅ **CRUD complet** — ajouter, modifier, supprimer et lister les étudiants
- 🔎 **Recherche** en temps réel par nom, prénom, matricule, email ou ville
- 🎛️ **Filtres** par filière et plage de dates + **tri** sur plusieurs colonnes
- 📄 **Pagination** côté serveur (taille de page configurable)
- 🧾 **Formulaire** réutilisé pour l'ajout et la modification, avec **validations**
- 🔔 **Notifications** (toasts) pour informer l'utilisateur des succès et des erreurs
- 🧾 **Exports** PDF (jsPDF) et Excel (SheetJS) de la liste filtrée
- 📊 Statistiques de tableau de bord via un endpoint d'agrégation dédié

---

## 🧱 Stack technique

| Couche | Technologies |
| --- | --- |
| **Front-end** | Angular 17 (standalone components), TypeScript, Bootstrap 5, RxJS |
| **Communication** | `HttpClient` Angular, intercepteur HTTP, proxy `/api` en dev |
| **Export** | jsPDF + jspdf-autotable, SheetJS (xlsx) |
| **Back-end** | Node.js, Express (ESM), Zod, Helmet, CORS, express-rate-limit, Morgan |
| **Base de données** | Supabase (PostgreSQL) |

---

## 📂 Structure du projet

```
project angular/
├── frontend/                    # Application Angular
│   └── src/app/
│       ├── core/
│       │   ├── interceptors/    # intercepteur HTTP (normalisation des erreurs)
│       │   ├── models/          # interfaces TypeScript (Student, etc.)
│       │   └── services/        # student.service, stats.service, toast.service (HttpClient)
│       ├── features/
│       │   ├── students/
│       │   │   ├── student-list/  # tableau Bootstrap, recherche, filtres, pagination
│       │   │   └── student-form/  # formulaire ajout / modification + validations
│       │   └── settings/          # page paramètres
│       ├── shared/components/     # navbar, toast-container, not-found
│       ├── app.routes.ts          # routing (lazy-loaded standalone components)
│       └── app.config.ts          # providers (router, HttpClient, intercepteur)
│
├── server/                      # API Express (package.json propre)
│   ├── config/                  # validation .env, client Supabase
│   ├── routes/                  # /students, /stats
│   ├── controllers/             # gestionnaires de requêtes
│   ├── services/                # accès données Supabase + agrégation
│   ├── validators/              # schémas Zod (create/update/query)
│   ├── middleware/              # validate, sanitize, error, 404
│   ├── utils/                   # ApiError, ApiResponse, asyncHandler
│   └── app.js / server.js       # assemblage + point d'entrée
│
├── supabase/
│   ├── schema.sql               # table, index, trigger, RLS
│   └── seed.sql                 # données d'exemple
│
├── docs/                        # documentation détaillée
└── package.json                 # scripts d'orchestration (front + back)
```

---

## ⚡ Démarrage rapide

### Prérequis
- **Node.js ≥ 18**
- Un projet **Supabase** gratuit (base PostgreSQL)
- Angular CLI (installé localement via les dépendances du dossier `frontend/`)

### 1 · Base de données
1. Créez un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécutez [`supabase/schema.sql`](supabase/schema.sql).
3. *(Optionnel)* exécutez [`supabase/seed.sql`](supabase/seed.sql) pour charger des étudiants d'exemple.
4. Récupérez votre **Project URL** et votre **service-role key** dans **Project Settings → API**.

### 2 · Back-end (Express)
```bash
cd server
npm install
cp .env.example .env        # puis renseignez SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
npm run dev                 # → http://localhost:5000
```

### 3 · Front-end (Angular)
```bash
# depuis le dossier frontend/, dans un second terminal
cd frontend
npm install
npm start                   # ng serve → http://localhost:4200
```

Le serveur de dev Angular **proxifie `/api`** vers le back-end sur le port 5000 (voir [`frontend/proxy.conf.json`](frontend/proxy.conf.json)) — aucune configuration supplémentaire n'est nécessaire.

> 💡 Raccourci : depuis la racine du projet, `npm run install:all` installe les deux, puis `npm run server` et `npm run frontend` les démarrent sans changer de dossier.

---

## 🔧 Variables d'environnement

**Back-end** (`server/.env`) :
| Variable | Requis | Description |
| --- | --- | --- |
| `SUPABASE_URL` | ✅ | URL du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Clé service-role (back-end uniquement, jamais exposée au navigateur) |
| `PORT` | – | Port de l'API (défaut `5000`) |
| `CLIENT_URL` | – | Origine CORS autorisée (défaut `http://localhost:4200`) |
| `RATE_LIMIT_WINDOW_MINUTES` | – | Fenêtre de rate-limit (défaut `15`) |
| `RATE_LIMIT_MAX` | – | Requêtes max / fenêtre / IP (défaut `300`) |

Le back-end **s'arrête immédiatement** avec un message lisible si une variable requise manque.

---

## 📡 Résumé de l'API

URL de base : `/api`

| Méthode | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/students` | Liste des étudiants (recherche, filtres, tri, pagination) |
| `GET` | `/students/:id` | Un étudiant |
| `POST` | `/students` | Créer un étudiant |
| `PUT` | `/students/:id` | Modifier un étudiant |
| `DELETE` | `/students/:id` | Supprimer un étudiant |
| `GET` | `/stats/overview` | Statistiques agrégées |
| `GET` | `/health` | Vérification d'état |

Voir [`docs/API.md`](docs/API.md) pour les corps de requête/réponse et les règles de validation.

---

## 🧰 Scripts

**Racine** (orchestration)
| Script | Action |
| --- | --- |
| `npm run install:all` | Installe les dépendances du back-end et du front-end |
| `npm run server` | Démarre l'API Express (nodemon) |
| `npm run frontend` | Démarre l'application Angular (`ng serve`) |
| `npm run build` | Build de production du front-end Angular |

**`frontend/`**
| Script | Action |
| --- | --- |
| `npm start` | `ng serve` → serveur de dev (port 4200) |
| `npm run build` | Build de production |
| `npm test` | Tests unitaires (Karma/Jasmine) |

**`server/`**
| Script | Action |
| --- | --- |
| `npm run dev` | Démarre l'API avec nodemon (rechargement auto) |
| `npm start` | Démarre l'API |

---

## 📚 Documentation

La documentation détaillée se trouve dans le dossier [`docs/`](docs) :

| Document | Contenu |
| --- | --- |
| [Code Reference](docs/CODE_REFERENCE.md) | Documentation fichier par fichier (back-end + front-end), outils, cycle d'une requête |
| [Project Overview](docs/PROJECT_OVERVIEW.md) | Objectif, fonctionnalités, technologies, architecture |
| [Installation Guide](docs/INSTALLATION.md) | Mise en place front / back / Supabase, env, serveur de dev |
| [Database](docs/DATABASE.md) | Tables, colonnes, index, schéma SQL |
| [API Reference](docs/API.md) | Endpoints, corps de requête, réponses, validation |
| [UI / UX](docs/UI_UX.md) | Structure de l'interface, design responsive, composants |
| [Export System](docs/EXPORT.md) | Génération PDF, export Excel, exports filtrés |
| [Filters & Search](docs/FILTERS_SEARCH.md) | Filtrage dynamique, recherche temps réel, tri |
| [Validation & Security](docs/VALIDATION_SECURITY.md) | Validation client/serveur, sanitization, gestion d'erreurs |

---

## 🏗️ Notes d'architecture

- **Séparation des responsabilités** côté back-end : `routes → controllers → services → Supabase`, avec des `middleware` transversaux (validate, sanitize, error) et des `utils` réutilisables.
- **Communication Angular** centralisée dans les services (`student.service`, `stats.service`) via `HttpClient` ; un **intercepteur HTTP** normalise les erreurs pour des messages cohérents.
- **Validation** côté serveur avec **Zod** (source de vérité) et validations de formulaire côté Angular pour un retour instantané.
- **Sécurité** : Helmet, CORS, rate limiting, limites de taille de corps, sanitization des requêtes, requêtes Supabase paramétrées (anti-injection SQL).
- **Performance** : composants standalone *lazy-loaded* au niveau des routes ; chargement à la demande des librairies d'export (PDF/Excel).

---

<div align="center">
Mini Projet INF3091 — Angular, Express & Supabase.
</div>
