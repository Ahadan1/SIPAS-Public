# Sipas-NG Monorepo

Sipas-NG is a monorepo containing:

- backend-api/ — Laravel API backend (Vite + PHP Artisan)
- testing/ — React/Next.js playground for the upcoming frontend
- docs/ — Architecture, API parity, data model, and schema docs

For API endpoints, migration steps, and architecture notes, see:

- `api-endpoints.md`
- `database-migration.md`
- `frontend-architecture.md`
- `docs/` folder

Requirements

- PHP 8.2+ and Composer
- Node.js 18+ and a package manager
- MySQL/MariaDB (XAMPP OK on Windows)
- Git

Project structure

```text
Sipas-NG/
├─ backend-api/     # Laravel app (artisan, vite)
├─ testing/         # React/Next.js playground
├─ docs/            # Specs, schemas, plans
└─ *.md             # Root-level docs
```

Setup — Backend API (Laravel) in `backend-api/`

1) Copy `.env.example` to `.env` and adjust DB credentials
2) Install dependencies

```bash
composer install
npm install            # or pnpm install
```

3) Generate app key and run migrations/seeders

```bash
php artisan key:generate
php artisan migrate --seed
```

4) Run dev servers

```bash
php artisan serve      # API http://127.0.0.1:8000
npm run dev            # Vite dev (if used)
```

Setup — Testing Frontend in `testing/`

```bash
npm install
npm run dev
```

Conventions

- Use feature branches and PRs
- Keep API contract in sync with `api-endpoints.md`
- Record DB changes in migrations and update `database-migration.md`